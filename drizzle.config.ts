import type { Config } from 'drizzle-kit'

// Keep config loading independent of CLI runtime module resolution.
export default {
  dialect: 'postgresql',
  schema: './db/schema.ts',
  out: 'netlify/database/migrations',
} satisfies Config
