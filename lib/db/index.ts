import { drizzle } from 'drizzle-orm/better-sqlite3'
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import Database from 'better-sqlite3'
import * as schema from './schema'

// Database connection
const connectionString = process.env.DATABASE_URL || 'file:./dev.db'

let db: any

// Check if using SQLite or PostgreSQL
if (connectionString.startsWith('file:')) {
  // SQLite connection
  const sqlite = new Database(connectionString.replace('file:', ''))
  db = drizzle(sqlite, { schema })
  
  // Close connection on app shutdown
  process.on('SIGINT', () => {
    sqlite.close()
    process.exit(0)
  })
  
  process.on('SIGTERM', () => {
    sqlite.close()
    process.exit(0)
  })
} else {
  // PostgreSQL connection
  const client = postgres(connectionString)
  db = drizzlePostgres(client, { schema })
  
  // Close connection on app shutdown
  process.on('SIGINT', () => {
    client.end()
    process.exit(0)
  })
  
  process.on('SIGTERM', () => {
    client.end()
    process.exit(0)
  })
}

// Export drizzle instance
export { db }

// Export schema for migrations
export { schema }
