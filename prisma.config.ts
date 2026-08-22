import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  engine: 'classic',
  schema: 'apps/backend/src/prisma/schema.prisma',
  migrations: {
    path: 'apps/backend/src/prisma/migrations',
    seed: 'npx tsx apps/backend/src/prisma/seed.js',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
