# QuickMart SL authentication

QuickMart uses Supabase Auth as its JWT identity provider. No browser-accessible
token storage or third-party identity provider is used.

## Flow

1. Sign-up posts validated credentials to `/api/auth/sign-up`.
2. Supabase Auth creates the user and issues a JWT session, or sends an email
   confirmation link.
3. The `on_auth_user_created` database trigger creates the matching
   `public.profiles` row with the `customer` role.
4. QuickMart stores the access and refresh tokens in secure, HTTP-only,
   same-site cookies.
5. `/auth/redirect` reads the database-authoritative profile role and sends the
   user to `/account`, `/vendor`, `/admin`, or `/delivery`.
6. RLS uses `auth.uid()` to map the Supabase JWT to `profiles.auth_user_id`.

## Session endpoints

- `POST /api/auth/sign-in`
- `POST /api/auth/sign-up`
- `POST /api/auth/sign-out`
- `GET /api/auth/refresh`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/session` for confirmed-email and recovery callbacks

Access tokens use a short-lived HTTP-only cookie. Refresh tokens use a
30-day HTTP-only cookie. Proxy performs only an optimistic cookie check;
server guards and Supabase RLS perform authoritative verification.

## Supabase configuration

In Authentication → URL Configuration:

- Set the local Site URL to `http://localhost:3000` during development.
- Add `http://localhost:3000/auth/callback`.
- Add `http://localhost:3000/reset-password`.
- Add equivalent production URLs before deploying.

Email/password authentication must be enabled. Email confirmation may remain
enabled; QuickMart supports both confirmed and immediate-session sign-up modes.

## Roles

Self-service sign-up always creates a customer. Administrators promote users
through the admin dashboard. The role is stored only in `profiles.role_id`;
client-editable user metadata is never trusted for authorization.
