import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is required');

declare global {
  var __homeboard_sql: ReturnType<typeof postgres> | undefined;
}

export const sql = global.__homeboard_sql ?? postgres(url, { max: 10 });
if (process.env.NODE_ENV !== 'production') global.__homeboard_sql = sql;
