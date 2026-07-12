-- H2O CMS — People + Groups foundation
-- System of record for people, group types, groups, and memberships.
-- RLS is enabled and locked down: the app reaches this data only from the
-- server via the service-role key (which bypasses RLS). No anon/authenticated
-- policies are granted, so nothing is reachable through the public Data API.

create extension if not exists pgcrypto;

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── people ─────────────────────────────────────────────────────────────
create table if not exists public.people (
  id          uuid primary key default gen_random_uuid(),
  first_name  text not null default '',
  last_name   text not null default '',
  email       text,
  phone       text,
  status      text not null default 'active',   -- active | inactive | prospect
  campus      text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create unique index if not exists people_email_unique
  on public.people (lower(email)) where email is not null;
create index if not exists people_last_name_idx on public.people (last_name);

drop trigger if exists people_set_updated_at on public.people;
create trigger people_set_updated_at
  before update on public.people
  for each row execute function public.set_updated_at();

-- ── group_types ────────────────────────────────────────────────────────
create table if not exists public.group_types (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz not null default now()
);

-- ── groups ─────────────────────────────────────────────────────────────
create table if not exists public.groups (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text unique,
  group_type_id uuid references public.group_types(id) on delete set null,
  description   text,
  schedule      text,
  location      text,
  visibility    text not null default 'listed',  -- listed | unlisted
  image_url     text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

drop trigger if exists groups_set_updated_at on public.groups;
create trigger groups_set_updated_at
  before update on public.groups
  for each row execute function public.set_updated_at();

-- ── group_memberships (many-to-many) ───────────────────────────────────
create table if not exists public.group_memberships (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups(id) on delete cascade,
  person_id  uuid not null references public.people(id) on delete cascade,
  role       text not null default 'member',    -- leader | member
  joined_at  timestamptz not null default now(),
  unique (group_id, person_id)
);

create index if not exists gm_group_idx  on public.group_memberships (group_id);
create index if not exists gm_person_idx on public.group_memberships (person_id);

-- ── Row-Level Security: locked down (server/service-role only) ──────────
alter table public.people             enable row level security;
alter table public.group_types        enable row level security;
alter table public.groups             enable row level security;
alter table public.group_memberships  enable row level security;
