import request from 'supertest';
import { createApp } from '../../src/app';
import pool from '../../src/db/connection';
import { Application } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Integration Test: Waitlist Retrieval Flow
 * Tests GET /api/waitlist with authentication and pagination
 * 
 * Validates:
 * - Requirements 8.1: GET endpoint retrieves waitlist entries
 * - Requirements 8.2, 8.3: Pagination support
 * - Requirements 8.4: Authentication required
 */

describe('Integration: Waitlist Retrieval Flow', () => {
  let app: Application;
  let validToken: string;
  const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

  beforeAll(() => {
    app = createApp();
    
    // Generate valid JWT token for testing
    validToken = jwt.sign(
      { userId: 'test-user-123', role: 'admin' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  beforeEach(async () => {
    // Clean up database before each test
    await pool.query('DELETE FROM waitlist');
  });

  afterAll(async () => {
    // Clean up and close database connection
    await pool.query('DELETE FROM waitlist');
    await pool.end();
  });

  describe('GET /api/waitlist - Authentication', () => {
    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .get('/api/waitlist')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toMatch(/token|unauthorized|authentication/i);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/waitlist')
        .set('Authorization', 'Bearer invalid_token_here')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/token|invalid|unauthorized/i);
    });

    it('should return 401 with malformed Authorization header', async () => {
      const response = await request(app)
        .get('/api/waitlist')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/api/waitlist')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /api/waitlist - Retrieval with Pagination', () => {
    beforeEach(async () => {
      // Insert test emails into database
      const testEmails = [
        'user1@example.com',
        'user2@example.com',
        'user3@example.com',
        'user4@example.com',
        'user5@example.com'
      ];

      for (const email of testEmails) {
        await pool.query(
          'INSERT INTO waitlist (email) VALUES ($1)',
          [email]
        );
        // Small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    });

    it('should return paginated results with default parameters', async () => {
      const response = await request(app)
        .get('/api/waitlist')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('entries');
      expect(response.body.data).toHaveProperty('pagination');
      
      const { entries, pagination } = response.body.data;
      
      expect(Array.isArray(entries)).toBe(true);
      expect(entries.length).toBe(5);
      expect(pagination).toHaveProperty('total', 5);
      expect(pagination).toHaveProperty('page', 1);
      expect(pagination).toHaveProperty('limit');
      expect(pagination).toHaveProperty('totalPages');
    });

    it('should return entries with email and timestamp', async () => {
      const response = await request(app)
        .get('/api/waitlist')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      const { entries } = response.body.data;
      
      expect(entries.length).toBeGreaterThan(0);
      
      entries.forEach((entry: any) => {
        expect(entry).toHaveProperty('id');
        expect(entry).toHaveProperty('email');
        expect(entry).toHaveProperty('createdAt');
        expect(typeof entry.email).toBe('string');
        expect(entry.email).toMatch(/@/);
      });
    });

    it('should support custom page and limit parameters', async () => {
      const response = await request(app)
        .get('/api/waitlist?page=1&limit=2')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      const { entries, pagination } = response.body.data;
      
      expect(entries.length).toBe(2);
      expect(pagination.page).toBe(1);
      expect(pagination.limit).toBe(2);
      expect(pagination.total).toBe(5);
      expect(pagination.totalPages).toBe(3);
    });

    it('should return correct entries for page 2', async () => {
      const response = await request(app)
        .get('/api/waitlist?page=2&limit=2')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      const { entries, pagination } = response.body.data;
      
      expect(entries.length).toBe(2);
      expect(pagination.page).toBe(2);
      expect(pagination.limit).toBe(2);
    });

    it('should return remaining entries on last page', async () => {
      const response = await request(app)
        .get('/api/waitlist?page=3&limit=2')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      const { entries, pagination } = response.body.data;
      
      expect(entries.length).toBe(1); // Only 1 entry left (5 total, 2 per page)
      expect(pagination.page).toBe(3);
    });

    it('should return empty array for page beyond available data', async () => {
      const response = await request(app)
        .get('/api/waitlist?page=10&limit=2')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      const { entries } = response.body.data;
      
      expect(entries.length).toBe(0);
    });

    it('should handle limit parameter correctly', async () => {
      const response = await request(app)
        .get('/api/waitlist?limit=3')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      const { entries, pagination } = response.body.data;
      
      expect(entries.length).toBe(3);
      expect(pagination.limit).toBe(3);
    });

    it('should return entries ordered by creation time (newest first)', async () => {
      const response = await request(app)
        .get('/api/waitlist')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      const { entries } = response.body.data;
      
      // Verify entries are in descending order by createdAt
      for (let i = 0; i < entries.length - 1; i++) {
        const current = new Date(entries[i].createdAt);
        const next = new Date(entries[i + 1].createdAt);
        expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
      }
    });
  });

  describe('GET /api/waitlist - Empty Waitlist', () => {
    it('should return empty array when no entries exist', async () => {
      const response = await request(app)
        .get('/api/waitlist')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.entries).toEqual([]);
      expect(response.body.data.pagination.total).toBe(0);
    });
  });

  describe('GET /api/waitlist - Pagination Edge Cases', () => {
    beforeEach(async () => {
      // Insert exactly 10 emails
      for (let i = 1; i <= 10; i++) {
        await pool.query(
          'INSERT INTO waitlist (email) VALUES ($1)',
          [`user${i}@example.com`]
        );
      }
    });

    it('should handle page=1 with limit equal to total entries', async () => {
      const response = await request(app)
        .get('/api/waitlist?page=1&limit=10')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      const { entries, pagination } = response.body.data;
      
      expect(entries.length).toBe(10);
      expect(pagination.totalPages).toBe(1);
    });

    it('should handle invalid page parameter gracefully', async () => {
      const response = await request(app)
        .get('/api/waitlist?page=0')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      // Should default to page 1 or handle gracefully
      expect(response.body.success).toBe(true);
    });

    it('should handle invalid limit parameter gracefully', async () => {
      const response = await request(app)
        .get('/api/waitlist?limit=-1')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      // Should use default limit or handle gracefully
      expect(response.body.success).toBe(true);
    });
  });
});
