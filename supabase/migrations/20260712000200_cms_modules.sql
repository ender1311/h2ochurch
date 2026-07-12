-- H2O Hub — full module expansion: households, tags, custom fields, events +
-- registrations, giving, check-ins, calendar. All tables RLS-locked (server
-- reaches them via the service-role client after authorizing the staff user).

-- ── Households + richer people ──────────────────────────────────────────
create table if not exists public.households (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now()
);
alter table public.households enable row level security;

alter table public.people add column if not exists household_id uuid references public.households (id) on delete set null;
alter table public.people add column if not exists address text;
alter table public.people add column if not exists birthdate date;
alter table public.people add column if not exists tags text[] not null default '{}';

-- ── Custom field definitions + values ───────────────────────────────────
create table if not exists public.field_definitions (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,
  label      text not null,
  kind       text not null default 'text',   -- text | number | date | boolean
  created_at timestamptz not null default now()
);
alter table public.field_definitions enable row level security;

create table if not exists public.person_field_values (
  id        uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people (id) on delete cascade,
  field_id  uuid not null references public.field_definitions (id) on delete cascade,
  value     text,
  unique (person_id, field_id)
);
alter table public.person_field_values enable row level security;

-- ── Events + registrations ──────────────────────────────────────────────
create table if not exists public.events (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  slug              text unique,
  description       text,
  starts_at         timestamptz,
  ends_at           timestamptz,
  location          text,
  capacity          integer,
  cost_cents        integer not null default 0,
  registration_open boolean not null default true,
  visibility        text not null default 'listed',  -- listed | unlisted
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
alter table public.events enable row level security;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

create table if not exists public.event_registrations (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events (id) on delete cascade,
  person_id  uuid references public.people (id) on delete set null,
  first_name text not null default '',
  last_name  text not null default '',
  email      text,
  phone      text,
  responses  jsonb not null default '{}'::jsonb,
  status     text not null default 'registered',  -- registered | waitlisted | cancelled
  created_at timestamptz not null default now()
);
alter table public.event_registrations enable row level security;
create index if not exists reg_event_idx on public.event_registrations (event_id);

-- ── Giving ──────────────────────────────────────────────────────────────
create table if not exists public.funds (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz not null default now()
);
alter table public.funds enable row level security;

create table if not exists public.donations (
  id           uuid primary key default gen_random_uuid(),
  person_id    uuid references public.people (id) on delete set null,
  fund_id      uuid references public.funds (id) on delete set null,
  amount_cents integer not null,
  method       text not null default 'other',   -- cash | check | card | online | other
  note         text,
  donated_on   date not null default current_date,
  created_at   timestamptz not null default now()
);
alter table public.donations enable row level security;
create index if not exists donations_person_idx on public.donations (person_id);
create index if not exists donations_date_idx on public.donations (donated_on);

-- ── Check-ins ───────────────────────────────────────────────────────────
create table if not exists public.checkin_sessions (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  group_id     uuid references public.groups (id) on delete set null,
  event_id     uuid references public.events (id) on delete set null,
  session_date date not null default current_date,
  created_at   timestamptz not null default now()
);
alter table public.checkin_sessions enable row level security;

create table if not exists public.checkins (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references public.checkin_sessions (id) on delete cascade,
  person_id     uuid not null references public.people (id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  unique (session_id, person_id)
);
alter table public.checkins enable row level security;

-- ── Calendar ────────────────────────────────────────────────────────────
create table if not exists public.calendar_events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  all_day     boolean not null default false,
  location    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.calendar_events enable row level security;

drop trigger if exists calendar_set_updated_at on public.calendar_events;
create trigger calendar_set_updated_at
  before update on public.calendar_events
  for each row execute function public.set_updated_at();
