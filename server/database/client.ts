import { neon } from '@neondatabase/serverless'
import { drizzle as drizzleNeon, type NeonHttpDatabase } from 'drizzle-orm/neon-http'
import { drizzle as drizzlePostgres, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

type Database = NeonHttpDatabase<typeof schema> | PostgresJsDatabase<typeof schema>

let instance: Database | null = null

function isNeonConnection(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith('.neon.tech')
  } catch {
    return false
  }
}

function createDatabase(connectionString: string): Database {
  if (isNeonConnection(connectionString)) {
    return drizzleNeon(neon(connectionString), { schema })
  }

  return drizzlePostgres(postgres(connectionString), { schema })
}

/**
 * Lazily creates the database client so a missing connection string fails on
 * the first query instead of at module load.
 *
 * Neon HTTP is used on Vercel. Local Docker uses a standard Postgres TCP
 * connection against the compose service.
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
