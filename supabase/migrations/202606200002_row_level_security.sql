begin;

alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.supermarkets enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.addresses enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.delivery_agents enable row level security;
alter table public.deliveries enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;
alter table public.promotions enable row level security;

create policy "roles_authenticated_read"
on public.roles for select
to authenticated
using (true);

create policy "roles_admin_all"
on public.roles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "profiles_read_own"
on public.profiles for select
to authenticated
using (id = public.current_profile_id());

create policy "profiles_create_own_customer_profile"
on public.profiles for insert
to authenticated
with check (
  auth_user_id = public.current_auth_user_id()
  and role_id = (select id from public.roles where name = 'customer')
);

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = public.current_profile_id())
with check (id = public.current_profile_id());

create policy "profiles_admin_all"
on public.profiles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "supermarkets_public_read_active"
on public.supermarkets for select
to anon, authenticated
using (status = 'active');

create policy "supermarkets_vendor_read_own"
on public.supermarkets for select
to authenticated
using (
  public.has_role('vendor')
  and owner_profile_id = public.current_profile_id()
);

create policy "supermarkets_vendor_insert_own"
on public.supermarkets for insert
to authenticated
with check (
  public.has_role('vendor')
  and owner_profile_id = public.current_profile_id()
  and status = 'pending'
);

create policy "supermarkets_vendor_update_own"
on public.supermarkets for update
to authenticated
using (
  public.has_role('vendor')
  and owner_profile_id = public.current_profile_id()
)
with check (
  public.has_role('vendor')
  and owner_profile_id = public.current_profile_id()
);

create policy "supermarkets_vendor_delete_pending_own"
on public.supermarkets for delete
to authenticated
using (
  public.has_role('vendor')
  and owner_profile_id = public.current_profile_id()
  and status = 'pending'
);

create policy "supermarkets_admin_all"
on public.supermarkets for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "categories_public_read_active"
on public.categories for select
to anon, authenticated
using (is_active);

create policy "categories_admin_all"
on public.categories for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "products_public_read_active"
on public.products for select
to anon, authenticated
using (
  is_active
  and exists (
    select 1
    from public.supermarkets s
    where s.id = products.supermarket_id
      and s.status = 'active'
  )
);

create policy "products_vendor_read_own"
on public.products for select
to authenticated
using (
  public.has_role('vendor')
  and public.owns_supermarket(supermarket_id)
);

create policy "products_vendor_insert_own"
on public.products for insert
to authenticated
with check (
  public.has_role('vendor')
  and public.owns_supermarket(supermarket_id)
);

create policy "products_vendor_update_own"
on public.products for update
to authenticated
using (
  public.has_role('vendor')
  and public.owns_supermarket(supermarket_id)
)
with check (
  public.has_role('vendor')
  and public.owns_supermarket(supermarket_id)
);

create policy "products_vendor_delete_own"
on public.products for delete
to authenticated
using (
  public.has_role('vendor')
  and public.owns_supermarket(supermarket_id)
);

create policy "products_admin_all"
on public.products for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "product_images_public_read_active_products"
on public.product_images for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products p
    join public.supermarkets s on s.id = p.supermarket_id
    where p.id = product_images.product_id
      and p.is_active
      and s.status = 'active'
  )
);

create policy "product_images_vendor_all_own"
on public.product_images for all
to authenticated
using (
  public.has_role('vendor')
  and exists (
    select 1
    from public.products p
    where p.id = product_images.product_id
      and public.owns_supermarket(p.supermarket_id)
  )
)
with check (
  public.has_role('vendor')
  and exists (
    select 1
    from public.products p
    where p.id = product_images.product_id
      and public.owns_supermarket(p.supermarket_id)
  )
);

create policy "product_images_admin_all"
on public.product_images for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "addresses_customer_all_own"
on public.addresses for all
to authenticated
using (
  public.has_role('customer')
  and profile_id = public.current_profile_id()
)
with check (
  public.has_role('customer')
  and profile_id = public.current_profile_id()
);

create policy "addresses_admin_all"
on public.addresses for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "carts_customer_all_own"
on public.carts for all
to authenticated
using (
  public.has_role('customer')
  and customer_profile_id = public.current_profile_id()
)
with check (
  public.has_role('customer')
  and customer_profile_id = public.current_profile_id()
);

create policy "carts_admin_all"
on public.carts for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "cart_items_customer_all_own_cart"
on public.cart_items for all
to authenticated
using (
  public.has_role('customer')
  and public.owns_cart(cart_id)
)
with check (
  public.has_role('customer')
  and public.owns_cart(cart_id)
  and exists (
    select 1
    from public.products p
    join public.supermarkets s on s.id = p.supermarket_id
    where p.id = cart_items.product_id
      and p.is_active
      and (not p.track_inventory or p.stock_quantity >= cart_items.quantity)
      and s.status = 'active'
  )
);

create policy "cart_items_admin_all"
on public.cart_items for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "orders_customer_read_own"
on public.orders for select
to authenticated
using (
  public.has_role('customer')
  and customer_profile_id = public.current_profile_id()
);

create policy "orders_customer_create_own"
on public.orders for insert
to authenticated
with check (
  public.has_role('customer')
  and customer_profile_id = public.current_profile_id()
  and status = 'pending'
  and exists (
    select 1
    from public.supermarkets s
    where s.id = orders.supermarket_id
      and s.status = 'active'
  )
);

create policy "orders_customer_update_own"
on public.orders for update
to authenticated
using (
  public.has_role('customer')
  and customer_profile_id = public.current_profile_id()
)
with check (
  public.has_role('customer')
  and customer_profile_id = public.current_profile_id()
);

create policy "orders_vendor_read_own_supermarket"
on public.orders for select
to authenticated
using (
  public.has_role('vendor')
  and public.owns_supermarket(supermarket_id)
);

create policy "orders_vendor_update_own_supermarket"
on public.orders for update
to authenticated
using (
  public.has_role('vendor')
  and public.owns_supermarket(supermarket_id)
)
with check (
  public.has_role('vendor')
  and public.owns_supermarket(supermarket_id)
);

create policy "orders_admin_all"
on public.orders for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "order_items_customer_read_own_order"
on public.order_items for select
to authenticated
using (
  public.has_role('customer')
  and public.owns_order(order_id)
);

create policy "order_items_customer_create_pending_order"
on public.order_items for insert
to authenticated
with check (
  public.has_role('customer')
  and public.owns_order(order_id)
  and exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and o.status = 'pending'
  )
);

create policy "order_items_customer_update_pending_order"
on public.order_items for update
to authenticated
using (
  public.has_role('customer')
  and public.owns_order(order_id)
  and exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and o.status = 'pending'
  )
)
with check (
  public.has_role('customer')
  and public.owns_order(order_id)
);

create policy "order_items_customer_delete_pending_order"
on public.order_items for delete
to authenticated
using (
  public.has_role('customer')
  and public.owns_order(order_id)
  and exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and o.status = 'pending'
  )
);

create policy "order_items_vendor_read_own_order"
on public.order_items for select
to authenticated
using (
  public.has_role('vendor')
  and public.manages_order(order_id)
);

create policy "order_items_admin_all"
on public.order_items for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "payments_customer_read_own_order"
on public.payments for select
to authenticated
using (
  public.has_role('customer')
  and public.owns_order(order_id)
);

create policy "payments_vendor_read_own_order"
on public.payments for select
to authenticated
using (
  public.has_role('vendor')
  and public.manages_order(order_id)
);

create policy "payments_admin_all"
on public.payments for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "delivery_agents_read_own"
on public.delivery_agents for select
to authenticated
using (
  public.has_role('delivery_agent')
  and profile_id = public.current_profile_id()
);

create policy "delivery_agents_update_own_location"
on public.delivery_agents for update
to authenticated
using (
  public.has_role('delivery_agent')
  and profile_id = public.current_profile_id()
)
with check (
  public.has_role('delivery_agent')
  and profile_id = public.current_profile_id()
);

create policy "delivery_agents_admin_all"
on public.delivery_agents for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "deliveries_customer_read_own_order"
on public.deliveries for select
to authenticated
using (
  public.has_role('customer')
  and public.owns_order(order_id)
);

create policy "deliveries_vendor_read_own_order"
on public.deliveries for select
to authenticated
using (
  public.has_role('vendor')
  and public.manages_order(order_id)
);

create policy "deliveries_agent_read_assigned"
on public.deliveries for select
to authenticated
using (
  public.has_role('delivery_agent')
  and public.is_assigned_delivery(id)
);

create policy "deliveries_agent_update_assigned"
on public.deliveries for update
to authenticated
using (
  public.has_role('delivery_agent')
  and public.is_assigned_delivery(id)
)
with check (
  public.has_role('delivery_agent')
  and public.is_assigned_delivery(id)
);

create policy "deliveries_admin_all"
on public.deliveries for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "notifications_read_own"
on public.notifications for select
to authenticated
using (profile_id = public.current_profile_id());

create policy "notifications_update_own"
on public.notifications for update
to authenticated
using (profile_id = public.current_profile_id())
with check (profile_id = public.current_profile_id());

create policy "notifications_delete_own"
on public.notifications for delete
to authenticated
using (profile_id = public.current_profile_id());

create policy "notifications_admin_all"
on public.notifications for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "activity_logs_admin_all"
on public.activity_logs for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "promotions_public_read_active"
on public.promotions for select
to anon, authenticated
using (
  is_active
  and now() between starts_at and ends_at
  and (usage_limit is null or usage_count < usage_limit)
  and exists (
    select 1
    from public.supermarkets s
    where s.id = promotions.supermarket_id
      and s.status = 'active'
  )
);

create policy "promotions_vendor_read_own"
on public.promotions for select
to authenticated
using (
  public.has_role('vendor')
  and public.owns_supermarket(supermarket_id)
);

create policy "promotions_vendor_insert_own"
on public.promotions for insert
to authenticated
with check (
  public.has_role('vendor')
  and public.owns_supermarket(supermarket_id)
);

create policy "promotions_vendor_update_own"
on public.promotions for update
to authenticated
using (
  public.has_role('vendor')
  and public.owns_supermarket(supermarket_id)
)
with check (
  public.has_role('vendor')
  and public.owns_supermarket(supermarket_id)
);

create policy "promotions_vendor_delete_own"
on public.promotions for delete
to authenticated
using (
  public.has_role('vendor')
  and public.owns_supermarket(supermarket_id)
);

create policy "promotions_admin_all"
on public.promotions for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

commit;
