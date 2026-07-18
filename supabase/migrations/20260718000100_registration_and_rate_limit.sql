-- Atomic event registration + DB-backed rate limiting (audit follow-up).

-- 1. register_for_event: performs the capacity check and the insert inside one
--    transaction, serialized per event with an advisory lock, so concurrent
--    signups for the last spot can no longer both land as "registered".
--    Mirrors decideRegistrationStatus: null/<=0 capacity = unlimited; otherwise
--    active >= capacity => waitlisted. Raises tokens the caller maps to messages.
create or replace function public.register_for_event(
  p_event_id   uuid,
  p_person_id  uuid,
  p_first_name text,
  p_last_name  text,
  p_email      text,
  p_phone      text,
  p_notes      text
)
returns table (registration_id uuid, status text, event_name text, cost_cents integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event  public.events%rowtype;
  v_active integer;
  v_status text;
  v_id     uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_event_id::text, 0));

  select * into v_event from public.events where id = p_event_id;
  if v_event.id is null or v_event.visibility <> 'listed' then
    raise exception 'EVENT_NOT_FOUND';
  end if;
  if not v_event.registration_open then
    raise exception 'REGISTRATION_CLOSED';
  end if;

  if p_email is not null and exists (
    select 1 from public.event_registrations er
    where er.event_id = p_event_id and er.email = p_email and er.status <> 'cancelled'
  ) then
    raise exception 'ALREADY_REGISTERED';
  end if;

  select count(*) into v_active from public.event_registrations er
    where er.event_id = p_event_id and er.status <> 'cancelled';

  if v_event.capacity is null or v_event.capacity <= 0 then
    v_status := 'registered';
  elsif v_active >= v_event.capacity then
    v_status := 'waitlisted';
  else
    v_status := 'registered';
  end if;

  insert into public.event_registrations
    (event_id, person_id, first_name, last_name, email, phone, responses, status)
  values
    (p_event_id, p_person_id, p_first_name, p_last_name, p_email, p_phone,
     jsonb_build_object('notes', coalesce(p_notes, '')), v_status)
  returning id into v_id;

  return query select v_id, v_status, v_event.name, v_event.cost_cents;
end;
$$;

revoke execute on function public.register_for_event(uuid, uuid, text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.register_for_event(uuid, uuid, text, text, text, text, text)
  to service_role;

-- 2. Fixed-window rate limiter keyed by an opaque bucket string (e.g.
--    "register:1.2.3.4"). Returns true when the hit is allowed, false when the
--    limit for the current window is exceeded. Service-role only.
create table if not exists public.rate_limits (
  bucket       text primary key,
  count        integer not null default 0,
  window_start timestamptz not null default now()
);
alter table public.rate_limits enable row level security;

create or replace function public.rate_limit_hit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  insert into public.rate_limits (bucket, count, window_start)
  values (p_key, 1, now())
  on conflict (bucket) do update set
    count = case
      when public.rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
      then 1 else public.rate_limits.count + 1 end,
    window_start = case
      when public.rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
      then now() else public.rate_limits.window_start end
  returning count into v_count;
  return v_count <= p_limit;
end;
$$;

revoke execute on function public.rate_limit_hit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer) to service_role;
