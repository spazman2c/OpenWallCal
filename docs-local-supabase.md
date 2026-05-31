# Local Supabase workflow

OpenWallCal is configured for local Supabase via Docker.

Default local ports:

- App: http://localhost:3000
- Supabase API: http://127.0.0.1:54321
- Supabase Studio: http://127.0.0.1:54323
- Postgres: 127.0.0.1:54322
- Inbucket email: http://127.0.0.1:54324

Commands:

```bash
npm run supabase:start
npm run db:migrate
npm run db:seed
npm run dev
```

For a fresh local setup:

```bash
npm run local:setup
```

The app currently uses local cookie auth and talks directly to local Postgres through `DATABASE_URL`. Supabase Auth/Storage are configured locally for the next implementation pass, but the MVP stays fully local and does not require cloud Supabase.

## Current machine note

This machine already has a Docker Supabase stack running with container names like `supabase_db_StackSalad`. OpenWallCal is configured to use the standard local ports from that running stack:

```txt
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:54322/postgres
SUPABASE_URL=http://127.0.0.1:54321
```

Use this to confirm the Docker services are up:

```bash
npm run docker:supabase:status
```

If you want OpenWallCal to own its own separate Supabase CLI project later, stop the existing Supabase stack first or change ports in `supabase/config.toml` to avoid conflicts.
