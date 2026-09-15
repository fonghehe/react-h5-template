import './env.config';

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  out: './drizzle',
  schema: './packages/server/src/db/schema.ts',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://react_h5:react_h5@localhost:5432/react_h5',
  },
  strict: true,
  verbose: true,
});
