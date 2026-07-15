-- Sermons module: an audio library staff manage in the Hub, with a `published`
-- flag controlling what appears on the public website. Audio files live in a
-- public Storage bucket; `audio_url` may also point at an external host.
-- RLS-locked like every other module — the server reaches it via the
-- service-role client after authorizing the staff user (public reads filter to
-- published rows in the query).

create table if not exists public.sermons (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  speaker     text,
  series      text,
  scripture   text,
  description text,
  audio_url   text,
  preached_on date,
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.sermons enable row level security;

drop trigger if exists sermons_set_updated_at on public.sermons;
create trigger sermons_set_updated_at
  before update on public.sermons
  for each row execute function public.set_updated_at();

create index if not exists sermons_published_idx
  on public.sermons (published, preached_on desc);

-- Public Storage bucket for sermon audio. Public read; writes happen server-side
-- through the service-role client, so no write policies are needed here.
insert into storage.buckets (id, name, public)
values ('sermons', 'sermons', true)
on conflict (id) do nothing;
