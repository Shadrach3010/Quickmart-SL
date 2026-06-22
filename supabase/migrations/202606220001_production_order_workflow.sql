begin;

create or replace function public.prepare_order()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  address_row public.addresses%rowtype;
  actor_id uuid := public.current_profile_id();
  internal_checkout boolean := current_setting('quickmart.internal_checkout', true) = 'true';
begin
  if actor_id is not null and not public.is_admin() then
    new.customer_profile_id := actor_id;
    new.status := 'pending';
    new.currency_code := 'SLE';
    new.confirmed_at := null;
    new.delivered_at := null;
    new.cancelled_at := null;
    if not internal_checkout then
      new.subtotal := 0;
      new.discount_amount := 0;
      new.delivery_fee := 0;
      new.tax_amount := 0;
    end if;
  end if;

  if new.address_id is not null then
    select * into address_row
    from public.addresses a
    where a.id = new.address_id and a.profile_id = new.customer_profile_id;
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

create or replace function public.create_checkout_order(
  checkout_items jsonb,
  checkout_payment_method public.payment_method,
  checkout_address jsonb,
  checkout_coupon text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  customer_id uuid := public.current_profile_id();
  target_store_id uuid;
  target_store public.supermarkets%rowtype;
  new_address_id uuid;
  new_order_id uuid;
  new_order_number text;
  subtotal_value numeric(12,2);
  discount_value numeric(12,2) := 0;
  delivery_value numeric(12,2);
  total_value numeric(12,2);
  promotion_row public.promotions%rowtype;
  item_count integer;
  store_count integer;
begin
  if customer_id is null or not public.has_role('customer') then
    raise exception 'A customer account is required';
  end if;
  if jsonb_typeof(checkout_items) <> 'array' or jsonb_array_length(checkout_items) = 0 then
    raise exception 'Your cart is empty';
  end if;
  if jsonb_typeof(checkout_address) <> 'object' then
    raise exception 'A delivery address is required';
  end if;

  select count(*), count(distinct p.supermarket_id), (array_agg(p.supermarket_id))[1], sum(p.price * i.quantity)
  into item_count, store_count, target_store_id, subtotal_value
  from jsonb_to_recordset(checkout_items) as i(product_id uuid, quantity integer)
  join public.products p on p.id = i.product_id
  join public.supermarkets s on s.id = p.supermarket_id
  where i.quantity between 1 and 99
    and p.is_active
    and s.status = 'active'
    and (not p.track_inventory or p.stock_quantity >= i.quantity);

  if item_count <> jsonb_array_length(checkout_items) then
    raise exception 'One or more products are unavailable or have insufficient stock';
  end if;

  if store_count <> 1 then
    raise exception 'Each order must contain products from one supermarket';
  end if;

  select * into target_store from public.supermarkets where id = target_store_id for update;
  if subtotal_value < target_store.minimum_order_amount then
    raise exception 'The supermarket minimum order amount has not been reached';
  end if;
  delivery_value := target_store.delivery_fee;

  if nullif(upper(btrim(checkout_coupon)), '') is not null then
    select * into promotion_row
    from public.promotions p
    where upper(p.code) = upper(btrim(checkout_coupon))
      and p.supermarket_id = target_store_id
      and p.is_active
      and now() between p.starts_at and p.ends_at
      and (p.usage_limit is null or p.usage_count < p.usage_limit)
      and subtotal_value >= p.minimum_order_amount
    for update;
    if not found then raise exception 'That coupon is invalid or expired'; end if;
    if promotion_row.discount_type = 'fixed_amount' then
      discount_value := least(promotion_row.discount_value, subtotal_value);
    elsif promotion_row.discount_type = 'percentage' then
      discount_value := least(
        subtotal_value * promotion_row.discount_value / 100,
        coalesce(promotion_row.maximum_discount_amount, subtotal_value)
      );
    elsif promotion_row.discount_type = 'free_delivery' then
      delivery_value := 0;
    end if;
  end if;

  insert into public.addresses (
    profile_id, label, recipient_name, phone, address_line, city, district,
    landmark, delivery_instructions, is_default
  ) values (
    customer_id,
    coalesce(nullif(btrim(checkout_address->>'label'), ''), 'Delivery'),
    btrim(checkout_address->>'recipientName'),
    btrim(checkout_address->>'phone'),
    btrim(checkout_address->>'addressLine'),
    coalesce(nullif(btrim(checkout_address->>'city'), ''), 'Freetown'),
    coalesce(nullif(btrim(checkout_address->>'district'), ''), 'Western Area Urban'),
    nullif(btrim(checkout_address->>'landmark'), ''),
    nullif(btrim(checkout_address->>'deliveryInstructions'), ''),
    not exists (select 1 from public.addresses where profile_id = customer_id)
  ) returning id into new_address_id;

  perform set_config('quickmart.internal_checkout', 'true', true);
  insert into public.orders (
    customer_profile_id, supermarket_id, address_id, payment_method,
    subtotal, discount_amount, delivery_fee, delivery_address
  ) values (
    customer_id, target_store_id, new_address_id, checkout_payment_method,
    subtotal_value, discount_value, delivery_value, '{}'::jsonb
  ) returning id, order_number into new_order_id, new_order_number;

  insert into public.order_items (order_id, product_id, product_name, unit, unit_price, quantity)
  select new_order_id, p.id, p.name, p.unit, p.price, i.quantity
  from jsonb_to_recordset(checkout_items) as i(product_id uuid, quantity integer)
  join public.products p on p.id = i.product_id;

  update public.products p
  set stock_quantity = p.stock_quantity - i.quantity
  from jsonb_to_recordset(checkout_items) as i(product_id uuid, quantity integer)
  where p.id = i.product_id and p.track_inventory;

  select total_amount into total_value from public.orders where id = new_order_id;
  insert into public.payments (
    order_id, method, status, amount, provider, idempotency_key
  ) values (
    new_order_id, checkout_payment_method,
    case when checkout_payment_method = 'cash_on_delivery' then 'pending'::public.payment_status else 'processing'::public.payment_status end,
    total_value,
    case checkout_payment_method
      when 'orange_money' then 'Orange Money'
      when 'afrimoney' then 'Afrimoney'
      when 'card' then 'Card'
      else 'Cash on delivery'
    end,
    'checkout-' || new_order_id::text
  );

  insert into public.deliveries (
    order_id, status, pickup_address, delivery_address, delivery_fee, recipient_name
  ) values (
    new_order_id, 'unassigned',
    jsonb_build_object('name', target_store.name, 'address_line', target_store.address_line, 'city', target_store.city),
    (select delivery_address from public.orders where id = new_order_id),
    delivery_value,
    checkout_address->>'recipientName'
  );

  insert into public.order_status_events (
    order_id, status, title, description, created_by_profile_id
  ) values (
    new_order_id, 'pending', 'Order placed', 'Your order was sent to the supermarket.', customer_id
  );

  insert into public.notifications (profile_id, type, title, body, data)
  values (
    customer_id, 'order', 'Order placed',
    'Order ' || new_order_number || ' has been sent to ' || target_store.name || '.',
    jsonb_build_object('order_id', new_order_id, 'href', '/orders')
  );

  if promotion_row.id is not null then
    insert into public.promotion_redemptions (
      promotion_id, profile_id, order_id, discount_amount
    ) values (promotion_row.id, customer_id, new_order_id, discount_value);
    update public.promotions set usage_count = usage_count + 1 where id = promotion_row.id;
  end if;

  return jsonb_build_object(
    'id', new_order_id,
    'orderNumber', new_order_number,
    'total', total_value,
    'paymentStatus', case when checkout_payment_method = 'cash_on_delivery' then 'pending' else 'processing' end
  );
end;
$$;

grant execute on function public.create_checkout_order(jsonb, public.payment_method, jsonb, text)
to authenticated;

commit;
