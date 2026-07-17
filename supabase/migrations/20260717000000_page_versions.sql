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
