import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_xGYZLOS2Cy4I@ep-curly-wind-axv12d42.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require',
  },
});
