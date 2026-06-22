# QuickMart SL vendor dashboard

The vendor centre is available under `/vendor` and is protected by both Supabase Auth
authentication and the database-authoritative `vendor` role.

## Pages

- `/vendor` — revenue KPIs, order metrics, sales chart, stock alerts, and
  recent orders.
- `/vendor/products` — product table, create/edit dialog, deletion, and image
  upload.
- `/vendor/inventory` — inline stock management and low-stock filtering.
- `/vendor/orders` — incoming-order filters, detail drawer, and guarded status
  transitions.
- `/vendor/analytics` — revenue trends and top-product performance.
- `/vendor/settings` — storefront and delivery configuration.

## Supabase access

Every vendor query first resolves:

1. the Supabase Auth user;
2. the matching `profiles` row;
3. the supermarket whose `owner_profile_id` matches that profile.

Route handlers then query or mutate only that supermarket. Existing Supabase
RLS policies provide a second authorization boundary.

The product image bucket and its ownership policies are created by:

`supabase/migrations/202606210001_product_image_storage.sql`

Images are limited to JPG, PNG, or WebP files up to 5 MB. Object paths begin
with the supermarket UUID, allowing storage RLS to verify ownership.

## Local development

When Supabase credentials are absent, server-rendered vendor data uses the
seeded dashboard fixtures in `lib/vendor-demo-data.ts`. Mutating route handlers
still require a valid vendor session. With Supabase Auth configured, the
same UI uses live PostgREST and Storage endpoints.
