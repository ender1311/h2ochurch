-- Security hardening (audit 2026-07-18).

-- 1. Prevent privilege escalation via the public anon key. The prior
--    profiles_update_own policy let any authenticated user update their own row
--    with no column restriction, so a member could set role='admin' directly
--    through the anon client. Staff role changes go through the service-role
--    client (setUserRole/inviteUser), which bypasses RLS, so constraining this
--    policy does not affect legitimate admin flows.
create or replace function public.current_profile_role()
returns text
language sql
security definer
set search_path = ''
stable
as $$
  select role from public.profiles where id = (select auth.uid())
$$;

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id and role = public.current_profile_role());

-- 2. Harden the staff-domain check. `like '%@h2osu.org'` is case-sensitive and
--    matches malformed multi-@ addresses (e.g. a@b@h2osu.org). Compare the
--    actual domain part instead.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case
      when split_part(lower(new.email), '@', 2) = 'h2osu.org' then 'staff'
      else 'member'
    end
  );
  return new;
end;
$$;

-- 3. Data-integrity CHECK constraints the app assumes but never enforced at the
--    DB level (defends against a service-role bug writing bad values).
alter table public.donations drop constraint if exists donations_amount_positive;
alter table public.donations add constraint donations_amount_positive check (amount_cents > 0);

alter table public.events drop constraint if exists events_cost_nonneg;
alter table public.events add constraint events_cost_nonneg check (cost_cents >= 0);

alter table public.events drop constraint if exists events_capacity_positive;
alter table public.events add constraint events_capacity_positive check (capacity is null or capacity > 0);

-- 4. Make Stripe registration fulfillment idempotent at the DB level, matching
--    the existing unique index on donations.stripe_session_id.
create unique index if not exists event_registrations_stripe_session_key
  on public.event_registrations (stripe_session_id)
  where stripe_session_id is not null;
