-- Run this once in Supabase SQL Editor after creating your first account.
-- Replace the email before executing.

do $$
declare
  target_email text := 'egertonhingston53@gmail.com';
  admin_role_id uuid;
  affected integer;
begin
  if target_email = 'CHANGE_ME@example.com' then
    raise exception 'Replace target_email before running this script.';
  end if;

  select id into admin_role_id
  from public.roles
  where name = 'admin';

  if admin_role_id is null then
    raise exception 'The admin role does not exist. Apply the QuickMart migrations first.';
  end if;

  update public.profiles
  set role_id = admin_role_id,
      is_active = true,
      updated_at = now()
  where lower(email) = lower(target_email);

  get diagnostics affected = row_count;
  if affected <> 1 then
    raise exception 'Expected one profile for %, updated %.', target_email, affected;
  end if;
end;
$$;
