# HomeBoard Calendar

Local-first open-source wall calendar/dashboard MVP for a 15.6-inch kiosk display.

## Local setup

1. Start local Supabase/Postgres.
2. Copy `.env.example` to `.env.local` and set `DATABASE_URL` for your local Supabase database.
3. Install packages with `npm install`.
4. Run `npm run db:migrate`.
5. Optional demo data: `npm run db:seed`.
6. Start the app: `npm run dev`.

Routes:

- Admin app: `/app`
- Wall display: `/display`
- Display pairing: `/display/setup`
- Signup/login: `/signup`, `/login`

The MVP intentionally keeps everything local: Next.js app, local session auth, Supabase-compatible Postgres schema, display device tokens, and polling snapshots.
