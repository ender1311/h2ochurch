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
