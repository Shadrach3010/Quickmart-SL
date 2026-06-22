# QuickMart SL Admin Dashboard

The admin surface lives under `/admin` and is protected twice:

1. `proxy.ts` rejects unauthenticated or non-admin navigation early.
2. Every server query and mutation calls `requireRole("admin")` before
   accessing Supabase.

Supabase remains the authorization source of truth. Database RLS uses
`auth.uid()` and `profiles.role_id`.

## Routes

- `/admin` — platform metrics, revenue, commissions, payment health
- `/admin/users` — role and account-status administration
- `/admin/supermarkets` — vendor and supermarket approval/status controls
- `/admin/products` — global catalog moderation and bulk activation
- `/admin/orders` — cross-market order monitoring
- `/admin/payments` — provider and transaction monitoring
- `/admin/deliveries` — delivery-agent assignment and fulfillment tracking
- `/admin/analytics` — GMV, commission, order mix, and store contribution
- `/admin/settings` — commission, fee, support, and maintenance configuration

## Architecture

`components/admin/admin-data-grid.tsx` centralizes search, filtering,
pagination, row selection, and bulk-action behavior. Entity-specific React
Query managers live in `features/admin/components`.

Server-only reads and writes are implemented in
`services/admin-dashboard.ts`. When Supabase environment variables are absent,
the service returns deterministic demo data so the UI remains developable.
Production environments use Supabase Auth JWTs and existing admin RLS.

The `202606210002_platform_settings.sql` migration adds a singleton settings
record with admin-only RLS. Apply migrations before enabling the settings page
in production.
