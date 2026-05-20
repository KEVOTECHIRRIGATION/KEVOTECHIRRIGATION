import { Pool } from 'pg';

const globalForPg = globalThis as unknown as { pgPool: Pool | undefined };

export const db =
  globalForPg.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // increased from 2s → 10s for Render cold starts
    ssl: process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }  // required for Supabase on Render
      : false,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPg.pgPool = db;
}
