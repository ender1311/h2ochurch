# Puck Visual Editing for the Public Site — Design

**Date:** 2026-07-16
**Status:** Approved (design); pending implementation plan

## Goal

Let non-technical staff edit the public-facing website through a drag-and-drop
editor inside the H2O Hub — reorder sections, edit copy, swap images/assets, and
adjust a small set of on-brand style options — without touching code or breaking
the layout. Powered by [Puck](https://puckeditor.com) (open-source, MIT),
self-hosted; layouts stored in Supabase; no new SaaS cost.

## Scope

**In scope (this spec):**
- Homepage (`/`)
- About pages: `/who-we-are`, `/what-we-believe`, `/our-team`

**Out of scope:**
- DB-driven pages (`/events`, `/sermons`, `/groups`, `/give`) — already structured
  with their own admin; not wrapped in Puck.
- The Hub/admin UI itself.
- Arbitrary CSS / freeform positioning (deliberately excluded — see Guardrails).

**Editing model:** block-based with **light style knobs**. Draft → preview →
publish. Editing gated to the existing `staff`/`admin` roles.

## Architecture

### 1. Data model — `pages` table (Supabase)

```
pages (
  id            uuid pk default gen_random_uuid(),
  slug          text unique not null,   -- 'home' | 'who-we-are' | 'what-we-believe' | 'our-team'
  title         text not null,
  draft_data    jsonb not null,         -- Puck document currently being edited
  published_data jsonb,                 -- Puck document shown publicly (null until first publish)
  updated_at    timestamptz not null default now(),
  updated_by    uuid references auth.users(id) on delete set null
)
```
- RLS enabled, **no anon policies** (default-deny), consistent with every other
  table. Server reads via the service-role client after authorizing the request.
- `set_updated_at` trigger on update.
- Public pages read **`published_data` only**; the editor reads/writes `draft_data`.

### 2. Block library — `src/lib/puck/config.tsx`

A Puck `Config` registering each editable unit as a component with typed fields
and light style options. Blocks **reuse existing React components** so the public
render is pixel-identical to today.

- **Branded section blocks:** `Hero` (video background), `FeatureCards`,
  `SermonBand`, `CommunityCarousel`, `SocialBand`, `ConnectCTA`, `PageHero`,
  `Prose` (rich text for About body copy).
- **Generic blocks:** `Heading`, `Text`, `Image` (uploads to Storage), `Button`,
  `Spacer`, `Columns` (2/3-up row).
- **Editable props:** copy, links, image references.
- **Light style knobs only:** background theme (from the brand palette),
  alignment, button variant. No free-form color/size/positioning.

Interactive blocks (Carousel, Header nav, Hero video) are client components used
as Puck component leaves — supported.

### 3. Editor — in the Hub (staff-gated)

- `/admin/pages` — list of editable pages with status (draft/published, last edit).
- `/admin/pages/[slug]/edit` — renders Puck's `<Puck config data={draftData}>`
  drag/drop canvas. Saving writes `draft_data` via a staff-guarded server action.
- `/admin/pages/[slug]/preview` — renders `<Render>` of `draft_data`, staff-only,
  so editors can see a draft privately.
- **Publish** — a server action copies `draft_data` → `published_data`, stamps
  `updated_by`, and `revalidatePath`s the public route.
- Image fields upload to a public Storage bucket (`site-assets`) via the
  service-role client, reusing the sermon-upload pattern (type/size validated).
- "Sermons"-style sidebar nav entry: **Pages**.

### 4. Public rendering

- The homepage and About routes become data-driven server components: read
  `published_data` for the slug from Supabase, render `<Render config data={...} />`.
- Revalidated on publish (and/or `force-dynamic`).
- **Fallback:** if a slug has no `published_data`, render the seeded default (see
  below) so the site is never blank.

### 5. Seeding the current design

One-time seed: author Puck JSON for each in-scope page that faithfully reproduces
**today's** layout, written to both `draft_data` and `published_data`. Result:
nothing changes visually at launch; editors begin from the real layout and tweak.
Delivered as a `scripts/seed-pages.ts` script (service-role), idempotent by slug.

### 6. Auth & guardrails

- All editor routes/actions require `staff`/`admin` (existing middleware +
  `requireStaff` / `requireStaffApi`). Public sees only `published_data`.
- Guardrails come from Puck field types: editors compose from designer-approved
  blocks and choose from constrained style options — the layout stays responsive
  and on-brand by construction.

## Testing

- Integration: `pages` table shape (draft/published columns), publish copies
  draft→published, public query returns `published_data` only.
- RLS regression: anon cannot read/write `pages`; anon cannot upload to
  `site-assets` bucket (extend existing `rls.test.ts`).
- Unit: any pure helper (e.g., default-doc builder / slug validation).

## Phasing

- **Phase 1 — Homepage editable end-to-end:** `pages` table + migration, Puck
  config with branded blocks, `site-assets` bucket, `/admin/pages` + edit +
  preview + publish, homepage renders from `published_data`, seed the homepage.
- **Phase 2 — About pages + generic blocks:** add `PageHero`/`Prose` + generic
  blocks, convert the three About routes, seed them.

The spec covers the full scope; implementation ships in these two phases.

## Dependencies & risks

- **Dependency:** `@measured/puck` (MIT). Verify current App Router integration
  API (`<Puck>` is client; `<Render>` usable in server components; data format)
  against the docs during the implementation plan.
- **Risk:** faithfully seeding the current design is the most labor-intensive part
  (each section → block props). Mitigated by reusing existing components verbatim.
- **Risk:** interactive/client blocks inside Puck — validate the carousel and hero
  video render correctly both in the editor canvas and via `<Render>`.
- **Non-risk:** cost — Puck core is free/MIT; only optional AI-cloud tiers are paid.
