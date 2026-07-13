-- Public "request to join a group" (Church Center equivalent).
create table if not exists public.group_join_requests (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups (id) on delete cascade,
  person_id  uuid references public.people (id) on delete set null,
  first_name text not null,
  last_name  text not null,
  email      text,
  phone      text,
  message    text,
  status     text not null default 'pending',  -- pending | approved | declined
  created_at timestamptz not null default now()
);
alter table public.group_join_requests enable row level security;
create index if not exists gjr_group_idx on public.group_join_requests (group_id, status);
