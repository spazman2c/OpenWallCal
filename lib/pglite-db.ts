import { PGlite } from '@electric-sql/pglite';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

const dataDir = process.env.LOCAL_DB_PATH ?? './data/openwallcal.db';
mkdirSync(dirname(dataDir), { recursive: true });

declare global {
  var __openwallcal_pglite: PGlite | undefined;
}

export const pglite = global.__openwallcal_pglite ?? new PGlite(dataDir);
if (process.env.NODE_ENV !== 'production') global.__openwallcal_pglite = pglite;
