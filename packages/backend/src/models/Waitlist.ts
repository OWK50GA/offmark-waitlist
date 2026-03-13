import { Pool, QueryResult } from 'pg';
import { getPool } from '../db/connection';

/**
 * Waitlist entry interface
 */
export interface WaitlistEntry {
  id: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Waitlist model for database operations
 */
export class Waitlist {
  private pool: Pool;

  constructor(pool?: Pool) {
    this.pool = pool || getPool();
  }

  /**
   * Create a new waitlist entry
   * @param email - Email address to add to waitlist
   * @returns Promise<WaitlistEntry> - Created waitlist entry
   * @throws Error if email already exists or database operation fails
   */
  async create(email: string, first_name: string): Promise<WaitlistEntry> {
    const normalizedEmail = email.toLowerCase().trim();
    
    const query = `
      INSERT INTO waitlist (email, first_name)
      VALUES ($1, $2)
      RETURNING id, email, created_at, updated_at
    `;
    
    try {
      const result: QueryResult<WaitlistEntry> = await this.pool.query(query, [normalizedEmail, first_name]);
      return result.rows[0];
    } catch (error: any) {
      // Check for unique constraint violation (duplicate email)
      if (error.code === '23505') {
        throw new Error('Email already exists in waitlist');
      }
      throw error;
    }
  }

  /**
   * Find a waitlist entry by email (case-insensitive)
   * @param email - Email address to search for
   * @returns Promise<WaitlistEntry | null> - Found entry or null
   */
  async findByEmail(email: string): Promise<WaitlistEntry | null> {
    const normalizedEmail = email.toLowerCase().trim();
    
    const query = `
      SELECT id, email, created_at, updated_at
      FROM waitlist
      WHERE LOWER(email) = $1
    `;
    
    const result: QueryResult<WaitlistEntry> = await this.pool.query(query, [normalizedEmail]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Find all waitlist entries with pagination
   * @param offset - Number of entries to skip
   * @param limit - Maximum number of entries to return
   * @returns Promise<Array<WaitlistEntry>> - Array of waitlist entries
   */
  async findAll(offset: number, limit: number): Promise<Array<WaitlistEntry>> {
    const query = `
      SELECT id, email, created_at, updated_at
      FROM waitlist
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result: QueryResult<WaitlistEntry> = await this.pool.query(query, [limit, offset]);
    return result.rows;
  }

  /**
   * Count total number of waitlist entries
   * @returns Promise<number> - Total count of entries
   */
  async count(): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM waitlist
    `;
    
    const result = await this.pool.query(query);
    return parseInt(result.rows[0].count, 10);
  }
}

export default Waitlist;
