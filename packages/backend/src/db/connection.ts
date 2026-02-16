import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const connectionString = process.env.DATABASE_URL;
console.log(connectionString);

if (!connectionString || connectionString === '') {
  throw new Error('Connection string not found');
}

const useSSL = connectionString.includes('render.com')
// Database connection pool configuration
const poolConfig: PoolConfig = {
  connectionString,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
  ssl: useSSL ? { rejectUnauthorized: false } : undefined
};

// Create connection pool
const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Check database connection health
 * @returns Promise<boolean> - true if connection is healthy, false otherwise
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

/**
 * Get the database connection pool
 * @returns Pool - PostgreSQL connection pool
 */
export function getPool(): Pool {
  return pool;
}

/**
 * Close all database connections
 * Used for graceful shutdown
 */
export async function closePool(): Promise<void> {
  try {
    await pool.end();
    console.log('Database pool closed successfully');
  } catch (error) {
    console.error('Error closing database pool:', error);
    throw error;
  }
}

export default pool;
