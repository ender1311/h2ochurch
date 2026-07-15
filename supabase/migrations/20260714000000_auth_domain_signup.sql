-- Self-serve signup: anyone with an @h2osu.org email who creates an account is
-- automatically granted the `staff` role (dashboard access). Everyone else keeps
-- the default `member` role until an admin promotes them. Existing accounts are
-- untouched — this only affects the role assigned to newly created auth users.

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
      when lower(new.email) like '%@h2osu.org' then 'staff'
      else 'member'
    end
  );
  return new;
end;
$$;
