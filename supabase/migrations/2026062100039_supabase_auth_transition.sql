begin;

do $$
declare
  has_external_identity_column boolean;
  profile_count bigint;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'clerk_user_id'
  ) into has_external_identity_column;

  if has_external_identity_column then
    execute 'select count(*) from public.profiles' into profile_count;
    if profile_count > 0 then
      raise exception using
        message = 'Existing external-auth profiles require a manual identity migration.',
        hint = 'Create matching Supabase Auth users, map their UUIDs, then rename the identity column to auth_user_id.';
    end if;

    alter table public.profiles
      drop constraint if exists profiles_clerk_user_id_not_blank;
    alter table public.profiles
      drop constraint if exists profiles_clerk_user_id_key;
    alter table public.profiles rename column clerk_user_id to auth_user_id;
    alter table public.profiles alter column auth_user_id type uuid using null::uuid;
    alter table public.profiles
      add constraint profiles_auth_user_id_key unique (auth_user_id);
    alter table public.profiles
      add constraint profiles_auth_user_id_fkey
      foreign key (auth_user_id) references auth.users(id)
      on update cascade on delete cascade;
  end if;
end;
$$;

drop function if exists public.current_clerk_user_id();

create or replace function public.current_auth_user_id()
returns uuid
language sql
stable
set search_path = ''
as $$
  select auth.uid();
$$;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.id
  from public.profiles p
  where p.auth_user_id = auth.uid()
    and p.is_active
  limit 1;
$$;

create or replace function public.enforce_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  customer_role_id uuid;
  actor_id uuid := public.current_profile_id();
begin
  select id into customer_role_id from public.roles where name = 'customer';

  if current_setting('quickmart.auth_sync', true) = 'on' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if auth.uid() is not null and not public.is_admin() then
      new.auth_user_id := auth.uid();
      new.role_id := customer_role_id;
      new.is_active := true;
      new.email_verified := false;
      new.phone_verified := false;
      new.metadata := '{}'::jsonb;
    end if;
  elsif actor_id is not null and not public.is_admin() then
    new.auth_user_id := old.auth_user_id;
    new.role_id := old.role_id;
    new.is_active := old.is_active;
    new.email_verified := old.email_verified;
    new.phone_verified := old.phone_verified;
    new.metadata := old.metadata;
  end if;

  return new;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  customer_role_id uuid;
begin
  perform set_config('quickmart.auth_sync', 'on', true);

  select id into customer_role_id from public.roles where name = 'customer';

  insert into public.profiles (
    auth_user_id, role_id, email, first_name, last_name, phone, avatar_url,
    is_active, email_verified, phone_verified, metadata
  )
  values (
    new.id,
    customer_role_id,
    lower(new.email),
    nullif(btrim(new.raw_user_meta_data ->> 'first_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'last_name'), ''),
    nullif(btrim(new.phone), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'avatar_url'), ''),
    true,
    new.email_confirmed_at is not null,
    new.phone_confirmed_at is not null,
    coalesce(new.raw_user_meta_data, '{}'::jsonb)
  )
  on conflict (auth_user_id) do update
  set
    email = excluded.email,
    first_name = coalesce(excluded.first_name, public.profiles.first_name),
    last_name = coalesce(excluded.last_name, public.profiles.last_name),
    phone = coalesce(excluded.phone, public.profiles.phone),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    email_verified = excluded.email_verified,
    phone_verified = excluded.phone_verified,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of email, phone, email_confirmed_at, phone_confirmed_at, raw_user_meta_data
on auth.users
for each row execute function public.handle_new_auth_user();

insert into public.profiles (
  auth_user_id, role_id, email, first_name, last_name, phone, avatar_url,
  is_active, email_verified, phone_verified, metadata
)
select
  u.id,
  (select id from public.roles where name = 'customer'),
  lower(u.email),
  nullif(btrim(u.raw_user_meta_data ->> 'first_name'), ''),
  nullif(btrim(u.raw_user_meta_data ->> 'last_name'), ''),
  nullif(btrim(u.phone), ''),
  nullif(btrim(u.raw_user_meta_data ->> 'avatar_url'), ''),
  true,
  u.email_confirmed_at is not null,
  u.phone_confirmed_at is not null,
  coalesce(u.raw_user_meta_data, '{}'::jsonb)
from auth.users u
where u.email is not null
on conflict (auth_user_id) do nothing;

drop policy if exists "profiles_create_own_customer_profile" on public.profiles;
create policy "profiles_create_own_customer_profile"
on public.profiles for insert
to authenticated
with check (
  auth_user_id = auth.uid()
  and role_id = (select id from public.roles where name = 'customer')
);

grant execute on function public.current_auth_user_id()
to anon, authenticated, service_role;

commit;
