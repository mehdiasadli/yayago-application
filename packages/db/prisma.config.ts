import path from 'node:path';
import { defineConfig, env } from 'prisma/config';
import dotenv from 'dotenv';

dotenv.config({
  quiet: true,
  path: path.join(process.cwd(), '../../apps/server/.env'),
});

export default defineConfig({
  schema: path.join('prisma', 'schema'),
  migrations: {
    path: path.join('prisma', 'migrations'),
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
