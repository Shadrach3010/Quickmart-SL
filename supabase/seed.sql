begin;

insert into public.roles (id, name, description)
values
  ('10000000-0000-4000-8000-000000000001', 'customer', 'Marketplace customer'),
  ('10000000-0000-4000-8000-000000000002', 'vendor', 'Supermarket owner or manager'),
  ('10000000-0000-4000-8000-000000000003', 'admin', 'QuickMart platform administrator'),
  ('10000000-0000-4000-8000-000000000004', 'delivery_agent', 'QuickMart delivery agent')
on conflict (name) do update
set description = excluded.description,
    updated_at = now();

insert into public.supermarkets (
  id,
  name,
  slug,
  description,
  city,
  district,
  status,
  is_featured,
  minimum_order_amount,
  delivery_fee,
  estimated_delivery_minutes
)
values
  (
    '20000000-0000-4000-8000-000000000001',
    'Goodies Supermarket',
    'goodies-supermarket',
    'A leading Freetown supermarket offering groceries, household essentials, and imported goods.',
    'Freetown',
    'Western Area Urban',
    'active',
    true,
    100.00,
    25.00,
    60
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    'Choitram Memorial',
    'choitram-memorial',
    'A trusted supermarket serving Freetown with a broad range of food and household products.',
    'Freetown',
    'Western Area Urban',
    'active',
    true,
    100.00,
    25.00,
    60
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    'Saint Mary''s',
    'saint-marys',
    'Everyday groceries, fresh food, beverages, and household supplies in Freetown.',
    'Freetown',
    'Western Area Urban',
    'active',
    true,
    75.00,
    20.00,
    50
  ),
  (
    '20000000-0000-4000-8000-000000000004',
    'Ishwari & Sons',
    'ishwari-and-sons',
    'A long-established Freetown retailer with groceries, provisions, and household essentials.',
    'Freetown',
    'Western Area Urban',
    'active',
    true,
    100.00,
    25.00,
    60
  ),
  (
    '20000000-0000-4000-8000-000000000005',
    'Freetown Supermarket',
    'freetown-supermarket',
    'Convenient grocery shopping for customers across Freetown.',
    'Freetown',
    'Western Area Urban',
    'active',
    true,
    75.00,
    20.00,
    50
  )
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    city = excluded.city,
    district = excluded.district,
    status = excluded.status,
    is_featured = excluded.is_featured,
    minimum_order_amount = excluded.minimum_order_amount,
    delivery_fee = excluded.delivery_fee,
    estimated_delivery_minutes = excluded.estimated_delivery_minutes,
    updated_at = now();

insert into public.categories (id, name, slug, sort_order)
values
  ('30000000-0000-4000-8000-000000000001', 'Fresh Produce', 'fresh-produce', 10),
  ('30000000-0000-4000-8000-000000000002', 'Meat & Seafood', 'meat-and-seafood', 20),
  ('30000000-0000-4000-8000-000000000003', 'Dairy & Eggs', 'dairy-and-eggs', 30),
  ('30000000-0000-4000-8000-000000000004', 'Bakery', 'bakery', 40),
  ('30000000-0000-4000-8000-000000000005', 'Pantry', 'pantry', 50),
  ('30000000-0000-4000-8000-000000000006', 'Beverages', 'beverages', 60),
  ('30000000-0000-4000-8000-000000000007', 'Frozen Foods', 'frozen-foods', 70),
  ('30000000-0000-4000-8000-000000000008', 'Household', 'household', 80),
  ('30000000-0000-4000-8000-000000000009', 'Personal Care', 'personal-care', 90),
  ('30000000-0000-4000-8000-000000000010', 'Baby Products', 'baby-products', 100)
on conflict (slug) do update
set name = excluded.name,
    sort_order = excluded.sort_order,
    is_active = true,
    updated_at = now();

commit;
