begin;

create or replace function public.protect_profile_authorization_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if current_setting('quickmart.auth_sync', true) = 'on' then
    return new;
  end if;

  if auth.role() = 'service_role' or public.is_admin() then
    return new;
  end if;

  if new.auth_user_id is distinct from old.auth_user_id
    or new.role_id is distinct from old.role_id
    or new.email is distinct from old.email
    or new.is_active is distinct from old.is_active
    or new.email_verified is distinct from old.email_verified
    or new.phone_verified is distinct from old.phone_verified
    or new.metadata is distinct from old.metadata
  then
    raise exception 'Protected profile fields can only be changed by an administrator.';
  end if;

  return new;
end;
$$;

revoke all on function public.protect_profile_authorization_fields() from public;
grant execute on function public.protect_profile_authorization_fields()
to authenticated, service_role;

drop trigger if exists profiles_protect_authorization_fields on public.profiles;
create trigger profiles_protect_authorization_fields
before update on public.profiles
for each row execute function public.protect_profile_authorization_fields();

commit;
