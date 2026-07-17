# Puck Visual Editing (Phase 1: Homepage) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the public homepage editable by non-technical staff via Puck's drag-and-drop editor inside the Hub, with a draft → preview → publish flow and layouts stored in Supabase.

**Architecture:** A new `pages` table holds per-slug Puck documents (`draft_data`, `published_data`). Existing homepage sections are extracted into prop-driven block components registered in a Puck `Config`. The Hub gets a staff-gated editor (`<Puck>`) + preview; the public homepage renders `published_data` with `<Render>` in a Server Component. Edits are seeded from the current design so nothing changes visually at launch.

**Tech Stack:** Next.js 16 (App Router), React 19, `@measured/puck`, Supabase (Postgres + Storage), Bun, Tailwind v4.

## Global Constraints

- No `any` — use `unknown`/type guards or explicit types (verbatim from CLAUDE.md).
- Every mutating server action calls `requireStaff()`; route handlers use `requireStaffApi()`.
- All new tables: RLS enabled, no anon policies (default-deny); server reads via service-role client.
- Public pages read `published_data` only; the editor reads/writes `draft_data`.
- Style options are constrained (select/enum fields) — no arbitrary CSS.
- Run `bun run typecheck` and `bun test tests/` before each commit of non-trivial work.
- Puck `Data` shape is `{ root: { props: {...} }, content: Array<{ type: string; props: { id: string; ...} }>, zones?: {} }`.

---

### Task 1: `pages` table + types + RLS lockdown

**Files:**
- Create: `supabase/migrations/20260716000000_pages.sql`
- Modify: `src/lib/cms/types.ts` (append `PageRow`)
- Modify: `tests/integration/rls.test.ts` (add `pages` to lockdown list)
- Test: `tests/integration/rls.test.ts`

**Interfaces:**
- Produces: table `public.pages(id, slug, title, draft_data jsonb, published_data jsonb, updated_at, updated_by)`; TS type `PageRow`.

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/20260716000000_pages.sql
-- Editable public pages: each row is a Puck document for one slug. draft_data is
-- what the editor works on; published_data is what the public site renders.
create table if not exists public.pages (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  title          text not null,
  draft_data     jsonb not null default '{"root":{"props":{}},"content":[]}'::jsonb,
  published_data jsonb,
  updated_at     timestamptz not null default now(),
  updated_by     uuid references auth.users (id) on delete set null
);
alter table public.pages enable row level security;

drop trigger if exists pages_set_updated_at on public.pages;
create trigger pages_set_updated_at
  before update on public.pages
  for each row execute function public.set_updated_at();

-- Public bucket for images placed into pages via the editor's Image block.
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;
```

- [ ] **Step 2: Apply the migration**

Run:
```bash
set -a; source .env.local; set +a
psql "${POSTGRES_URL_NON_POOLING:-$POSTGRES_URL}" -v ON_ERROR_STOP=1 -f supabase/migrations/20260716000000_pages.sql
```
Expected: `CREATE TABLE`, `CREATE TRIGGER`, `INSERT 0 1` (or bucket already exists).

- [ ] **Step 3: Add the `PageRow` type**

Append to `src/lib/cms/types.ts`:
```ts
import type { Data as PuckData } from "@measured/puck";

export type PageRow = {
  id: string;
  slug: string;
  title: string;
  draft_data: PuckData;
  published_data: PuckData | null;
  updated_at: string;
  updated_by: string | null;
};
```
(If `@measured/puck` is not yet installed, temporarily type `draft_data`/`published_data` as `unknown` and tighten in Task 2 after install. Prefer installing Puck first — reorder Task 2 before this step if needed.)

- [ ] **Step 4: Add `pages` to the RLS anon-deny test**

In `tests/integration/rls.test.ts`, add `"pages"` to the `TABLES` array, and add:
```ts
  test("anon cannot insert into pages", async () => {
    const supabase = anonClient();
    const { error } = await supabase.from("pages").insert({ slug: "x", title: "x" });
    expect(error).toBeTruthy();
  });

  test("anon cannot upload to site-assets bucket", async () => {
    const supabase = anonClient();
    const { error } = await supabase.storage
      .from("site-assets")
      .upload(`anon-${Date.now()}.txt`, new Blob(["nope"]));
    expect(error).toBeTruthy();
  });
```

- [ ] **Step 5: Run the RLS test**

Run: `bun test tests/integration/rls.test.ts`
Expected: PASS (anon cannot read/write `pages`, cannot upload to `site-assets`).

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20260716000000_pages.sql src/lib/cms/types.ts tests/integration/rls.test.ts
git commit -m "Add pages table + site-assets bucket for Puck visual editing"
```

---

### Task 2: Install Puck and add a render smoke test

**Files:**
- Modify: `package.json` (dependency)
- Create: `src/lib/puck/config.tsx`
- Test: `tests/unit/puck-config.test.ts`

**Interfaces:**
- Produces: `export const config: Config` and `export type RootProps` from `src/lib/puck/config.tsx`; Puck CSS import path `@measured/puck/puck.css`.

- [ ] **Step 1: Install Puck**

Run: `bun add @measured/puck`
Expected: adds `@measured/puck` to `package.json` dependencies.

- [ ] **Step 2: Write a failing test for a minimal config**

```ts
// tests/unit/puck-config.test.ts
import { test, expect, describe } from "bun:test";
import { config } from "../../src/lib/puck/config";

describe("puck config", () => {
  test("registers the homepage section blocks", () => {
    const keys = Object.keys(config.components);
    for (const b of ["Hero", "FeatureCards", "SermonBand", "CommunityCarousel", "SocialBand", "ConnectCTA"]) {
      expect(keys).toContain(b);
    }
  });
  test("every component has a render function and defaultProps", () => {
    for (const [name, c] of Object.entries(config.components)) {
      expect(typeof c.render, `${name}.render`).toBe("function");
      expect(c.defaultProps, `${name}.defaultProps`).toBeDefined();
    }
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `bun test tests/unit/puck-config.test.ts`
Expected: FAIL (cannot find `src/lib/puck/config`).

- [ ] **Step 4: Create a minimal config stub**

```tsx
// src/lib/puck/config.tsx
import type { Config } from "@measured/puck";

export type RootProps = { title?: string };

// Components are filled in by Task 4 once the block components exist.
// Stub entries keep the config importable and the smoke test meaningful.
export const config: Config = {
  components: {},
};
```
This stub will FAIL the test (empty components) — that is expected; Task 4 fills it in. To keep TDD honest, mark Task 2's test as the target that Task 4 satisfies, and here only assert the module imports:

Replace the test body temporarily with an import assertion:
```ts
test("config module imports", async () => {
  const mod = await import("../../src/lib/puck/config");
  expect(mod.config).toBeDefined();
  expect(mod.config.components).toBeDefined();
});
```

- [ ] **Step 5: Run test to verify it passes**

Run: `bun test tests/unit/puck-config.test.ts`
Expected: PASS (import assertion). The full block assertions are enabled in Task 4.

- [ ] **Step 6: Commit**

```bash
git add package.json bun.lock src/lib/puck/config.tsx tests/unit/puck-config.test.ts
git commit -m "Install Puck and scaffold visual-editor config"
```

---

### Task 3: Extract homepage sections into prop-driven block components

**Files:**
- Create: `src/components/site/blocks/HeroBlock.tsx`
- Create: `src/components/site/blocks/FeatureCardsBlock.tsx`
- Create: `src/components/site/blocks/SermonBandBlock.tsx`
- Create: `src/components/site/blocks/CommunityCarouselBlock.tsx`
- Create: `src/components/site/blocks/SocialBandBlock.tsx`
- Create: `src/components/site/blocks/ConnectCTABlock.tsx`
- Modify: `src/app/(marketing)/page.tsx` (import + use the extracted blocks so behavior is unchanged)

**Interfaces:**
- Produces prop-driven components. Exact prop types (consumed by Task 4):
  - `HeroBlock({ headline, subtext, ctaLabel, ctaHref, videoSrc, posterSrc }: { headline: string; subtext: string; ctaLabel: string; ctaHref: string; videoSrc: string; posterSrc: string })`
  - `FeatureCardsBlock({ cards }: { cards: Array<{ id: string; title: string; body: string; href: string; icon: "community" | "mission" | "sundays" }> })`
  - `SermonBandBlock({ heading, blurb, ctaLabel, ctaHref, seriesLabel, seriesTitle, seriesBody, videoSrc }: {...all string})`
  - `CommunityCarouselBlock({ eyebrow, heading, body, ctaLabel, ctaHref }: {...all string})` (uses `COMMUNITY_PHOTOS` from `@/lib/photos` internally)
  - `SocialBandBlock({ heading, ctaLabel, href }: {...all string})`
  - `ConnectCTABlock({ blurb, ctaLabel, ctaHref }: {...all string})`

- [ ] **Step 1: Create `HeroBlock.tsx`**

Move the JSX currently in the `Hero()` function of `src/app/(marketing)/page.tsx` into this component, replacing the hardcoded literals with props. Keep the `<video>` background + gradient + animation classes exactly as they are today.

```tsx
// src/components/site/blocks/HeroBlock.tsx
import Link from "next/link";

export type HeroBlockProps = {
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  videoSrc: string;
  posterSrc: string;
};

export function HeroBlock({ headline, subtext, ctaLabel, ctaHref, videoSrc, posterSrc }: HeroBlockProps) {
  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-slate">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay muted loop playsInline preload="auto" poster={posterSrc} aria-hidden="true"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/60 to-charcoal/30" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
        <h1 className="animate-rise font-display text-5xl font-bold leading-none text-white sm:text-7xl" style={{ animationDelay: "0.1s" }}>
          {headline}
        </h1>
        <p className="animate-rise mt-5 max-w-xl text-lg font-medium uppercase tracking-[0.15em] text-white/85 sm:text-2xl" style={{ animationDelay: "0.25s" }}>
          {subtext}
        </p>
        <div className="animate-rise mt-9" style={{ animationDelay: "0.4s" }}>
          <Link href={ctaHref} className="inline-block bg-white px-9 py-4 text-sm font-bold uppercase tracking-widest text-slate transition-colors hover:bg-brand hover:text-white">
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create the remaining five block components**

For each, move the corresponding `page.tsx` function body (`FeatureCards`, `SermonBand`, `Different`, `SocialBand`, `ConnectCTA`) into its block file, replacing hardcoded literals with the prop names listed in **Interfaces** above. Rules:
- `FeatureCardsBlock`: map the existing `FEATURES` array to the `cards` prop; keep the inline SVG icons in a local `ICONS` record keyed by `"community" | "mission" | "sundays"` (move the three existing `icon` JSX values there).
- `SermonBandBlock`: the background `<Image src="/images/worship-night.webp">` stays; expose `videoSrc` only if you switch it to video — otherwise keep the image hardcoded and drop `videoSrc` from props (update the interface accordingly).
- `CommunityCarouselBlock`: keep `import { COMMUNITY_PHOTOS } from "@/lib/photos"` and `<Carousel images={COMMUNITY_PHOTOS} />` internally; only the surrounding copy is prop-driven.
- `SocialBandBlock`, `ConnectCTABlock`: straight extraction with the listed string props. Keep `target/rel` on the external Instagram link.

(Reproduce each section's current JSX verbatim from `page.tsx`, swapping only the literal strings/links for the prop identifiers.)

- [ ] **Step 3: Rewire `page.tsx` to use the blocks (unchanged output)**

Temporarily (until Task 7 switches to `<Render>`), replace the inline section functions with the extracted components using the current literals as props, so the page looks identical. Example for Hero:
```tsx
<HeroBlock
  headline="Welcome to H2O"
  subtext="We are a church on campus at Ohio State"
  ctaLabel="Get Connected"
  ctaHref="#connect"
  videoSrc="/video/columbus-drone.mp4"
  posterSrc="/video/columbus-drone-poster.webp"
/>
```
Do the same for the other five, copying current literal values.

- [ ] **Step 4: Typecheck + visual check**

Run: `bun run typecheck` → Expected: no errors.
Run the dev server and confirm the homepage is visually unchanged:
```bash
PORT=3005 bun run dev &
# open http://localhost:3005 and verify hero video, cards, sermon band, carousel, social, CTA all render as before
```

- [ ] **Step 5: Commit**

```bash
git add src/components/site/blocks/ "src/app/(marketing)/page.tsx"
git commit -m "Extract homepage sections into prop-driven block components"
```

---

### Task 4: Fill in the Puck config with the block components

**Files:**
- Modify: `src/lib/puck/config.tsx`
- Modify: `tests/unit/puck-config.test.ts` (restore the full block assertions from Task 2 Step 2)

**Interfaces:**
- Consumes: the six block components + their prop types from Task 3.
- Produces: `config: Config` with `components` for each block, each with `fields`, `defaultProps` (current homepage literals), and `render` delegating to the block component.

- [ ] **Step 1: Restore the full block assertions**

Revert `tests/unit/puck-config.test.ts` to the two tests written in Task 2 Step 2 (checks the six component keys exist and each has `render` + `defaultProps`).

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/unit/puck-config.test.ts`
Expected: FAIL (`config.components` is empty).

- [ ] **Step 3: Implement the config**

```tsx
// src/lib/puck/config.tsx
import type { Config } from "@measured/puck";
import { HeroBlock, type HeroBlockProps } from "@/components/site/blocks/HeroBlock";
import { FeatureCardsBlock } from "@/components/site/blocks/FeatureCardsBlock";
import { SermonBandBlock } from "@/components/site/blocks/SermonBandBlock";
import { CommunityCarouselBlock } from "@/components/site/blocks/CommunityCarouselBlock";
import { SocialBandBlock } from "@/components/site/blocks/SocialBandBlock";
import { ConnectCTABlock } from "@/components/site/blocks/ConnectCTABlock";

type Props = {
  Hero: HeroBlockProps;
  FeatureCards: { cards: { id: string; title: string; body: string; href: string; icon: "community" | "mission" | "sundays" }[] };
  SermonBand: { heading: string; blurb: string; ctaLabel: string; ctaHref: string; seriesLabel: string; seriesTitle: string; seriesBody: string };
  CommunityCarousel: { eyebrow: string; heading: string; body: string; ctaLabel: string; ctaHref: string };
  SocialBand: { heading: string; ctaLabel: string; href: string };
  ConnectCTA: { blurb: string; ctaLabel: string; ctaHref: string };
};

export const config: Config<Props> = {
  components: {
    Hero: {
      fields: {
        headline: { type: "text" },
        subtext: { type: "textarea" },
        ctaLabel: { type: "text" },
        ctaHref: { type: "text" },
        videoSrc: { type: "text" },
        posterSrc: { type: "text" },
      },
      defaultProps: {
        headline: "Welcome to H2O",
        subtext: "We are a church on campus at Ohio State",
        ctaLabel: "Get Connected",
        ctaHref: "#connect",
        videoSrc: "/video/columbus-drone.mp4",
        posterSrc: "/video/columbus-drone-poster.webp",
      },
      render: (props) => <HeroBlock {...props} />,
    },
    FeatureCards: {
      fields: {
        cards: {
          type: "array",
          arrayFields: {
            title: { type: "text" },
            body: { type: "textarea" },
            href: { type: "text" },
            icon: { type: "select", options: [
              { label: "Community", value: "community" },
              { label: "Mission", value: "mission" },
              { label: "Sundays", value: "sundays" },
            ] },
          },
        },
      },
      defaultProps: {
        cards: [
          { id: "community", title: "Our Community", body: "As a church body, we live life together. Our Bible studies and community groups meet throughout the week on different parts of campus. Click below for more info!", href: "/groups", icon: "community" },
          { id: "mission", title: "Our Mission", body: "We are a local church body committed to cultivating a Christlike community at OSU to grow His kingdom wherever we go.", href: "/who-we-are", icon: "mission" },
          { id: "sundays", title: "Sundays", body: "We gather together on Sunday mornings to worship together and connect as a church community!", href: "/#sundays", icon: "sundays" },
        ],
      },
      render: (props) => <FeatureCardsBlock {...props} />,
    },
    SermonBand: {
      fields: {
        heading: { type: "text" }, blurb: { type: "textarea" },
        ctaLabel: { type: "text" }, ctaHref: { type: "text" },
        seriesLabel: { type: "text" }, seriesTitle: { type: "text" }, seriesBody: { type: "textarea" },
      },
      defaultProps: {
        heading: "Listen to Past Sermons",
        blurb: "Missed a Sunday, or want to revisit a message? Every sermon is available to watch and listen wherever you are.",
        ctaLabel: "Listen to Past Sermons", ctaHref: "/sermons",
        seriesLabel: "Current Series", seriesTitle: "The Real Gospel",
        seriesBody: "We've heard the call to “Go.” Now it's time to discover what powers the mission…",
      },
      render: (props) => <SermonBandBlock {...props} />,
    },
    CommunityCarousel: {
      fields: {
        eyebrow: { type: "text" }, heading: { type: "textarea" }, body: { type: "textarea" },
        ctaLabel: { type: "text" }, ctaHref: { type: "text" },
      },
      defaultProps: {
        eyebrow: "What's Different About H2O?",
        heading: "We are a campus-focused church community",
        body: "H2O Church was founded in 2008 as a campus-focused church…",
        ctaLabel: "Learn More", ctaHref: "/who-we-are",
      },
      render: (props) => <CommunityCarouselBlock {...props} />,
    },
    SocialBand: {
      fields: { heading: { type: "text" }, ctaLabel: { type: "text" }, href: { type: "text" } },
      defaultProps: { heading: "Follow Us on Social Media", ctaLabel: "Follow Us on Instagram", href: "https://instagram.com/h2ocolumbus" },
      render: (props) => <SocialBandBlock {...props} />,
    },
    ConnectCTA: {
      fields: { blurb: { type: "textarea" }, ctaLabel: { type: "text" }, ctaHref: { type: "text" } },
      defaultProps: { blurb: "New Here? As a local church, we live life together in community.", ctaLabel: "Join a Group", ctaHref: "/groups" },
      render: (props) => <ConnectCTABlock {...props} />,
    },
  },
};
```
Copy the full `seriesBody`, `blurb`, and `body` strings verbatim from the current `page.tsx` (the `…` above is shorthand — use the real text).

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test tests/unit/puck-config.test.ts` → Expected: PASS.

- [ ] **Step 5: Typecheck**

Run: `bun run typecheck` → Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/puck/config.tsx tests/unit/puck-config.test.ts
git commit -m "Register homepage blocks in Puck config with on-brand defaults"
```

---

### Task 5: Page server actions (load / save draft / publish) + image upload

**Files:**
- Create: `src/lib/cms/actions/pages.ts`
- Test: `tests/integration/pages.test.ts`

**Interfaces:**
- Produces:
  - `getPageDraft(slug: string): Promise<PuckData>` — server (staff), returns `draft_data` (or default doc).
  - `savePageDraft(slug: string, data: PuckData): Promise<void>` — staff, writes `draft_data`.
  - `publishPage(slug: string): Promise<void>` — staff, copies `draft_data` → `published_data`, revalidates `/`.
  - `uploadSiteAsset(fd: FormData): Promise<{ url: string }>` — staff, uploads image to `site-assets`.
  - `getPublishedPage(slug: string): Promise<PuckData | null>` — public read of `published_data`.

- [ ] **Step 1: Write failing integration test**

```ts
// tests/integration/pages.test.ts
import { test, expect, describe, afterAll } from "bun:test";
import { hasDbEnv, serviceClient, TEST_MARK } from "./helpers";

describe.skipIf(!hasDbEnv())("pages module (real database)", () => {
  const sb = serviceClient();
  const slug = `zz-${TEST_MARK}-home`;
  const draft = { root: { props: {} }, content: [{ type: "Hero", props: { id: "Hero-1", headline: "Hi" } }] };

  afterAll(async () => { await sb.from("pages").delete().ilike("slug", `%${TEST_MARK}%`); });

  test("insert draft, publish copies draft to published", async () => {
    await sb.from("pages").insert({ slug, title: "Home", draft_data: draft });
    await sb.from("pages").update({ published_data: draft }).eq("slug", slug);
    const { data } = await sb.from("pages").select("draft_data,published_data").eq("slug", slug).single();
    expect(data!.published_data).toEqual(draft);
    expect(data!.draft_data).toEqual(draft);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/integration/pages.test.ts` → Expected: FAIL (table row shape / until logic exists). If DB env is absent it will skip — ensure `.env.local` present so it runs.

- [ ] **Step 3: Implement the actions**

```ts
// src/lib/cms/actions/pages.ts
"use server";
import { revalidatePath } from "next/cache";
import type { Data as PuckData } from "@measured/puck";
import { requireStaff } from "@/lib/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { slugify } from "@/lib/cms/slug";

const EMPTY: PuckData = { root: { props: {} }, content: [] };
const ASSET_BUCKET = "site-assets";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export async function getPageDraft(slug: string): Promise<PuckData> {
  await requireStaff();
  const supabase = createAdminClient();
  const { data } = await supabase.from("pages").select("draft_data").eq("slug", slug).maybeSingle();
  return (data?.draft_data as PuckData) ?? EMPTY;
}

export async function savePageDraft(slug: string, data: PuckData): Promise<void> {
  const profile = await requireStaff();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("pages")
    .update({ draft_data: data, updated_by: profile.userId })
    .eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/pages/${slug}/edit`);
}

export async function publishPage(slug: string): Promise<void> {
  const profile = await requireStaff();
  const supabase = createAdminClient();
  const { data } = await supabase.from("pages").select("draft_data").eq("slug", slug).single();
  const { error } = await supabase
    .from("pages")
    .update({ published_data: data?.draft_data ?? EMPTY, updated_by: profile.userId })
    .eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath(slug === "home" ? "/" : `/${slug}`);
}

export async function uploadSiteAsset(fd: FormData): Promise<{ url: string }> {
  await requireStaff();
  const file = fd.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("No file provided");
  if (!file.type.startsWith("image/")) throw new Error("Asset must be an image");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Image too large (max 10 MB)");
  const supabase = createAdminClient();
  const ext = (file.name.split(".").pop() ?? "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  const path = `${slugify(file.name) || "asset"}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(ASSET_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return { url: supabase.storage.from(ASSET_BUCKET).getPublicUrl(path).data.publicUrl };
}

export async function getPublishedPage(slug: string): Promise<PuckData | null> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("pages").select("published_data").eq("slug", slug).maybeSingle();
  return (data?.published_data as PuckData) ?? null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test tests/integration/pages.test.ts` → Expected: PASS.

- [ ] **Step 5: Typecheck + commit**

Run: `bun run typecheck` → Expected: no errors.
```bash
git add src/lib/cms/actions/pages.ts tests/integration/pages.test.ts
git commit -m "Add pages server actions: draft/publish + site-asset upload"
```

---

### Task 6: Hub editor — Pages list, edit (client `<Puck>`), preview

**Files:**
- Create: `src/app/admin/(dashboard)/pages/page.tsx` (list)
- Create: `src/app/admin/(dashboard)/pages/[slug]/edit/page.tsx` (server: loads draft)
- Create: `src/app/admin/(dashboard)/pages/[slug]/edit/Editor.tsx` (client: `<Puck>`)
- Create: `src/app/admin/(dashboard)/pages/[slug]/preview/page.tsx` (server: `<Render>` of draft)
- Modify: `src/components/admin/AdminSidebar.tsx` (add "Pages" nav)

**Interfaces:**
- Consumes: `getPageDraft`, `savePageDraft`, `publishPage`, `config`.
- Produces: staff-gated editor routes under `/admin/pages`.

- [ ] **Step 1: Add "Pages" to the sidebar**

In `src/components/admin/AdminSidebar.tsx` `NAV` array, after the `Dashboard` entry add:
```ts
  { label: "Pages", href: "/admin/pages", icon: "M4 5h16v14H4zM4 9h16M9 9v10" },
```

- [ ] **Step 2: Create the Pages list**

```tsx
// src/app/admin/(dashboard)/pages/page.tsx
import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pages — H2O Hub" };

export default async function PagesList() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("pages").select("slug,title,published_data,updated_at").order("slug");
  const pages = data ?? [];
  return (
    <div>
      <h1 className="font-display text-4xl font-extrabold text-ink">Pages</h1>
      <p className="mt-1 text-ink/60">Edit the public website with drag &amp; drop.</p>
      <div className="mt-8 grid gap-4">
        {pages.map((p) => (
          <Link key={p.slug} href={`/admin/pages/${p.slug}/edit`}
            className="flex items-center justify-between rounded-3xl border border-ink/10 bg-cream p-6 hover:border-water/30">
            <div>
              <h2 className="font-display text-xl font-bold text-ink">{p.title}</h2>
              <p className="mt-1 text-sm text-ink/55">/{p.slug === "home" ? "" : p.slug}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${p.published_data ? "bg-water/10 text-brand" : "bg-ink/5 text-ink/40"}`}>
              {p.published_data ? "Published" : "Draft"}
            </span>
          </Link>
        ))}
        {pages.length === 0 ? <div className="rounded-3xl border border-dashed border-ink/20 p-16 text-center text-ink/50">No editable pages yet. Run the seed script.</div> : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create the editor server page + client Editor**

```tsx
// src/app/admin/(dashboard)/pages/[slug]/edit/page.tsx
import { getPageDraft } from "@/lib/cms/actions/pages";
import { Editor } from "./Editor";

export const metadata = { title: "Edit page — H2O Hub" };

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPageDraft(slug);
  return <Editor slug={slug} data={data} />;
}
```

```tsx
// src/app/admin/(dashboard)/pages/[slug]/edit/Editor.tsx
"use client";
import { Puck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { useRouter } from "next/navigation";
import { config } from "@/lib/puck/config";
import { savePageDraft, publishPage } from "@/lib/cms/actions/pages";

export function Editor({ slug, data }: { slug: string; data: Data }) {
  const router = useRouter();
  return (
    <Puck
      config={config}
      data={data}
      headerTitle={`Editing: ${slug}`}
      onPublish={async (next: Data) => {
        await savePageDraft(slug, next);
        await publishPage(slug);
        router.push("/admin/pages");
      }}
    />
  );
}
```
(Note: Puck's "Publish" button calls `onPublish`. We save the draft then publish in one step. If a separate save-without-publish is desired, add a header action via the `overrides` prop calling `savePageDraft` only — optional, not required for Phase 1.)

- [ ] **Step 4: Create the preview route**

```tsx
// src/app/admin/(dashboard)/pages/[slug]/preview/page.tsx
import { Render } from "@measured/puck";
import { getPageDraft } from "@/lib/cms/actions/pages";
import { config } from "@/lib/puck/config";

export const dynamic = "force-dynamic";
export const metadata = { title: "Preview — H2O Hub" };

export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPageDraft(slug);
  return <Render config={config} data={data} />;
}
```

- [ ] **Step 5: Verify in browser (staff session required)**

Run dev on a free port, sign in as staff/admin, visit `/admin/pages`, open the homepage editor, drag a block, click Publish, confirm redirect to the list. Verify `/admin/pages/home/preview` renders the draft.
Expected: editor loads with Puck CSS, blocks render in the canvas, publish succeeds.

- [ ] **Step 6: Typecheck + commit**

Run: `bun run typecheck` → Expected: no errors.
```bash
git add "src/app/admin/(dashboard)/pages" src/components/admin/AdminSidebar.tsx
git commit -m "Add Hub Pages editor (Puck), preview, and publish"
```

---

### Task 7: Public homepage renders from `published_data`

**Files:**
- Modify: `src/app/(marketing)/page.tsx`

**Interfaces:**
- Consumes: `getPublishedPage`, `config`, `<Render>`.

- [ ] **Step 1: Replace the homepage body with Puck render + fallback**

```tsx
// src/app/(marketing)/page.tsx
import { Render } from "@measured/puck";
import { getPublishedPage } from "@/lib/cms/actions/pages";
import { config } from "@/lib/puck/config";
import { DefaultHome } from "./DefaultHome";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getPublishedPage("home");
  if (!data) return <DefaultHome />;
  return <main id="top"><Render config={config} data={data} /></main>;
}
```
Move the current block-based homepage JSX (from Task 3 Step 3) into `src/app/(marketing)/DefaultHome.tsx` as `export function DefaultHome()`, so there is always a safe fallback before the first publish/seed.

- [ ] **Step 2: Verify**

With no `home` row published, `/` shows `DefaultHome`. After Task 8 seeds+publishes, `/` renders from `published_data`. Confirm both visually identical.

- [ ] **Step 3: Typecheck + commit**

Run: `bun run typecheck` → Expected: no errors.
```bash
git add "src/app/(marketing)/page.tsx" "src/app/(marketing)/DefaultHome.tsx"
git commit -m "Render public homepage from published Puck data with fallback"
```

---

### Task 8: Seed the current homepage as Puck data

**Files:**
- Create: `scripts/seed-pages.ts`

**Interfaces:**
- Consumes: `config` defaults (the Puck doc must use the same prop names/defaults from Task 4).

- [ ] **Step 1: Write the seed script**

```ts
// scripts/seed-pages.ts
// Seed the "home" page with a Puck document that reproduces the current design,
// into both draft_data and published_data. Idempotent by slug.
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Missing env"); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });

const homeData = {
  root: { props: {} },
  content: [
    { type: "Hero", props: { id: "Hero-1", headline: "Welcome to H2O", subtext: "We are a church on campus at Ohio State", ctaLabel: "Get Connected", ctaHref: "#connect", videoSrc: "/video/columbus-drone.mp4", posterSrc: "/video/columbus-drone-poster.webp" } },
    { type: "FeatureCards", props: { id: "FeatureCards-1", cards: [
      { id: "community", title: "Our Community", body: "As a church body, we live life together…", href: "/groups", icon: "community" },
      { id: "mission", title: "Our Mission", body: "We are a local church body committed to cultivating a Christlike community at OSU…", href: "/who-we-are", icon: "mission" },
      { id: "sundays", title: "Sundays", body: "We gather together on Sunday mornings…", href: "/#sundays", icon: "sundays" },
    ] } },
    { type: "SermonBand", props: { id: "SermonBand-1", heading: "Listen to Past Sermons", blurb: "Missed a Sunday…", ctaLabel: "Listen to Past Sermons", ctaHref: "/sermons", seriesLabel: "Current Series", seriesTitle: "The Real Gospel", seriesBody: "We've heard the call to Go…" } },
    { type: "CommunityCarousel", props: { id: "CommunityCarousel-1", eyebrow: "What's Different About H2O?", heading: "We are a campus-focused church community", body: "H2O Church was founded in 2008…", ctaLabel: "Learn More", ctaHref: "/who-we-are" } },
    { type: "SocialBand", props: { id: "SocialBand-1", heading: "Follow Us on Social Media", ctaLabel: "Follow Us on Instagram", href: "https://instagram.com/h2ocolumbus" } },
    { type: "ConnectCTA", props: { id: "ConnectCTA-1", blurb: "New Here? As a local church, we live life together in community.", ctaLabel: "Join a Group", ctaHref: "/groups" } },
  ],
};

const { error } = await sb.from("pages").upsert(
  { slug: "home", title: "Homepage", draft_data: homeData, published_data: homeData },
  { onConflict: "slug" },
);
if (error) { console.error(error.message); process.exit(1); }
console.log("✓ Seeded home page");
```
Fill in the full body strings verbatim from the config defaults (Task 4) so the seed matches exactly.

- [ ] **Step 2: Run the seed**

Run: `bun scripts/seed-pages.ts`
Expected: `✓ Seeded home page`.

- [ ] **Step 3: Verify the public homepage is unchanged**

Load `/` (dynamic) and confirm it renders from `published_data`, pixel-identical to `DefaultHome`.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-pages.ts
git commit -m "Seed homepage Puck document matching the current design"
```

---

### Task 9: Full verification

- [ ] **Step 1: Typecheck**

Run: `bun run typecheck` → Expected: no errors.

- [ ] **Step 2: Full test suite**

Run: `bun test tests/` → Expected: all pass (incl. new `pages` integration, RLS anon-deny for `pages` + `site-assets`, puck-config unit).

- [ ] **Step 3: End-to-end manual check**

Sign in as staff → `/admin/pages` → edit homepage → change the hero headline → Publish → confirm the public `/` shows the new headline; revert.
Confirm CSP allows Puck (it imports its own CSS from `/_next`; no external hosts). Check the browser console for CSP violations on `/admin/pages/home/edit`.

- [ ] **Step 4: Commit any fixes; push**

```bash
git push origin main
```

---

## Phase 2 (follow-up plan, not in this document)

After Phase 1 ships: add `PageHero` + `Prose` + generic blocks (Heading, Text, Image, Button, Spacer, Columns), convert `/who-we-are`, `/what-we-believe`, `/our-team` to render from `pages`, and seed each. Will be written as `docs/superpowers/plans/<date>-puck-about-pages.md`.

## Self-Review Notes

- **Spec coverage:** data model (Task 1), block library (Tasks 3–4), editor+preview+publish (Task 6), public render (Task 7), seed (Task 8), auth/RLS (Tasks 1,5,6), testing (Tasks 1,5,9). About pages = Phase 2 per spec phasing.
- **CSP:** Puck ships its own CSS bundled by Next (served from `/_next`, i.e. `'self'`); no new CSP origins needed. Verified as a check in Task 9 Step 3.
- **Type consistency:** `PuckData` used consistently; block prop names match between Task 3 interfaces, Task 4 config, and Task 8 seed.
- **Known caveat to validate during execution:** Puck `<Render>` inside an RSC with client-only blocks (Carousel, Header) — the block components already carry `"use client"` where needed (Carousel does). If `<Render>` errors in RSC, split into client/server configs per Puck's server-components guide (noted in spec risks).
