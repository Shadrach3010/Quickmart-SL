# QuickMart SL Architecture

The `app` directory is reserved for route composition and layouts. Domain code
lives in top-level feature, service, type, validation, provider, hook, and store
folders.

## Route groups

- `(public)` contains anonymous marketplace routes.
- `(auth)` contains sign-in and sign-up routes.
- `(dashboard)` requires an authenticated Supabase JWT session.
- `(dashboard)/(customer)` requires the `customer` role.
- `(dashboard)/admin` requires the `admin` role.
- `(dashboard)/vendor` requires the `vendor` role.
- `(dashboard)/delivery` requires the `delivery_agent` role.

No route pages are included yet. A folder becomes reachable only after a
`page.tsx` or `route.ts` is added.

## Authorization

`proxy.ts` performs a fast, optimistic HTTP-only cookie check. Every protected
server operation also calls `requireUser` or `requireRole`; proxy checks are
not a substitute for Supabase JWT verification and RLS.

## Supabase

The repository does not include `@supabase/supabase-js` or `@supabase/ssr`.
The `lib/supabase` boundary uses Supabase Auth, REST, and Storage HTTP
interfaces directly and keeps the client replaceable.

Replace the placeholder `Database` interface with generated Supabase database
types after the schema is created.

Database migrations, RLS policies, seed data, and the Supabase Auth identity
contract are documented in [`supabase/README.md`](supabase/README.md).

JWT sessions, password flows, role assignment, and redirect behavior are documented in
[`AUTHENTICATION.md`](AUTHENTICATION.md).

Vendor management routes, Supabase ownership resolution, CRUD endpoints, and
product-image storage are documented in
[`VENDOR_DASHBOARD.md`](VENDOR_DASHBOARD.md).

Platform administration, guarded mutations, reusable data tables, delivery
assignment, and analytics are documented in
[`ADMIN_DASHBOARD.md`](ADMIN_DASHBOARD.md).

Production environment variables, Supabase migration order, Auth URL
configuration, and Vercel release checks are documented in
[`VERCEL_DEPLOYMENT.md`](VERCEL_DEPLOYMENT.md).

First-admin bootstrap and customer, vendor, administrator, and delivery-agent
provisioning are documented in [`ROLE_ACCESS.md`](ROLE_ACCESS.md).
