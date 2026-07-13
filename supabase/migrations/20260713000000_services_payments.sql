-- Services module (PC Services equivalent): song library, worship teams,
-- service plans with an ordered run sheet, and person assignments.
-- Plus payment columns for Stripe checkout on donations/registrations.

-- ── Song library ────────────────────────────────────────────────────────
create table if not exists public.songs (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  artist      text,
  ccli_number text,
  default_key text,
  bpm         integer,
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now()
);
alter table public.songs enable row level security;

-- ── Teams ───────────────────────────────────────────────────────────────
create table if not exists public.teams (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz not null default now()
);
alter table public.teams enable row level security;

create table if not exists public.team_members (
  id        uuid primary key default gen_random_uuid(),
  team_id   uuid not null references public.teams (id) on delete cascade,
  person_id uuid not null references public.people (id) on delete cascade,
  role      text,
  unique (team_id, person_id)
);
alter table public.team_members enable row level security;

-- ── Service plans + run sheet ───────────────────────────────────────────
create table if not exists public.service_plans (
  id           uuid primary key default gen_random_uuid(),
  service_date date not null,
  title        text not null default 'Sunday Gathering',
  notes        text,
  created_at   timestamptz not null default now()
);
alter table public.service_plans enable row level security;

create table if not exists public.plan_items (
  id             uuid primary key default gen_random_uuid(),
  plan_id        uuid not null references public.service_plans (id) on delete cascade,
  position       integer not null,
  kind           text not null default 'song',  -- song | header | prayer | sermon | other
  song_id        uuid references public.songs (id) on delete set null,
  title          text,
  song_key       text,
  length_minutes integer,
  notes          text
);
alter table public.plan_items enable row level security;
create index if not exists plan_items_plan_idx on public.plan_items (plan_id, position);

create table if not exists public.plan_assignments (
  id        uuid primary key default gen_random_uuid(),
  plan_id   uuid not null references public.service_plans (id) on delete cascade,
  person_id uuid not null references public.people (id) on delete cascade,
  team_id   uuid references public.teams (id) on delete set null,
  role      text not null default '',
  status    text not null default 'pending',   -- pending | confirmed | declined
  unique (plan_id, person_id, role)
);
alter table public.plan_assignments enable row level security;
create index if not exists plan_assign_plan_idx on public.plan_assignments (plan_id);

-- ── Stripe payment tracking ─────────────────────────────────────────────
alter table public.donations add column if not exists stripe_session_id text;
alter table public.event_registrations add column if not exists paid_at timestamptz;
alter table public.event_registrations add column if not exists stripe_session_id text;
create unique index if not exists donations_stripe_session_unique
  on public.donations (stripe_session_id) where stripe_session_id is not null;
