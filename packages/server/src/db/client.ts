import 'server-only';

import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema';

type Database = NodePgDatabase<typeof schema>;
type DatabaseGlobals = typeof globalThis & {
  reactH5Database?: Database;
  reactH5Pool?: Pool;
};

const databaseGlobals = globalThis as DatabaseGlobals;

export function getDatabase(): Database | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  if (!databaseGlobals.reactH5Pool) {
    databaseGlobals.reactH5Pool = new Pool({
      connectionString,
      max: process.env.NODE_ENV === 'development' ? 5 : 10,
      ssl: process.env.PGSSL === 'require' ? { rejectUnauthorized: false } : undefined,
    });
  }

  databaseGlobals.reactH5Database ??= drizzle(databaseGlobals.reactH5Pool, { schema });
  return databaseGlobals.reactH5Database;
}
