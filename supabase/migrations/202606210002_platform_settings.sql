begin;

create table public.platform_settings (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique check (singleton),
  commission_rate numeric(5, 2) not null default 8
    check (commission_rate between 0 and 100),
  service_fee numeric(12, 2) not null default 5 check (service_fee >= 0),
  minimum_order_amount numeric(12, 2) not null default 50
    check (minimum_order_amount >= 0),
  support_email text not null default 'support@quickmart.sl',
  support_phone text not null default '+23276000000',
  maintenance_mode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger platform_settings_set_updated_at
before update on public.platform_settings
for each row execute function public.set_updated_at();

alter table public.platform_settings enable row level security;

create policy "Admins manage platform settings"
on public.platform_settings for all
to authenticated
using (public.has_role('admin'))
with check (public.has_role('admin'));

grant select, insert, update, delete on public.platform_settings to authenticated;
grant all on public.platform_settings to service_role;

insert into public.platform_settings (
  singleton,
  commission_rate,
  service_fee,
  minimum_order_amount,
  support_email,
  support_phone
) values (
  true,
  8,
  5,
  50,
  'support@quickmart.sl',
  '+23276000000'
);

commit;
