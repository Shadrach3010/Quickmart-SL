begin;

alter table public.profiles add column if not exists referral_code text;

update public.profiles
set referral_code = 'QM' || upper(substr(replace(id::text, '-', ''), 1, 10))
where referral_code is null;

alter table public.profiles alter column referral_code set not null;
create unique index if not exists profiles_referral_code_unique_idx
on public.profiles (referral_code);

create or replace function public.prepare_profile_referral()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.referral_code is null then
    new.referral_code := 'QM' || upper(substr(replace(new.id::text, '-', ''), 1, 10));
  end if;
  return new;
end;
$$;

create or replace function public.connect_profile_referral()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  supplied_code text;
  referrer_id uuid;
begin
  select upper(nullif(btrim(raw_user_meta_data->>'referral_code'), ''))
  into supplied_code
  from auth.users
  where id = new.auth_user_id;

  if supplied_code is null then return new; end if;
  select id into referrer_id from public.profiles where referral_code = supplied_code;
  if referrer_id is null or referrer_id = new.id then return new; end if;

  insert into public.referrals (
    referrer_profile_id, referred_profile_id, referral_code, status,
    referrer_reward_amount, referred_reward_amount
  ) values (referrer_id, new.id, supplied_code, 'joined', 25, 25)
  on conflict (referred_profile_id) do nothing;
  return new;
end;
$$;

drop trigger if exists profiles_prepare_referral on public.profiles;
create trigger profiles_prepare_referral
before insert on public.profiles
for each row execute function public.prepare_profile_referral();

drop trigger if exists profiles_connect_referral on public.profiles;
create trigger profiles_connect_referral
after insert on public.profiles
for each row execute function public.connect_profile_referral();

grant select (referral_code) on public.profiles to authenticated;

commit;
