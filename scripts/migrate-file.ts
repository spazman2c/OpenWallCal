import { readFileSync } from 'fs';
import { pglite } from '../lib/pglite-db';

async function main() {
  const migration = readFileSync('supabase/migrations/0001_local_mvp.sql', 'utf8')
    .replace(/create extension if not exists pgcrypto;/gi, '')
    .replace(/default gen_random_uuid\(\)/gi, 'default gen_random_uuid()');
  await pglite.query("create extension if not exists pgcrypto").catch(() => undefined);
  await pglite.exec(migration);
  console.log(`Migrated local file database at ${process.env.LOCAL_DB_PATH ?? './data/openwallcal.db'}`);
}

main().finally(() => pglite.close());
