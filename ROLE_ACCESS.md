# QuickMart SL role access

QuickMart has four database-authoritative roles. A user's destination is
resolved after sign-in from `profiles.role_id`.

| Role | Home route | Provisioning requirement |
| --- | --- | --- |
| Customer | `/account` | Created automatically at sign-up |
| Admin | `/admin` | Bootstrap once through SQL, then manage in Admin → Users |
| Vendor | `/vendor` | Vendor role plus an assigned supermarket |
| Delivery agent | `/delivery` | Delivery-agent role; the admin role update provisions the agent record |

## First administrator

1. Create an account through `/sign-up` and confirm its email.
2. Open `supabase/bootstrap-first-admin.sql`.
3. Replace `CHANGE_ME@example.com` with the account email.
4. Run the script in Supabase SQL Editor.
5. Sign out and sign back in. The account redirects to `/admin`.

The script refuses to run without an edited email and requires exactly one
matching profile. The application prevents demoting the final active admin.

## Customer

Create a normal account through `/sign-up`. New accounts are always customers.
After confirmation and sign-in, they redirect to `/account`.

## Vendor

1. Ensure `supabase/seed.sql` has been run so supermarkets exist.
2. Create a separate account through `/sign-up`.
3. Sign in as admin and open `/admin/users`.
4. Change the user's role to `vendor`.
5. Open `/admin/supermarkets`.
6. Choose that vendor in a supermarket's Vendor selector and set the store to
   `active`.
7. Sign into the vendor account. It redirects to `/vendor`.

A vendor without an assigned supermarket cannot use the vendor dashboard.

## Delivery agent

1. Create a separate account through `/sign-up`.
2. Sign in as admin and open `/admin/users`.
3. Change the user's role to `delivery_agent`.
4. QuickMart automatically creates an available `delivery_agents` record.
5. Assign deliveries from `/admin/deliveries`.
6. Sign into the delivery account. It redirects to `/delivery`, where the
   agent can move assigned jobs through picked-up, in-transit, delivered, or
   failed states.

## Switching roles while testing

Use a separate browser profile or private window for each account. If an
administrator changes a user's role while that user is signed in, sign out and
back in or visit `/auth/redirect` to resolve the new home route.
