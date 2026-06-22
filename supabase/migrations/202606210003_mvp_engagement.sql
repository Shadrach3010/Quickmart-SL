begin;

create table public.order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on update cascade on delete cascade,
  status public.order_status not null,
  title text not null,
  description text,
  location text,
  created_by_profile_id uuid references public.profiles(id) on update cascade on delete set null,
  created_at timestamptz not null default now(),
  constraint order_status_events_title_not_blank check (btrim(title) <> '')
);

create index order_status_events_order_created_idx
  on public.order_status_events (order_id, created_at);

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on update cascade on delete cascade,
  product_id uuid not null references public.products(id) on update cascade on delete cascade,
  created_at timestamptz not null default now(),
  unique (profile_id, product_id)
);

create index favorites_profile_created_idx
  on public.favorites (profile_id, created_at desc);
create index favorites_product_id_idx on public.favorites (product_id);

create table public.recently_viewed_products (
  profile_id uuid not null references public.profiles(id) on update cascade on delete cascade,
  product_id uuid not null references public.products(id) on update cascade on delete cascade,
  viewed_at timestamptz not null default now(),
  view_count integer not null default 1 check (view_count > 0),
  primary key (profile_id, product_id)
);

create index recently_viewed_profile_idx
  on public.recently_viewed_products (profile_id, viewed_at desc);

create table public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on update cascade on delete cascade,
  profile_id uuid not null references public.profiles(id) on update cascade on delete cascade,
  order_item_id uuid references public.order_items(id) on update cascade on delete set null,
  rating smallint not null check (rating between 1 and 5),
  title text,
  body text,
  is_verified_purchase boolean not null default false,
  is_approved boolean not null default true,
  vendor_response text,
  vendor_responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, product_id),
  constraint product_reviews_body_length check (body is null or char_length(body) <= 2000)
);

create index product_reviews_product_approved_idx
  on public.product_reviews (product_id, created_at desc)
  where is_approved;
create index product_reviews_profile_idx
  on public.product_reviews (profile_id, created_at desc);

create table public.supermarket_reviews (
  id uuid primary key default gen_random_uuid(),
  supermarket_id uuid not null references public.supermarkets(id) on update cascade on delete cascade,
  profile_id uuid not null references public.profiles(id) on update cascade on delete cascade,
  order_id uuid references public.orders(id) on update cascade on delete set null,
  rating smallint not null check (rating between 1 and 5),
  body text,
  is_verified_order boolean not null default false,
  is_approved boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, supermarket_id),
  constraint supermarket_reviews_body_length check (body is null or char_length(body) <= 2000)
);

create index supermarket_reviews_store_approved_idx
  on public.supermarket_reviews (supermarket_id, created_at desc)
  where is_approved;

create table public.promotion_redemptions (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references public.promotions(id) on update cascade on delete restrict,
  profile_id uuid not null references public.profiles(id) on update cascade on delete restrict,
  order_id uuid not null unique references public.orders(id) on update cascade on delete restrict,
  discount_amount numeric(12, 2) not null check (discount_amount >= 0),
  created_at timestamptz not null default now()
);

create index promotion_redemptions_customer_idx
  on public.promotion_redemptions (profile_id, promotion_id, created_at desc);

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_profile_id uuid not null references public.profiles(id) on update cascade on delete restrict,
  referred_profile_id uuid unique references public.profiles(id) on update cascade on delete restrict,
  referral_code text not null,
  status text not null default 'invited'
    check (status in ('invited', 'joined', 'qualified', 'rewarded', 'expired')),
  referrer_reward_amount numeric(12, 2) not null default 0 check (referrer_reward_amount >= 0),
  referred_reward_amount numeric(12, 2) not null default 0 check (referred_reward_amount >= 0),
  qualified_at timestamptz,
  rewarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint referrals_not_self check (referred_profile_id is null or referred_profile_id <> referrer_profile_id),
  constraint referrals_code_format check (referral_code ~ '^[A-Z0-9]{6,16}$')
);

create index referrals_referrer_idx
  on public.referrals (referrer_profile_id, created_at desc);
create index referrals_code_idx on public.referrals (referral_code);

create trigger product_reviews_set_updated_at before update on public.product_reviews
for each row execute function public.set_updated_at();
create trigger supermarket_reviews_set_updated_at before update on public.supermarket_reviews
for each row execute function public.set_updated_at();
create trigger referrals_set_updated_at before update on public.referrals
for each row execute function public.set_updated_at();

alter table public.order_status_events enable row level security;
alter table public.favorites enable row level security;
alter table public.recently_viewed_products enable row level security;
alter table public.product_reviews enable row level security;
alter table public.supermarket_reviews enable row level security;
alter table public.promotion_redemptions enable row level security;
alter table public.referrals enable row level security;

create policy "order_events_customer_read_own" on public.order_status_events for select
to authenticated using (public.owns_order(order_id));
create policy "order_events_vendor_manage_own" on public.order_status_events for all
to authenticated using (public.has_role('vendor') and public.manages_order(order_id))
with check (public.has_role('vendor') and public.manages_order(order_id));
create policy "order_events_admin_all" on public.order_status_events for all
to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "favorites_customer_all_own" on public.favorites for all
to authenticated using (profile_id = public.current_profile_id())
with check (profile_id = public.current_profile_id() and public.has_role('customer'));
create policy "favorites_admin_all" on public.favorites for all
to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "recent_views_customer_all_own" on public.recently_viewed_products for all
to authenticated using (profile_id = public.current_profile_id())
with check (profile_id = public.current_profile_id() and public.has_role('customer'));
create policy "recent_views_admin_all" on public.recently_viewed_products for all
to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "product_reviews_public_read" on public.product_reviews for select
to anon, authenticated using (is_approved);
create policy "product_reviews_customer_insert" on public.product_reviews for insert
to authenticated with check (profile_id = public.current_profile_id() and public.has_role('customer'));
create policy "product_reviews_customer_update_own" on public.product_reviews for update
to authenticated using (profile_id = public.current_profile_id())
with check (profile_id = public.current_profile_id());
create policy "product_reviews_admin_all" on public.product_reviews for all
to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "supermarket_reviews_public_read" on public.supermarket_reviews for select
to anon, authenticated using (is_approved);
create policy "supermarket_reviews_customer_insert" on public.supermarket_reviews for insert
to authenticated with check (profile_id = public.current_profile_id() and public.has_role('customer'));
create policy "supermarket_reviews_customer_update_own" on public.supermarket_reviews for update
to authenticated using (profile_id = public.current_profile_id())
with check (profile_id = public.current_profile_id());
create policy "supermarket_reviews_admin_all" on public.supermarket_reviews for all
to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "redemptions_customer_read_own" on public.promotion_redemptions for select
to authenticated using (profile_id = public.current_profile_id());
create policy "redemptions_admin_all" on public.promotion_redemptions for all
to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "referrals_customer_read_own" on public.referrals for select
to authenticated using (
  referrer_profile_id = public.current_profile_id()
  or referred_profile_id = public.current_profile_id()
);
create policy "referrals_customer_create_own" on public.referrals for insert
to authenticated with check (
  referrer_profile_id = public.current_profile_id()
  and public.has_role('customer')
);
create policy "referrals_admin_all" on public.referrals for all
to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.order_status_events, public.product_reviews, public.supermarket_reviews
to anon;
grant select, insert, update, delete on
  public.order_status_events, public.favorites, public.recently_viewed_products,
  public.product_reviews, public.supermarket_reviews, public.promotion_redemptions,
  public.referrals
to authenticated;
grant all on
  public.order_status_events, public.favorites, public.recently_viewed_products,
  public.product_reviews, public.supermarket_reviews, public.promotion_redemptions,
  public.referrals
to service_role;

commit;
