begin;

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create type public.supermarket_status as enum (
  'pending',
  'active',
  'suspended',
  'closed'
);

create type public.cart_status as enum (
  'active',
  'converted',
  'abandoned'
);

create type public.order_status as enum (
  'pending',
  'confirmed',
  'preparing',
  'ready_for_pickup',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'refunded'
);

create type public.payment_status as enum (
  'pending',
  'processing',
  'paid',
  'failed',
  'cancelled',
  'refunded',
  'partially_refunded'
);

create type public.payment_method as enum (
  'orange_money',
  'afrimoney',
  'card',
  'cash_on_delivery'
);

create type public.delivery_status as enum (
  'unassigned',
  'assigned',
  'picked_up',
  'in_transit',
  'delivered',
  'failed',
  'cancelled'
);

create type public.delivery_agent_status as enum (
  'pending',
  'available',
  'busy',
  'offline',
  'suspended'
);

create type public.notification_type as enum (
  'order',
  'payment',
  'delivery',
  'promotion',
  'system'
);

create type public.discount_type as enum (
  'percentage',
  'fixed_amount',
  'free_delivery'
);

create type public.promotion_scope as enum (
  'supermarket',
  'category',
  'product'
);

create sequence public.order_number_seq start with 100000;

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roles_name_check
    check (name in ('customer', 'vendor', 'admin', 'delivery_agent'))
);

insert into public.roles (id, name, description)
values
  ('10000000-0000-4000-8000-000000000001', 'customer', 'Marketplace customer'),
  ('10000000-0000-4000-8000-000000000002', 'vendor', 'Supermarket owner or manager'),
  ('10000000-0000-4000-8000-000000000003', 'admin', 'QuickMart platform administrator'),
  ('10000000-0000-4000-8000-000000000004', 'delivery_agent', 'QuickMart delivery agent');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on update cascade on delete cascade,
  role_id uuid not null references public.roles(id) on update cascade on delete restrict,
  email text not null,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  is_active boolean not null default true,
  email_verified boolean not null default false,
  phone_verified boolean not null default false,
  last_seen_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_normalized check (email = lower(btrim(email))),
  constraint profiles_email_format check (
    email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  ),
  constraint profiles_phone_format check (
    phone is null
    or phone ~ '^(?:\+?232)?(?:2[125]|3[034]|7[6789]|8[08]|9[09])[0-9]{6}$'
  )
);

create unique index profiles_email_unique_idx on public.profiles (lower(email));
create index profiles_role_id_idx on public.profiles (role_id);
create index profiles_active_idx on public.profiles (is_active) where is_active;

create table public.supermarkets (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid references public.profiles(id) on update cascade on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  cover_image_url text,
  email text,
  phone text,
  address_line text,
  city text not null default 'Freetown',
  district text not null default 'Western Area Urban',
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  status public.supermarket_status not null default 'pending',
  is_featured boolean not null default false,
  minimum_order_amount numeric(12, 2) not null default 0,
  delivery_fee numeric(12, 2) not null default 0,
  estimated_delivery_minutes integer,
  opening_hours jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint supermarkets_name_not_blank check (btrim(name) <> ''),
  constraint supermarkets_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint supermarkets_email_format check (
    email is null
    or email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  ),
  constraint supermarkets_phone_format check (
    phone is null
    or phone ~ '^(?:\+?232)?(?:2[125]|3[034]|7[6789]|8[08]|9[09])[0-9]{6}$'
  ),
  constraint supermarkets_latitude_check check (
    latitude is null or latitude between -90 and 90
  ),
  constraint supermarkets_longitude_check check (
    longitude is null or longitude between -180 and 180
  ),
  constraint supermarkets_minimum_order_check check (minimum_order_amount >= 0),
  constraint supermarkets_delivery_fee_check check (delivery_fee >= 0),
  constraint supermarkets_delivery_minutes_check check (
    estimated_delivery_minutes is null or estimated_delivery_minutes > 0
  )
);

create index supermarkets_owner_profile_id_idx
  on public.supermarkets (owner_profile_id);
create index supermarkets_status_idx on public.supermarkets (status);
create index supermarkets_featured_idx
  on public.supermarkets (is_featured)
  where is_featured and status = 'active';

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on update cascade on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_name_not_blank check (btrim(name) <> ''),
  constraint categories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint categories_sort_order_check check (sort_order >= 0),
  constraint categories_not_own_parent check (parent_id is null or parent_id <> id)
);

create index categories_parent_id_idx on public.categories (parent_id);
create index categories_active_sort_idx
  on public.categories (sort_order, name)
  where is_active;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  supermarket_id uuid not null references public.supermarkets(id) on update cascade on delete cascade,
  category_id uuid references public.categories(id) on update cascade on delete set null,
  name text not null,
  slug text not null,
  sku text,
  barcode text,
  description text,
  unit text not null default 'item',
  price numeric(12, 2) not null,
  compare_at_price numeric(12, 2),
  cost_price numeric(12, 2),
  stock_quantity integer not null default 0,
  low_stock_threshold integer not null default 5,
  track_inventory boolean not null default true,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  attributes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_name_not_blank check (btrim(name) <> ''),
  constraint products_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint products_price_check check (price >= 0),
  constraint products_compare_at_price_check check (
    compare_at_price is null or compare_at_price >= price
  ),
  constraint products_cost_price_check check (cost_price is null or cost_price >= 0),
  constraint products_stock_check check (stock_quantity >= 0),
  constraint products_low_stock_check check (low_stock_threshold >= 0),
  unique (supermarket_id, slug)
);

create index products_supermarket_id_idx on public.products (supermarket_id);
create index products_category_id_idx on public.products (category_id);
create unique index products_supermarket_sku_unique_idx
  on public.products (supermarket_id, sku)
  where sku is not null;
create unique index products_supermarket_barcode_unique_idx
  on public.products (supermarket_id, barcode)
  where barcode is not null;
create index products_active_catalog_idx
  on public.products (supermarket_id, category_id, name)
  where is_active;
create index products_featured_idx
  on public.products (created_at desc)
  where is_active and is_featured;

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on update cascade on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_images_storage_path_not_blank check (btrim(storage_path) <> ''),
  constraint product_images_sort_order_check check (sort_order >= 0),
  unique (product_id, storage_path)
);

create index product_images_product_sort_idx
  on public.product_images (product_id, sort_order);
create unique index product_images_one_primary_idx
  on public.product_images (product_id)
  where is_primary;

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on update cascade on delete cascade,
  label text not null,
  recipient_name text not null,
  phone text not null,
  address_line text not null,
  city text not null default 'Freetown',
  district text not null default 'Western Area Urban',
  landmark text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  delivery_instructions text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint addresses_label_not_blank check (btrim(label) <> ''),
  constraint addresses_recipient_not_blank check (btrim(recipient_name) <> ''),
  constraint addresses_address_line_not_blank check (btrim(address_line) <> ''),
  constraint addresses_phone_format check (
    phone ~ '^(?:\+?232)?(?:2[125]|3[034]|7[6789]|8[08]|9[09])[0-9]{6}$'
  ),
  constraint addresses_latitude_check check (
    latitude is null or latitude between -90 and 90
  ),
  constraint addresses_longitude_check check (
    longitude is null or longitude between -180 and 180
  )
);

create index addresses_profile_id_idx on public.addresses (profile_id);
create unique index addresses_one_default_idx
  on public.addresses (profile_id)
  where is_default;

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  customer_profile_id uuid not null references public.profiles(id) on update cascade on delete cascade,
  status public.cart_status not null default 'active',
  expires_at timestamptz not null default (now() + interval '30 days'),
  converted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint carts_conversion_check check (
    (status = 'converted' and converted_at is not null)
    or status <> 'converted'
  )
);

create index carts_customer_profile_id_idx on public.carts (customer_profile_id);
create index carts_expires_at_idx on public.carts (expires_at)
  where status = 'active';
create unique index carts_one_active_per_customer_idx
  on public.carts (customer_profile_id)
  where status = 'active';

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on update cascade on delete cascade,
  product_id uuid not null references public.products(id) on update cascade on delete cascade,
  quantity integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cart_items_quantity_check check (quantity between 1 and 999),
  unique (cart_id, product_id)
);

create index cart_items_product_id_idx on public.cart_items (product_id);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default (
    'QM-' || to_char(current_date, 'YYYYMMDD') || '-' ||
    lpad(nextval('public.order_number_seq')::text, 8, '0')
  ),
  customer_profile_id uuid not null references public.profiles(id) on update cascade on delete restrict,
  supermarket_id uuid not null references public.supermarkets(id) on update cascade on delete restrict,
  address_id uuid references public.addresses(id) on update cascade on delete set null,
  status public.order_status not null default 'pending',
  payment_method public.payment_method not null,
  currency_code char(3) not null default 'SLE',
  subtotal numeric(12, 2) not null default 0,
  discount_amount numeric(12, 2) not null default 0,
  delivery_fee numeric(12, 2) not null default 0,
  tax_amount numeric(12, 2) not null default 0,
  total_amount numeric(12, 2) generated always as (
    greatest(subtotal - discount_amount + delivery_fee + tax_amount, 0)
  ) stored,
  delivery_address jsonb not null,
  customer_notes text,
  vendor_notes text,
  cancellation_reason text,
  confirmed_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_order_number_format check (
    order_number ~ '^QM-[0-9]{8}-[0-9]{8,}$'
  ),
  constraint orders_currency_check check (currency_code = 'SLE'),
  constraint orders_subtotal_check check (subtotal >= 0),
  constraint orders_discount_check check (discount_amount >= 0),
  constraint orders_delivery_fee_check check (delivery_fee >= 0),
  constraint orders_tax_check check (tax_amount >= 0),
  constraint orders_delivery_address_object check (
    jsonb_typeof(delivery_address) = 'object'
  ),
  constraint orders_cancelled_at_check check (
    (status = 'cancelled' and cancelled_at is not null)
    or status <> 'cancelled'
  ),
  constraint orders_delivered_at_check check (
    (status = 'delivered' and delivered_at is not null)
    or status <> 'delivered'
  )
);

create index orders_customer_created_idx
  on public.orders (customer_profile_id, created_at desc);
create index orders_supermarket_status_idx
  on public.orders (supermarket_id, status, created_at desc);
create index orders_status_created_idx on public.orders (status, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on update cascade on delete cascade,
  product_id uuid references public.products(id) on update cascade on delete set null,
  product_name text not null,
  product_sku text,
  unit text not null,
  unit_price numeric(12, 2) not null,
  quantity integer not null,
  line_total numeric(12, 2) generated always as (unit_price * quantity) stored,
  product_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint order_items_product_name_not_blank check (btrim(product_name) <> ''),
  constraint order_items_unit_price_check check (unit_price >= 0),
  constraint order_items_quantity_check check (quantity between 1 and 999),
  unique (order_id, product_id)
);

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on update cascade on delete restrict,
  method public.payment_method not null,
  status public.payment_status not null default 'pending',
  amount numeric(12, 2) not null,
  currency_code char(3) not null default 'SLE',
  provider text,
  provider_reference text,
  idempotency_key text not null unique,
  provider_response jsonb not null default '{}'::jsonb,
  failure_reason text,
  paid_at timestamptz,
  refunded_amount numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_amount_check check (amount >= 0),
  constraint payments_currency_check check (currency_code = 'SLE'),
  constraint payments_refunded_amount_check check (
    refunded_amount between 0 and amount
  ),
  constraint payments_paid_at_check check (
    (status = 'paid' and paid_at is not null)
    or status <> 'paid'
  )
);

create index payments_order_created_idx
  on public.payments (order_id, created_at desc);
create index payments_status_created_idx
  on public.payments (status, created_at desc);
create unique index payments_provider_reference_unique_idx
  on public.payments (provider, provider_reference)
  where provider_reference is not null;

create table public.delivery_agents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on update cascade on delete cascade,
  status public.delivery_agent_status not null default 'pending',
  vehicle_type text,
  vehicle_registration text,
  license_number text,
  current_latitude numeric(9, 6),
  current_longitude numeric(9, 6),
  last_location_at timestamptz,
  max_active_deliveries integer not null default 3,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint delivery_agents_latitude_check check (
    current_latitude is null or current_latitude between -90 and 90
  ),
  constraint delivery_agents_longitude_check check (
    current_longitude is null or current_longitude between -180 and 180
  ),
  constraint delivery_agents_max_deliveries_check check (
    max_active_deliveries > 0
  )
);

create index delivery_agents_status_idx on public.delivery_agents (status);

create table public.deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on update cascade on delete restrict,
  delivery_agent_id uuid references public.delivery_agents(id) on update cascade on delete set null,
  status public.delivery_status not null default 'unassigned',
  pickup_address jsonb not null,
  delivery_address jsonb not null,
  delivery_fee numeric(12, 2) not null default 0,
  assigned_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  proof_of_delivery_url text,
  recipient_name text,
  recipient_notes text,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint deliveries_pickup_address_object check (
    jsonb_typeof(pickup_address) = 'object'
  ),
  constraint deliveries_delivery_address_object check (
    jsonb_typeof(delivery_address) = 'object'
  ),
  constraint deliveries_fee_check check (delivery_fee >= 0),
  constraint deliveries_assignment_check check (
    (delivery_agent_id is null and status = 'unassigned')
    or delivery_agent_id is not null
    or status in ('cancelled', 'failed')
  )
);

create index deliveries_agent_status_idx
  on public.deliveries (delivery_agent_id, status, created_at);
create index deliveries_status_idx on public.deliveries (status, created_at);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on update cascade on delete cascade,
  type public.notification_type not null default 'system',
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notifications_title_not_blank check (btrim(title) <> ''),
  constraint notifications_body_not_blank check (btrim(body) <> '')
);

create index notifications_profile_unread_idx
  on public.notifications (profile_id, created_at desc)
  where read_at is null;
create index notifications_profile_created_idx
  on public.notifications (profile_id, created_at desc);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles(id) on update cascade on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  request_id text,
  created_at timestamptz not null default now(),
  constraint activity_logs_action_not_blank check (btrim(action) <> ''),
  constraint activity_logs_entity_type_not_blank check (btrim(entity_type) <> '')
);

create index activity_logs_actor_created_idx
  on public.activity_logs (actor_profile_id, created_at desc);
create index activity_logs_entity_idx
  on public.activity_logs (entity_type, entity_id, created_at desc);
create index activity_logs_created_at_idx on public.activity_logs (created_at desc);

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  supermarket_id uuid references public.supermarkets(id) on update cascade on delete cascade,
  category_id uuid references public.categories(id) on update cascade on delete cascade,
  product_id uuid references public.products(id) on update cascade on delete cascade,
  name text not null,
  code text,
  description text,
  scope public.promotion_scope not null default 'supermarket',
  discount_type public.discount_type not null,
  discount_value numeric(12, 2) not null,
  minimum_order_amount numeric(12, 2) not null default 0,
  maximum_discount_amount numeric(12, 2),
  usage_limit integer,
  usage_count integer not null default 0,
  per_customer_limit integer,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint promotions_name_not_blank check (btrim(name) <> ''),
  constraint promotions_code_normalized check (
    code is null or code = upper(btrim(code))
  ),
  constraint promotions_value_check check (discount_value > 0),
  constraint promotions_percentage_check check (
    discount_type <> 'percentage' or discount_value <= 100
  ),
  constraint promotions_minimum_order_check check (minimum_order_amount >= 0),
  constraint promotions_maximum_discount_check check (
    maximum_discount_amount is null or maximum_discount_amount > 0
  ),
  constraint promotions_usage_limit_check check (
    usage_limit is null or usage_limit > 0
  ),
  constraint promotions_usage_count_check check (usage_count >= 0),
  constraint promotions_per_customer_limit_check check (
    per_customer_limit is null or per_customer_limit > 0
  ),
  constraint promotions_date_range_check check (ends_at > starts_at),
  constraint promotions_scope_target_check check (
    (scope = 'supermarket' and supermarket_id is not null and category_id is null and product_id is null)
    or (scope = 'category' and supermarket_id is not null and category_id is not null and product_id is null)
    or (scope = 'product' and supermarket_id is not null and category_id is null and product_id is not null)
  )
);

create unique index promotions_code_unique_idx
  on public.promotions (code)
  where code is not null;
create index promotions_supermarket_active_idx
  on public.promotions (supermarket_id, starts_at, ends_at)
  where is_active;
create index promotions_product_id_idx on public.promotions (product_id);
create index promotions_category_id_idx on public.promotions (category_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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
  where p.auth_user_id = public.current_auth_user_id()
    and p.is_active
  limit 1;
$$;

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select r.name
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = public.current_profile_id()
    and p.is_active
  limit 1;
$$;

create or replace function public.has_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_app_role() = required_role, false);
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_role('admin');
$$;

create or replace function public.owns_supermarket(target_supermarket_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.supermarkets s
    where s.id = target_supermarket_id
      and s.owner_profile_id = public.current_profile_id()
  );
$$;

create or replace function public.owns_order(target_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.orders o
    where o.id = target_order_id
      and o.customer_profile_id = public.current_profile_id()
  );
$$;

create or replace function public.manages_order(target_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.orders o
    join public.supermarkets s on s.id = o.supermarket_id
    where o.id = target_order_id
      and s.owner_profile_id = public.current_profile_id()
  );
$$;

create or replace function public.owns_cart(target_cart_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.carts c
    where c.id = target_cart_id
      and c.customer_profile_id = public.current_profile_id()
  );
$$;

create or replace function public.is_assigned_delivery(target_delivery_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.deliveries d
    join public.delivery_agents da on da.id = d.delivery_agent_id
    where d.id = target_delivery_id
      and da.profile_id = public.current_profile_id()
  );
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
    if public.current_auth_user_id() is not null and not public.is_admin() then
      new.auth_user_id := public.current_auth_user_id();
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

  select id into customer_role_id
  from public.roles
  where name = 'customer';

  insert into public.profiles (
    auth_user_id,
    role_id,
    email,
    first_name,
    last_name,
    phone,
    avatar_url,
    is_active,
    email_verified,
    phone_verified,
    metadata
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

create or replace function public.validate_supermarket_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.owner_profile_id is not null and not exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = new.owner_profile_id
      and p.is_active
      and r.name in ('vendor', 'admin')
  ) then
    raise exception 'Supermarket owner must be an active vendor or admin';
  end if;

  if tg_op = 'UPDATE'
    and new.owner_profile_id is distinct from old.owner_profile_id
    and public.current_profile_id() is not null
    and not public.is_admin()
  then
    raise exception 'Only an admin can transfer supermarket ownership';
  end if;

  if tg_op = 'UPDATE'
    and public.current_profile_id() is not null
    and not public.is_admin()
  then
    new.status := old.status;
    new.is_featured := old.is_featured;
  end if;

  if tg_op = 'INSERT'
    and public.current_profile_id() is not null
    and not public.is_admin()
  then
    new.status := 'pending';
    new.is_featured := false;
  end if;

  return new;
end;
$$;

create or replace function public.prepare_order()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  address_row public.addresses%rowtype;
  actor_id uuid := public.current_profile_id();
begin
  if actor_id is not null and not public.is_admin() then
    new.customer_profile_id := actor_id;
    new.status := 'pending';
    new.currency_code := 'SLE';
    new.subtotal := 0;
    new.discount_amount := 0;
    new.delivery_fee := 0;
    new.tax_amount := 0;
    new.confirmed_at := null;
    new.delivered_at := null;
    new.cancelled_at := null;
  end if;

  if new.address_id is not null then
    select *
    into address_row
    from public.addresses a
    where a.id = new.address_id
      and a.profile_id = new.customer_profile_id;

    if not found then
      raise exception 'Delivery address does not belong to the order customer';
    end if;

    new.delivery_address := jsonb_build_object(
      'label', address_row.label,
      'recipient_name', address_row.recipient_name,
      'phone', address_row.phone,
      'address_line', address_row.address_line,
      'city', address_row.city,
      'district', address_row.district,
      'landmark', address_row.landmark,
      'latitude', address_row.latitude,
      'longitude', address_row.longitude,
      'delivery_instructions', address_row.delivery_instructions
    );
  end if;

  return new;
end;
$$;

create or replace function public.prepare_order_item()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  product_row public.products%rowtype;
  order_supermarket_id uuid;
  order_current_status public.order_status;
begin
  select o.supermarket_id, o.status
  into order_supermarket_id, order_current_status
  from public.orders o
  where o.id = new.order_id;

  if order_current_status <> 'pending' then
    raise exception 'Order items can only be changed while an order is pending';
  end if;

  if new.product_id is null then
    if public.current_profile_id() is not null and not public.is_admin() then
      raise exception 'A product is required for a new order item';
    end if;
    return new;
  end if;

  select *
  into product_row
  from public.products p
  where p.id = new.product_id
    and p.supermarket_id = order_supermarket_id
    and p.is_active;

  if not found then
    raise exception 'Product is unavailable or belongs to another supermarket';
  end if;

  if product_row.track_inventory and new.quantity > product_row.stock_quantity then
    raise exception 'Requested quantity exceeds available stock';
  end if;

  new.product_name := product_row.name;
  new.product_sku := product_row.sku;
  new.unit := product_row.unit;
  new.unit_price := product_row.price;
  new.product_snapshot := jsonb_build_object(
    'product_id', product_row.id,
    'name', product_row.name,
    'sku', product_row.sku,
    'barcode', product_row.barcode,
    'unit', product_row.unit,
    'price', product_row.price
  );

  return new;
end;
$$;

create or replace function public.recalculate_order_subtotal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_order_id uuid;
begin
  target_order_id := case
    when tg_op = 'DELETE' then old.order_id
    else new.order_id
  end;

  perform set_config('quickmart.internal_order_recalculation', 'true', true);

  update public.orders
  set subtotal = coalesce((
    select sum(oi.line_total)
    from public.order_items oi
    where oi.order_id = target_order_id
  ), 0)
  where id = target_order_id;

  perform set_config('quickmart.internal_order_recalculation', 'false', true);

  return coalesce(new, old);
end;
$$;

create or replace function public.enforce_order_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := public.current_profile_id();
  actor_role text := public.current_app_role();
begin
  if current_setting('quickmart.internal_order_recalculation', true) = 'true' then
    return new;
  end if;

  if actor_id is null or actor_role = 'admin' then
    return new;
  end if;

  if new.customer_profile_id <> old.customer_profile_id
    or new.supermarket_id <> old.supermarket_id
    or new.address_id is distinct from old.address_id
    or new.order_number <> old.order_number
    or new.payment_method <> old.payment_method
    or new.currency_code <> old.currency_code
    or new.subtotal <> old.subtotal
    or new.discount_amount <> old.discount_amount
    or new.delivery_fee <> old.delivery_fee
    or new.tax_amount <> old.tax_amount
    or new.delivery_address <> old.delivery_address
  then
    raise exception 'Immutable order fields cannot be changed';
  end if;

  if actor_role = 'customer' then
    if old.customer_profile_id <> actor_id then
      raise exception 'Customers can only update their own orders';
    end if;

    if new.status <> old.status and not (
      new.status = 'cancelled'
      and old.status in ('pending', 'confirmed')
    ) then
      raise exception 'Customer order status transition is not allowed';
    end if;

    new.vendor_notes := old.vendor_notes;
    new.confirmed_at := old.confirmed_at;
    new.delivered_at := old.delivered_at;
    new.cancelled_at := old.cancelled_at;

    if new.status = 'cancelled' and old.status <> 'cancelled' then
      new.cancelled_at := now();
    end if;
  elsif actor_role = 'vendor' then
    if not public.owns_supermarket(old.supermarket_id) then
      raise exception 'Vendors can only update orders for their supermarket';
    end if;

    if new.status <> old.status and not (
      (old.status = 'pending' and new.status in ('confirmed', 'cancelled'))
      or (old.status = 'confirmed' and new.status in ('preparing', 'cancelled'))
      or (old.status = 'preparing' and new.status in ('ready_for_pickup', 'cancelled'))
      or (old.status = 'ready_for_pickup' and new.status = 'out_for_delivery')
      or (old.status = 'out_for_delivery' and new.status = 'delivered')
    ) then
      raise exception 'Vendor order status transition is not allowed';
    end if;

    new.customer_notes := old.customer_notes;
    new.confirmed_at := old.confirmed_at;
    new.delivered_at := old.delivered_at;
    new.cancelled_at := old.cancelled_at;

    if new.status = 'confirmed' and old.status <> 'confirmed' then
      new.confirmed_at := now();
    elsif new.status = 'delivered' and old.status <> 'delivered' then
      new.delivered_at := now();
    elsif new.status = 'cancelled' and old.status <> 'cancelled' then
      new.cancelled_at := now();
    end if;
  else
    raise exception 'This role cannot update orders';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_delivery_agent_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := public.current_profile_id();
begin
  if actor_id is null or public.is_admin() then
    return new;
  end if;

  if old.profile_id <> actor_id then
    raise exception 'Delivery agents can only update their own record';
  end if;

  new.profile_id := old.profile_id;
  new.vehicle_type := old.vehicle_type;
  new.vehicle_registration := old.vehicle_registration;
  new.license_number := old.license_number;
  new.max_active_deliveries := old.max_active_deliveries;

  if new.status <> old.status and not (
    old.status in ('available', 'busy', 'offline')
    and new.status in ('available', 'busy', 'offline')
  ) then
    raise exception 'Delivery agent status transition requires administrator approval';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_delivery_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := public.current_profile_id();
begin
  if actor_id is null or public.is_admin() then
    return new;
  end if;

  if not public.is_assigned_delivery(old.id) then
    raise exception 'Delivery agents can only update assigned deliveries';
  end if;

  new.order_id := old.order_id;
  new.delivery_agent_id := old.delivery_agent_id;
  new.pickup_address := old.pickup_address;
  new.delivery_address := old.delivery_address;
  new.delivery_fee := old.delivery_fee;
  new.assigned_at := old.assigned_at;

  if new.status <> old.status and not (
    (old.status = 'assigned' and new.status in ('picked_up', 'failed'))
    or (old.status = 'picked_up' and new.status in ('in_transit', 'failed'))
    or (old.status = 'in_transit' and new.status in ('delivered', 'failed'))
  ) then
    raise exception 'Delivery status transition is not allowed';
  end if;

  new.picked_up_at := old.picked_up_at;
  new.delivered_at := old.delivered_at;
  new.failed_at := old.failed_at;

  if new.status = 'picked_up' and old.status <> 'picked_up' then
    new.picked_up_at := now();
  elsif new.status = 'delivered' and old.status <> 'delivered' then
    new.delivered_at := now();
  elsif new.status = 'failed' and old.status <> 'failed' then
    new.failed_at := now();
  end if;

  return new;
end;
$$;

create or replace function public.validate_promotion_target()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.product_id is not null and not exists (
    select 1
    from public.products p
    where p.id = new.product_id
      and p.supermarket_id = new.supermarket_id
  ) then
    raise exception 'Promotion product must belong to its supermarket';
  end if;

  return new;
end;
$$;

create or replace function public.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_id uuid;
begin
  row_id := case
    when tg_op = 'DELETE' then old.id
    else new.id
  end;

  insert into public.activity_logs (
    actor_profile_id,
    action,
    entity_type,
    entity_id,
    old_data,
    new_data,
    request_id
  )
  values (
    public.current_profile_id(),
    lower(tg_op),
    tg_table_name,
    row_id,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end,
    nullif(
      nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-request-id',
      ''
    )
  );

  return coalesce(new, old);
exception
  when others then
    raise warning 'QuickMart audit log failed for %.%: %', tg_table_schema, tg_table_name, sqlerrm;
    return coalesce(new, old);
end;
$$;

create trigger profiles_enforce_role
before insert or update on public.profiles
for each row execute function public.enforce_profile_role();

create trigger supermarkets_validate_owner
before insert or update on public.supermarkets
for each row execute function public.validate_supermarket_owner();

create trigger orders_prepare
before insert on public.orders
for each row execute function public.prepare_order();

create trigger orders_enforce_update
before update on public.orders
for each row execute function public.enforce_order_update();

create trigger order_items_prepare
before insert or update on public.order_items
for each row execute function public.prepare_order_item();

create trigger order_items_recalculate_order
after insert or update or delete on public.order_items
for each row execute function public.recalculate_order_subtotal();

create trigger promotions_validate_target
before insert or update on public.promotions
for each row execute function public.validate_promotion_target();

create trigger delivery_agents_enforce_update
before update on public.delivery_agents
for each row execute function public.enforce_delivery_agent_update();

create trigger deliveries_enforce_update
before update on public.deliveries
for each row execute function public.enforce_delivery_update();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'roles',
    'profiles',
    'supermarkets',
    'categories',
    'products',
    'product_images',
    'addresses',
    'carts',
    'cart_items',
    'orders',
    'order_items',
    'payments',
    'delivery_agents',
    'deliveries',
    'notifications',
    'promotions'
  ]
  loop
    execute format(
      'create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'supermarkets',
    'products',
    'orders',
    'payments',
    'deliveries',
    'promotions'
  ]
  loop
    execute format(
      'create trigger %I_audit after insert or update or delete on public.%I for each row execute function public.audit_row_change()',
      table_name,
      table_name
    );
  end loop;
end;
$$;

revoke all on function public.set_updated_at() from public;
revoke all on function public.current_auth_user_id() from public;
revoke all on function public.current_profile_id() from public;
revoke all on function public.current_app_role() from public;
revoke all on function public.has_role(text) from public;
revoke all on function public.is_admin() from public;
revoke all on function public.owns_supermarket(uuid) from public;
revoke all on function public.owns_order(uuid) from public;
revoke all on function public.manages_order(uuid) from public;
revoke all on function public.owns_cart(uuid) from public;
revoke all on function public.is_assigned_delivery(uuid) from public;
revoke all on function public.enforce_profile_role() from public;
revoke all on function public.handle_new_auth_user() from public;
revoke all on function public.validate_supermarket_owner() from public;
revoke all on function public.prepare_order() from public;
revoke all on function public.prepare_order_item() from public;
revoke all on function public.recalculate_order_subtotal() from public;
revoke all on function public.enforce_order_update() from public;
revoke all on function public.enforce_delivery_agent_update() from public;
revoke all on function public.enforce_delivery_update() from public;
revoke all on function public.validate_promotion_target() from public;
revoke all on function public.audit_row_change() from public;

grant execute on function public.current_auth_user_id() to anon, authenticated, service_role;
grant execute on function public.current_profile_id() to authenticated, service_role;
grant execute on function public.current_app_role() to authenticated, service_role;
grant execute on function public.has_role(text) to authenticated, service_role;
grant execute on function public.is_admin() to authenticated, service_role;
grant execute on function public.owns_supermarket(uuid) to authenticated, service_role;
grant execute on function public.owns_order(uuid) to authenticated, service_role;
grant execute on function public.manages_order(uuid) to authenticated, service_role;
grant execute on function public.owns_cart(uuid) to authenticated, service_role;
grant execute on function public.is_assigned_delivery(uuid) to authenticated, service_role;

grant usage on schema public to anon, authenticated, service_role;
grant select on public.supermarkets, public.categories, public.products, public.product_images, public.promotions to anon;
grant select, insert, update, delete on
  public.roles,
  public.profiles,
  public.supermarkets,
  public.categories,
  public.products,
  public.product_images,
  public.addresses,
  public.carts,
  public.cart_items,
  public.orders,
  public.order_items,
  public.payments,
  public.delivery_agents,
  public.deliveries,
  public.notifications,
  public.activity_logs,
  public.promotions
to authenticated;
grant all on
  public.roles,
  public.profiles,
  public.supermarkets,
  public.categories,
  public.products,
  public.product_images,
  public.addresses,
  public.carts,
  public.cart_items,
  public.orders,
  public.order_items,
  public.payments,
  public.delivery_agents,
  public.deliveries,
  public.notifications,
  public.activity_logs,
  public.promotions
to service_role;
grant usage, select on sequence public.order_number_seq to authenticated, service_role;

commit;
