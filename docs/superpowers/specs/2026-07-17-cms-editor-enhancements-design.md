# H2O Hub CMS — Editor Enhancements (Phase 2) Design

**Date:** 2026-07-17
**Status:** Approved (design)

## Goal

Turn the Puck-based page editor from a fixed six-block homepage editor into a
usable mini-CMS: draggable reordering that actually works, persistent version
history with revert, free-form generic blocks, in-editor image upload, editable
About pages, and draft preview.

## Motivation

Phase 1 shipped a working editor, but in practice:

- **Reordering is broken** — the editor is rendered inside the dashboard's
  constrained `max-w-6xl` padded container behind a fixed sidebar
  (`src/app/admin/(dashboard)/layout.tsx:47-48`). Puck expects to own a
  full-viewport, full-height layout; squeezed into a box its drag zones and
  outline panel do not function.
- **No version history** — a mistaken publish cannot be undone. There is no
  record of prior published states.

The user asked to fix both and "enable more features like that." Approved scope:
generic blocks, in-editor image upload, editable About pages, draft preview.

## Architecture

Six coordinated pieces. All server-side data access stays on the service-role
admin client behind `requireStaff()` (never anon), consistent with Phase 1.

### 1. Full-bleed editor (fixes reordering)

The edit route's client component renders Puck inside a `fixed inset-0 z-50`
overlay that covers the dashboard chrome, so Puck controls the full viewport.
This restores drag-to-reorder, the outline panel, and Puck's built-in session
undo/redo.

A slim custom top bar (via Puck `overrides.headerActions` / header override)
provides: **← Pages**, page title, **History**, **Preview** (new tab),
**Save draft**, **Publish**. "Save draft" calls `savePageDraft`; "Publish"
calls `savePageDraft` then `publishPage`.

### 2. Version history + revert

- New table `page_versions(id uuid pk, slug text, title text, data jsonb,
  created_at timestamptz, created_by uuid)`. RLS enabled, **no policies**
  (default-deny) — reached only via the admin client server-side, like `pages`.
  Index on `(slug, created_at desc)`.
- `publishPage` inserts a snapshot of the just-published data into
  `page_versions` after the publish succeeds. Each publish = one restore point.
- After inserting, prune to the newest 50 rows per slug.
- New actions (all `requireStaff`):
  - `listPageVersions(slug): Promise<PageVersion[]>`
  - `restorePageVersion(id: string): Promise<{ slug: string }>` — copies that
    snapshot's `data` into the page's **draft_data** (never auto-publishes) and
    returns the slug so the editor can reload.
- **History drawer** (client): lists versions with published-at timestamp and
  author name; each row has "Restore to draft," which restores then reloads the
  editor with the restored draft.

### 3. Generic blocks

New palette blocks so editors can add/remove/reorder arbitrary content on any
page: **Heading, Text, Image, Button, Spacer, Columns**. Columns uses Puck 0.20
`slot` fields for nested drop zones. All registered in the single shared
`config`, grouped with Puck `categories` (Homepage, About, Content) for a tidy
palette. One config lists every block; the palette is not restricted per page.

### 4. In-editor image upload

A custom Puck field (`type: "custom"`) renders a file picker that calls the
existing `uploadSiteAsset` server action (image-only, 10 MB cap, `site-assets`
public bucket) and stores the returned public URL as the field value. Used by
the Image block and the Hero `posterSrc`. `next.config.ts` `img-src` already
allows `https://*.supabase.co`, so uploaded images render under CSP.

### 5. Editable About pages

Convert `who-we-are`, `what-we-believe`, `our-team` to render from published
Puck data with the current static component as fallback — identical to the
homepage pattern (`src/app/(marketing)/page.tsx` + `DefaultHome.tsx`).

**Fidelity-preserving approach (approved):** each existing bespoke section
becomes a dedicated block whose fields are only its editable copy, preserving
the exact markup/styling (SVG underline, sticky value column, accordion, Hebrew
serif type). Editors change wording and reorder sections without breaking the
design — rather than rebuilding from plain generic blocks, which would downgrade
them. Generic blocks remain available for free-form additions.

### 6. Draft preview

The preview route already renders draft data
(`src/app/admin/(dashboard)/pages/[slug]/preview/page.tsx`). Wire **Preview**
buttons (new tab) into the editor top bar and the pages list. No public-site
draft mode needed.

## Data flow

- Public page render: `getPublishedPage(slug)` → `<Render>` or static fallback.
- Editor load: `getPageDraft(slug)` → `<Puck data=...>`.
- Save: `savePageDraft(slug, data)`.
- Publish: `savePageDraft` → `publishPage` (copies draft→published, snapshots to
  `page_versions`, prunes, revalidates public path).
- Restore: `restorePageVersion(id)` → writes snapshot into draft → editor
  reloads draft.
- Image upload: field → `uploadSiteAsset(FormData)` → public URL stored in props.

## Security

- `page_versions` RLS default-deny, zero anon policies; server-only admin
  client. Regression/integration test asserts anon read/write denied.
- All new/changed actions call `requireStaff()` before any DB access.
- No DB error messages surfaced to the client; actions throw generic messages.
- Public CSP unchanged (Supabase image host already allowed).

## Testing (per CLAUDE.md)

- Integration: `page_versions` actions (snapshot on publish, list, restore,
  prune to 50) in `tests/integration/`.
- RLS: extend `tests/integration/rls.test.ts` — anon denied read + write on
  `page_versions`.
- Unit: Puck config includes all new components with valid render + defaultProps
  in `tests/unit/puck-config.test.ts`; any pure helper (e.g. prune logic) unit-
  tested.
- Full suite (typecheck + lint + unit + integration + regression) green before
  merge; live editor verified in-browser (reorder works, restore works, image
  upload works, About pages render published data).

## Out of scope

- Public-facing draft/preview mode toggle for anonymous visitors.
- Per-page palette restriction (all blocks visible everywhere; categories only).
- Scheduled publishing, multi-user locking, granular field-level history.
