import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

type Database = ReturnType<typeof createDatabase>

function createDatabase(connectionString: string) {
  return drizzle(neon(connectionString), { schema })
}

let instance: Database | null = null

/**
 * Lazily creates the Neon client so a missing connection string fails on the
 * first query instead of at module load, which keeps cold starts cheap.
 */
export function useDatabase(): Database {
  if (instance) return instance

  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured')
  }

  instance = createDatabase(connectionString)

  return instance
}
