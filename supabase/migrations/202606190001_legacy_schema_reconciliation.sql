do $$
declare
  has_legacy_profiles boolean;
  has_quickmart_profiles boolean;
  legacy_profiles_have_rows boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'clerk_id'
  ) into has_legacy_profiles;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'clerk_user_id'
  ) into has_quickmart_profiles;

  if has_legacy_profiles and not has_quickmart_profiles then
    execute 'select exists (select 1 from public.profiles limit 1)'
      into legacy_profiles_have_rows;

    if legacy_profiles_have_rows then
      raise exception using
        message = 'Legacy public.profiles contains data and cannot be replaced automatically.',
        hint = 'Migrate clerk_id/full_name/role data into the QuickMart profiles schema before continuing.';
    end if;

    drop table public.profiles cascade;
    drop type if exists public.user_role;
  end if;
end;
$$;
