# QuickMart SL Vercel Deployment

## Required environment variables

Configure these in Vercel for Production, Preview, and Development as
appropriate:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Never expose `SUPABASE_SERVICE_ROLE_KEY` with a `NEXT_PUBLIC_` prefix.

## Database

Apply all migrations in `supabase/migrations` before promoting the deployment.
The engagement migration adds wishlist, review, referral, coupon-redemption,
and order-tracking persistence with RLS.

## Supabase Auth

Enable email/password authentication. Add the production URLs for
`/auth/callback` and `/reset-password` to Authentication → URL Configuration.
Set the Site URL to the production domain.

## Vercel

1. Import the repository as a Next.js project.
2. Keep the default build command: `npm run build`.
3. Add the environment variables above.
4. Deploy a Preview and test authentication, checkout, role redirects, and
   Supabase RLS before promoting to Production.
5. Set `NEXT_PUBLIC_SITE_URL` to the final custom domain and redeploy so
   canonical URLs, Open Graph metadata, robots, and the sitemap use it.

The app uses the Node.js runtime and dynamic route handlers; do not configure
it as a static export.
