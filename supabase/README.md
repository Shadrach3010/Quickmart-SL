# QuickMart SL Supabase database

## Files

- `migrations/202606200001_initial_schema.sql` creates enums, tables,
  constraints, indexes, helper functions, validation triggers, and audit
  triggers.
- `migrations/202606200002_row_level_security.sql` enables RLS and installs
  customer, vendor, delivery-agent, public-catalog, and administrator policies.
- `migrations/2026062100039_supabase_auth_transition.sql` converts an empty
  legacy external-identity profile schema to `auth.users` UUID ownership and
  installs the profile synchronization trigger.
- `seed.sql` seeds roles, the five requested supermarkets, and starter product
  categories with deterministic UUIDs.

## Authentication contract

Supabase Auth JWTs map `auth.uid()` to `profiles.auth_user_id`. QuickMart's
application role is loaded from `profiles.role_id`; RLS deliberately does not
trust client-editable user metadata for authorization.

New self-created profiles are forced to the `customer` role. Promote a user to
vendor, admin, or delivery agent through a trusted service-role process.

Seeded supermarkets have no owner initially. An administrator can assign each
`owner_profile_id` after the relevant vendor profile has been provisioned.

## Apply locally

With the Supabase CLI configured:

```sh
supabase db reset
```

The first migration safely detects the earlier minimal external-auth example
schema. If that legacy table is empty, it removes it before creating the
production QuickMart schema. If it contains data, migration stops instead of
deleting user records.

For a linked remote project, review the generated diff first and then apply
migrations through the normal deployment pipeline. Never expose the service
role key to browser code.

## Order model

A cart may contain products from several supermarkets. Checkout should split
it into one order per supermarket. This gives each vendor unambiguous access
to only its own orders while retaining a single customer cart.
