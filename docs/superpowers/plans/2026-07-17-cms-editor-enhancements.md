# CMS Editor Enhancements (Phase 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix drag-reordering, add persistent version history + revert, generic blocks, in-editor image upload, editable About pages, and draft preview to the Puck-based H2O Hub page editor.

**Architecture:** A single shared Puck `config` registers all blocks. The editor renders full-bleed (fixing reorder). Page data lives in `public.pages`; each publish snapshots into `public.page_versions`. All DB access is server-side via the service-role admin client behind `requireStaff()`.

**Tech Stack:** Next.js 16 App Router, React 19, Supabase (Postgres + Auth + Storage), `@measured/puck@0.20.2`, Tailwind v4, Bun test runner.

## Global Constraints

- **No `any`** — use `unknown` + narrowing or explicit types. Puck data typed as `Data` from `@measured/puck`.
- Every server action calls `requireStaff()` **before** any DB access; throws generic error messages (never raw DB errors).
- `page_versions` has RLS enabled with **zero policies** (default-deny); reached only via `createAdminClient()`. Never expose to anon.
- Server Components fetch data; `"use client"` only on interactive leaves.
- Public CSP in `next.config.ts` is unchanged. Uploaded images come from `https://*.supabase.co` (already allowed by `img-src`).
- About-page conversion is **fidelity-preserving**: extract existing sections into dedicated blocks with copy-only fields; do not restyle. Static component becomes the fallback, exactly like `src/app/(marketing)/page.tsx` + `DefaultHome.tsx`.
- Tests per CLAUDE.md: integration for new endpoints/actions, RLS regression for the new table, unit for config + pure helpers. Full suite green before merge.

---

### Task 1: `page_versions` table migration

**Files:**
- Create: `supabase/migrations/20260717000000_page_versions.sql`

**Interfaces:**
- Produces: table `public.page_versions(id, slug, title, data, created_at, created_by)`.

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/20260717000000_page_versions.sql
-- One row per publish: a restore point holding the published Puck document.
-- RLS enabled with NO policies => default-deny; reached only via the service-role
-- admin client server-side, like public.pages.
create table if not exists public.page_versions (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null,
  title      text not null,
  data       jsonb not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);
alter table public.page_versions enable row level security;

create index if not exists page_versions_slug_created_idx
  on public.page_versions (slug, created_at desc);
```

- [ ] **Step 2: Apply the migration**

Run: `bunx supabase db push` (or the project's migration apply command). Expected: applies without error; `page_versions` exists.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260717000000_page_versions.sql
git commit -m "feat(cms): add page_versions table for publish history"
```

---

### Task 2: Page-version server actions + snapshot on publish

**Files:**
- Modify: `src/lib/cms/actions/pages.ts`
- Test: `tests/integration/page-versions.test.ts`

**Interfaces:**
- Consumes: `requireStaff()`, `createAdminClient()`, existing `publishPage`.
- Produces:
  - `type PageVersion = { id: string; slug: string; title: string; createdAt: string; authorName: string | null }`
  - `listPageVersions(slug: string): Promise<PageVersion[]>`
  - `restorePageVersion(id: string): Promise<{ slug: string }>`
  - `publishPage` now snapshots into `page_versions` and prunes to newest 50.

- [ ] **Step 1: Write the failing integration test**

`tests/integration/page-versions.test.ts` (follow the env-loading + admin-client pattern already used in `tests/integration/pages.test.ts`). Cover:
1. Publishing a page inserts exactly one `page_versions` row for that slug with the published `data`.
2. `listPageVersions(slug)` returns rows newest-first with `createdAt` + `authorName` shape.
3. `restorePageVersion(id)` copies that version's `data` into `pages.draft_data` and leaves `published_data` unchanged.
4. After 51 publishes for a slug, only 50 rows remain (prune).

Use a unique throwaway slug per test run and clean it up in `afterAll`.

- [ ] **Step 2: Run it, verify it fails**

Run: `bun test tests/integration/page-versions.test.ts`
Expected: FAIL (actions not defined / no snapshot written).

- [ ] **Step 3: Extend `pages.ts`**

Add to `src/lib/cms/actions/pages.ts`:

```ts
export type PageVersion = {
  id: string;
  slug: string;
  title: string;
  createdAt: string;
  authorName: string | null;
};

const MAX_VERSIONS_PER_SLUG = 50;
```

Modify `publishPage` so that, after the successful `update` that copies draft→published, it snapshots and prunes (still typed, still `requireStaff`):

```ts
export async function publishPage(slug: string): Promise<void> {
  const profile = await requireStaff();
  const supabase = createAdminClient();
  const { data, error: readErr } = await supabase
    .from("pages").select("draft_data, title").eq("slug", slug).single();
  if (readErr || !data) throw new Error(`Page not found: ${slug}`);
  const { error } = await supabase
    .from("pages")
    .update({ published_data: data.draft_data, updated_by: profile.userId })
    .eq("slug", slug);
  if (error) throw new Error(error.message);

  await supabase.from("page_versions").insert({
    slug,
    title: data.title,
    data: data.draft_data,
    created_by: profile.userId,
  });
  // Prune to the newest MAX_VERSIONS_PER_SLUG for this slug.
  const { data: keep } = await supabase
    .from("page_versions").select("id").eq("slug", slug)
    .order("created_at", { ascending: false })
    .range(0, MAX_VERSIONS_PER_SLUG - 1);
  if (keep && keep.length === MAX_VERSIONS_PER_SLUG) {
    const keepIds = keep.map((r) => r.id as string);
    await supabase.from("page_versions").delete().eq("slug", slug)
      .not("id", "in", `(${keepIds.join(",")})`);
  }

  revalidatePath(slug === "home" ? "/" : `/${slug}`);
}
```

Add the two new actions. `listPageVersions` joins the author name from `profiles` (best-effort; null if missing):

```ts
export async function listPageVersions(slug: string): Promise<PageVersion[]> {
  await requireStaff();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("page_versions")
    .select("id, slug, title, created_at, created_by")
    .eq("slug", slug)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const ids = [...new Set(rows.map((r) => r.created_by).filter(Boolean))] as string[];
  const names = new Map<string, string>();
  if (ids.length > 0) {
    const { data: profs } = await supabase
      .from("profiles").select("id, full_name, email").in("id", ids);
    for (const p of profs ?? []) names.set(p.id as string, (p.full_name as string) || (p.email as string) || "");
  }
  return rows.map((r) => ({
    id: r.id as string,
    slug: r.slug as string,
    title: r.title as string,
    createdAt: r.created_at as string,
    authorName: r.created_by ? names.get(r.created_by as string) ?? null : null,
  }));
}

export async function restorePageVersion(id: string): Promise<{ slug: string }> {
  const profile = await requireStaff();
  const supabase = createAdminClient();
  const { data: version, error: readErr } = await supabase
    .from("page_versions").select("slug, data").eq("id", id).single();
  if (readErr || !version) throw new Error("Version not found");
  const { error } = await supabase
    .from("pages")
    .update({ draft_data: version.data, updated_by: profile.userId })
    .eq("slug", version.slug);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/pages/${version.slug}/edit`);
  return { slug: version.slug as string };
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `bun test tests/integration/page-versions.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/cms/actions/pages.ts tests/integration/page-versions.test.ts
git commit -m "feat(cms): snapshot on publish + list/restore page versions"
```

---

### Task 3: In-editor image upload custom field

**Files:**
- Create: `src/lib/puck/fields/ImageUploadField.tsx`
- Create: `src/lib/puck/fields/imageField.ts`

**Interfaces:**
- Consumes: `uploadSiteAsset(fd: FormData): Promise<{ url: string }>` from `src/lib/cms/actions/pages.ts`.
- Produces: `imageField(label?: string)` returning a Puck custom field config usable anywhere a URL string prop is edited.

- [ ] **Step 1: Write the field component (`ImageUploadField.tsx`)**

`"use client"`. Renders the current value (small thumbnail if set), a file `<input type="file" accept="image/*">`, and an "uploading…"/error state. On file select, build `FormData` with key `file`, call `uploadSiteAsset`, then `onChange(url)`. Also allow clearing back to empty string and pasting a URL directly into a text input. Keep it a leaf client component.

```tsx
"use client";
import { useState } from "react";
import { uploadSiteAsset } from "@/lib/cms/actions/pages";

export function ImageUploadField({
  value, onChange,
}: { value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" style={{ maxHeight: 96, borderRadius: 8, objectFit: "cover" }} />
      ) : null}
      <input
        type="text" value={value} placeholder="Image URL or upload below"
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: 6 }}
      />
      <input
        type="file" accept="image/*" disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true); setErr(null);
          try {
            const fd = new FormData();
            fd.set("file", file);
            const { url } = await uploadSiteAsset(fd);
            onChange(url);
          } catch (e) {
            setErr(e instanceof Error ? e.message : "Upload failed");
          } finally {
            setBusy(false);
          }
        }}
      />
      {busy ? <span style={{ fontSize: 12 }}>Uploading…</span> : null}
      {err ? <span style={{ fontSize: 12, color: "#b91c1c" }}>{err}</span> : null}
    </div>
  );
}
```

- [ ] **Step 2: Write the field factory (`imageField.ts`)**

```ts
import type { CustomField } from "@measured/puck";
import { ImageUploadField } from "./ImageUploadField";

export function imageField(label = "Image"): CustomField<string> {
  return {
    type: "custom",
    label,
    render: ({ value, onChange }) => (
      <ImageUploadField value={value ?? ""} onChange={onChange} />
    ),
  };
}
```

If `imageField.ts` uses JSX it must be `.tsx`. Name it `imageField.tsx`.

- [ ] **Step 3: Typecheck**

Run: `bun run typecheck` (or `bunx tsc --noEmit`). Expected: no errors in the new files.

- [ ] **Step 4: Commit**

```bash
git add src/lib/puck/fields/
git commit -m "feat(cms): image-upload custom Puck field"
```

---

### Task 4: Generic content blocks

**Files:**
- Create: `src/components/site/blocks/generic/HeadingBlock.tsx`, `TextBlock.tsx`, `ImageBlock.tsx`, `ButtonBlock.tsx`, `SpacerBlock.tsx`, `ColumnsBlock.tsx`
- Modify: `src/lib/puck/config.tsx`
- Test: `tests/unit/puck-config.test.ts`

**Interfaces:**
- Consumes: `imageField` (Task 3), Puck `slot` field type for Columns.
- Produces: config components `Heading, Text, Image, Button, Spacer, Columns`.

- [ ] **Step 1: Extend the failing unit test**

In `tests/unit/puck-config.test.ts`, assert the config now includes each of
`Heading, Text, Image, Button, Spacer, Columns` and that each has a `render`
function and (except Columns, whose content is a slot) sensible `defaultProps`.

- [ ] **Step 2: Run it, verify it fails**

Run: `bun test tests/unit/puck-config.test.ts`
Expected: FAIL (components missing).

- [ ] **Step 3: Write the block components**

Each block is a plain prop-driven component using existing Tailwind design tokens
(`text-ink`, `text-brand`, `bg-paper`, container `mx-auto max-w-4xl px-5`), mirroring
the style of `src/components/site/blocks/*`. Signatures:

- `HeadingBlock({ text, level, align }: { text: string; level: "h1"|"h2"|"h3"; align: "left"|"center" })`
- `TextBlock({ text, align })` — renders paragraphs split on `\n\n`.
- `ImageBlock({ src, alt, maxWidth })` — `next/image` not required; a plain `<img>` with `className="mx-auto rounded-2xl"` is fine (uploaded URLs are external Supabase). Add the eslint-disable line.
- `ButtonBlock({ label, href, style })` — `style: "solid"|"outline"`, links via `next/link`.
- `SpacerBlock({ size })` — `size: "sm"|"md"|"lg"` → fixed heights.
- `ColumnsBlock({ left, right }: { left: Slot; right: Slot })` — renders a
  `grid gap-8 md:grid-cols-2` with the two slots. Import `type { Slot }` from `@measured/puck`.

- [ ] **Step 4: Register in `config.tsx`**

Add each to `components`, add a `categories` block for a tidy palette, and use
`imageField("Image")` for `Image.src`. Columns uses slot fields:

```tsx
Columns: {
  fields: {
    left: { type: "slot" },
    right: { type: "slot" },
  },
  defaultProps: { left: [], right: [] },
  render: ({ left: Left, right: Right }) => (
    <ColumnsBlock left={<Left />} right={<Right />} />
  ),
},
```

(Adjust `ColumnsBlock` props to accept rendered slot nodes.) Add `categories`:

```tsx
categories: {
  Homepage: { components: ["Hero", "FeatureCards", "SermonBand", "CommunityCarousel", "SocialBand", "ConnectCTA"] },
  Content: { components: ["Heading", "Text", "Image", "Button", "Spacer", "Columns"] },
},
```

Update the `Props` type with the six new component prop types. Wire `imageField`
into `Hero.posterSrc` as well (replace its `{ type: "text" }`).

- [ ] **Step 5: Run tests, verify pass**

Run: `bun test tests/unit/puck-config.test.ts` then `bun run typecheck`
Expected: PASS + no type errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/site/blocks/generic src/lib/puck/config.tsx tests/unit/puck-config.test.ts
git commit -m "feat(cms): generic content blocks + image field wiring"
```

---

### Task 5: Full-bleed editor shell + top bar (fixes reordering)

**Files:**
- Modify: `src/app/admin/(dashboard)/pages/[slug]/edit/Editor.tsx`
- Create: `src/app/admin/(dashboard)/pages/[slug]/edit/EditorTopBar.tsx`

**Interfaces:**
- Consumes: `savePageDraft`, `publishPage` (existing); `usePuck` from `@measured/puck`.
- Produces: full-viewport editor with Save draft / Publish / Preview / History actions.

- [ ] **Step 1: Rewrite `Editor.tsx`**

Wrap Puck in a fixed overlay and inject a custom action bar via
`overrides.headerActions`. Preserve `onPublish` (save+publish then return to list).

```tsx
"use client";
import { Puck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { useRouter } from "next/navigation";
import { config } from "@/lib/puck/config";
import { savePageDraft, publishPage } from "@/lib/cms/actions/pages";
import { EditorTopBar } from "./EditorTopBar";

export function Editor({ slug, data }: { slug: string; data: Data }) {
  const router = useRouter();
  return (
    <div className="fixed inset-0 z-50 bg-white">
      <Puck
        config={config}
        data={data}
        headerTitle={`Editing: ${slug}`}
        overrides={{
          headerActions: ({ children }) => (
            <>
              <EditorTopBar slug={slug} />
              {children}
            </>
          ),
        }}
        onPublish={async (next: Data) => {
          await savePageDraft(slug, next);
          await publishPage(slug);
          router.push("/admin/pages");
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Write `EditorTopBar.tsx`**

`"use client"`. Uses `usePuck()` to read `appState.data`. Buttons:
- **← Pages**: `router.push("/admin/pages")`.
- **Save draft**: `await savePageDraft(slug, appState.data)` with a saved toast/label.
- **Preview**: `await savePageDraft(slug, appState.data)` then `window.open(`/admin/pages/${slug}/preview`, "_blank")`.
- **History**: opens the History drawer (Task 6). For this task, render a disabled placeholder button; Task 6 replaces it with the working drawer trigger.

Keep Puck's default Publish button (rendered by `{children}`), so publishing still runs `onPublish`.

- [ ] **Step 3: Verify in browser**

Start dev server on a free port. Log in (`dan.luk@h2osu.org` / `kioka`), open
`/admin/pages/home/edit`. Confirm: editor fills the viewport; **dragging a block
in the outline/canvas reorders it**; Save draft persists; Publish returns to list.

- [ ] **Step 4: Commit**

```bash
git add "src/app/admin/(dashboard)/pages/[slug]/edit/"
git commit -m "feat(cms): full-bleed editor shell + action bar (fixes reorder)"
```

---

### Task 6: History drawer (restore to draft)

**Files:**
- Create: `src/app/admin/(dashboard)/pages/[slug]/edit/HistoryDrawer.tsx`
- Modify: `src/app/admin/(dashboard)/pages/[slug]/edit/EditorTopBar.tsx`

**Interfaces:**
- Consumes: `listPageVersions`, `restorePageVersion` (Task 2).
- Produces: a drawer listing versions with "Restore to draft".

- [ ] **Step 1: Write `HistoryDrawer.tsx`**

`"use client"`. Props `{ slug: string; open: boolean; onClose: () => void }`. On
open, `listPageVersions(slug)` into state. Render a right-side panel with each
version: formatted `createdAt`, `authorName ?? "Unknown"`, and a **Restore to
draft** button that calls `restorePageVersion(id)` then `window.location.reload()`
(reload re-runs `getPageDraft` so Puck re-initializes with the restored draft).
Show empty state when no versions.

- [ ] **Step 2: Wire the drawer into `EditorTopBar.tsx`**

Replace the placeholder History button with a real toggle controlling
`HistoryDrawer` open state.

- [ ] **Step 3: Verify in browser**

Publish twice (make a copy change between). Open History → two entries → Restore
the older → editor reloads showing the older copy in the draft. Confirm the
public site is unchanged until Publish.

- [ ] **Step 4: Commit**

```bash
git add "src/app/admin/(dashboard)/pages/[slug]/edit/"
git commit -m "feat(cms): version history drawer with restore-to-draft"
```

---

### Task 7: Preview buttons in the pages list

**Files:**
- Modify: `src/app/admin/(dashboard)/pages/page.tsx`

- [ ] **Step 1: Add a Preview link per row**

Each page row gets a **Preview** link (`/admin/pages/${slug}/preview`, new tab)
alongside the existing Edit affordance. Keep the row's Edit navigation intact
(move Preview into a small action cluster so it doesn't hijack the row link).

- [ ] **Step 2: Verify**

Run: `bun run typecheck`. Open `/admin/pages`; Preview opens the draft render in
a new tab.

- [ ] **Step 3: Commit**

```bash
git add "src/app/admin/(dashboard)/pages/page.tsx"
git commit -m "feat(cms): preview links on pages list"
```

---

### Task 8: Convert About page — `who-we-are`

**Files:**
- Read: `src/app/(marketing)/who-we-are/page.tsx` (source of truth for markup)
- Create: `src/components/site/blocks/about/WhoWeAreHeroBlock.tsx`, `MissionStatementBlock.tsx`, `CoreValuesBlock.tsx` (one block per existing section; names may differ — one per `<section>`/hero)
- Create: `src/app/(marketing)/who-we-are/DefaultWhoWeAre.tsx` (the current static JSX, extracted verbatim)
- Modify: `src/app/(marketing)/who-we-are/page.tsx`
- Modify: `src/lib/puck/config.tsx` (register the new About blocks; add to `categories.About`)

**Interfaces:**
- Produces: About blocks whose fields are copy only; page renders published Puck
  data with `DefaultWhoWeAre` fallback.

- [ ] **Step 1: Extract each section into a block**

For each visually distinct section in the current page (the `PageHero`, the "Our
Mission" section with the SVG underline, and the "Our Core Values" accordion
section), create a block component that renders **the exact same markup/classes**
but takes its text as props. The `AboutNav` is chrome — render it directly in the
page shell, not as a block. The values accordion items become an `array` field
(`emphasis`, `rest`, `body`).

- [ ] **Step 2: Register blocks in `config.tsx`**

Add each to `components`, add their names to `categories.About` (create the
category), extend the `Props` type. Use `imageField` for any image props.

- [ ] **Step 3: Convert the page to Puck render + fallback**

```tsx
import { Render } from "@measured/puck";
import { getPublishedPage } from "@/lib/cms/actions/pages";
import { config } from "@/lib/puck/config";
import { AboutNav } from "@/components/site/AboutNav";
import { DefaultWhoWeAre } from "./DefaultWhoWeAre";

export const dynamic = "force-dynamic";
export const metadata = { /* unchanged */ };

export default async function WhoWeArePage() {
  const data = await getPublishedPage("who-we-are");
  if (!data) return <DefaultWhoWeAre />;
  return (<main><Render config={config} data={data} /></main>);
}
```

(If `AboutNav` must appear on every published variant, include it as the first
block or render it in the page shell above `<Render>`.)

- [ ] **Step 4: Verify**

Run: `bun run typecheck`. With no `who-we-are` row seeded yet, the page renders
`DefaultWhoWeAre` (identical to today). Diff against `main` visually.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(marketing)/who-we-are/" src/components/site/blocks/about src/lib/puck/config.tsx
git commit -m "feat(cms): make who-we-are editable via Puck blocks"
```

---

### Task 9: Convert About page — `what-we-believe`

Same procedure as Task 8, for `src/app/(marketing)/what-we-believe/page.tsx`.
Read the page first; extract each section into a copy-only block; create
`DefaultWhatWeBelieve.tsx`; register blocks + `categories.About`; convert page to
`getPublishedPage("what-we-believe")` → `<Render>` / fallback.

- [ ] **Step 1:** Read the page, extract section blocks (exact markup).
- [ ] **Step 2:** Register in `config.tsx`.
- [ ] **Step 3:** Convert page + create `DefaultWhatWeBelieve.tsx`.
- [ ] **Step 4:** `bun run typecheck`; verify fallback renders identically.
- [ ] **Step 5:** Commit `feat(cms): make what-we-believe editable via Puck blocks`.

---

### Task 10: Convert About page — `our-team`

Same procedure, for `src/app/(marketing)/our-team/page.tsx`. Team members are
likely a list → use an `array` field (name, role, image via `imageField`, bio).

- [ ] **Step 1:** Read the page, extract section blocks (exact markup).
- [ ] **Step 2:** Register in `config.tsx`.
- [ ] **Step 3:** Convert page + create `DefaultOurTeam.tsx`.
- [ ] **Step 4:** `bun run typecheck`; verify fallback renders identically.
- [ ] **Step 5:** Commit `feat(cms): make our-team editable via Puck blocks`.

---

### Task 11: Seed About pages into `pages`

**Files:**
- Modify: `scripts/seed-pages.ts`

**Interfaces:**
- Consumes: the About block types/defaults registered in Tasks 8–10.

- [ ] **Step 1: Add About docs to the seed**

Extend `scripts/seed-pages.ts` to upsert `who-we-are`, `what-we-believe`,
`our-team` rows whose `content` arrays reproduce each page's current sections
using the new About blocks (mirror the `homeData` pattern; give every block a
unique `id`). Upsert into both `draft_data` and `published_data`, idempotent by
`slug`.

- [ ] **Step 2: Run the seed**

Run: `bun run scripts/seed-pages.ts` (with env). Expected: `✓ Seeded` lines for
all four pages, no error.

- [ ] **Step 3: Verify**

Visit `/who-we-are`, `/what-we-believe`, `/our-team` — each renders from
published Puck data and matches the pre-migration design. They appear in
`/admin/pages` and open in the editor.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-pages.ts
git commit -m "feat(cms): seed About pages as Puck documents"
```

---

### Task 12: RLS regression test + full verification

**Files:**
- Modify: `tests/integration/rls.test.ts`

- [ ] **Step 1: Extend the RLS test**

Add cases asserting an **anon** Supabase client cannot read from or write to
`public.page_versions` (zero rows on select; error or zero-effect on insert),
mirroring the existing `pages`/`sermons` anon-deny cases.

- [ ] **Step 2: Run the RLS test**

Run: `bun test tests/integration/rls.test.ts`
Expected: PASS (anon fully denied on `page_versions`).

- [ ] **Step 3: Full suite**

Run: `bun run typecheck && bun run lint && bun test`
Expected: all green.

- [ ] **Step 4: Browser smoke of the whole feature**

As staff: reorder blocks on `home`, upload an image into an Image block, publish,
open History and restore an older version to draft, preview the draft, and load
each About page publicly. Confirm no console CSP errors beyond the known
editor-only `rsms.me` font notice.

- [ ] **Step 5: Commit**

```bash
git add tests/integration/rls.test.ts
git commit -m "test(cms): anon-deny RLS coverage for page_versions"
```

---

## Self-review notes

- **Spec coverage:** reorder (T5), version history+revert (T1,T2,T6), generic
  blocks (T4), image upload (T3), editable About pages (T8–T11), draft preview
  (T5 top bar + T7 list). ✓
- **Type consistency:** `PageVersion` defined in T2 and consumed by T6;
  `imageField` defined in T3 and consumed by T4/T8–T10; `Slot`/`slot` used in T4
  Columns. ✓
- **Ordering:** T3 (imageField) precedes T4 (uses it); T2 (actions) precedes T6
  (drawer); About conversion (T8–T10) precedes seed (T11).
