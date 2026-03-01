import request from 'supertest';
import { createApp } from '../../src/app';
import pool from '../../src/db/connection';
import { Application } from 'express';
import mailer from '../../src/mailer/mailer';

/**
 * Integration Test: Complete Submission Flow
 * Tests POST /api/waitlist with various scenarios
 * 
 * Validates:
 * - Requirements 1.1, 1.2: Valid email submission returns 201
 * - Requirements 2.2: Invalid email returns 400
 * - Requirements 3.2: Duplicate email returns 409
 */

describe('Integration: Waitlist Submission Flow', () => {
  let app: Application;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    // stub out actual email sending so tests don't rely on SMTP
    jest.spyOn(mailer, 'sendMail').mockResolvedValue({ messageId: 'mocked' } as any);
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

  describe('POST /api/waitlist - Valid Email', () => {
    it('should return 201 and store email in database', async () => {
      const email = 'test@example.com';

      const response = await request(app)
        .post('/api/waitlist')
        .send({ email })
        .expect(201);

      // ensure confirmation email attempted
      expect(mailer.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: expect.any(String),
        text: expect.any(String),
      });

      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email', email);
      expect(response.body.data).toHaveProperty('createdAt');

      // Verify email is stored in database
      const result = await pool.query(
        'SELECT * FROM waitlist WHERE LOWER(email) = LOWER($1)',
        [email]
      );

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].email).toBe(email);
      expect(result.rows[0].id).toBeDefined();
      expect(result.rows[0].created_at).toBeInstanceOf(Date);
    });

    it('should handle multiple different valid emails', async () => {
      const emails = [
        'user1@example.com',
        'user2@test.org',
        'admin@company.co.uk'
      ];

      for (const email of emails) {
        await request(app)
          .post('/api/waitlist')
          .send({ email })
          .expect(201);
      }

      // Verify all emails are in database
      const result = await pool.query('SELECT * FROM waitlist ORDER BY created_at');
      expect(result.rows).toHaveLength(3);
      expect(result.rows.map((r: any) => r.email)).toEqual(emails);
    });
  });

  describe('POST /api/waitlist - Invalid Email', () => {
    it('should return 400 for email without @ symbol', async () => {
      const response = await request(app)
        .post('/api/waitlist')
        .send({ email: 'notanemail' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error.message).toMatch(/invalid/i);

      // Verify email is NOT in database
      const result = await pool.query('SELECT * FROM waitlist');
      expect(result.rows).toHaveLength(0);
    });

    it('should return 400 for email without domain', async () => {
      const response = await request(app)
        .post('/api/waitlist')
        .send({ email: 'user@' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/invalid/i);
    });

    it('should return 400 for empty email', async () => {
      const response = await request(app)
        .post('/api/waitlist')
        .send({ email: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing email field', async () => {
      const response = await request(app)
        .post('/api/waitlist')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/required|missing/i);
    });

    it('should return 400 for email exceeding 254 characters', async () => {
      const longEmail = 'a'.repeat(250) + '@example.com'; // > 254 chars

      const response = await request(app)
        .post('/api/waitlist')
        .send({ email: longEmail })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/waitlist - Duplicate Email', () => {
    it('should return 409 when submitting duplicate email', async () => {
      const email = 'duplicate@example.com';

      // First submission should succeed
      await request(app)
        .post('/api/waitlist')
        .send({ email })
        .expect(201);

      // Second submission should fail with 409
      const response = await request(app)
        .post('/api/waitlist')
        .send({ email })
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toMatch(/duplicate|already exists/i);

      // Verify only one entry in database
      const result = await pool.query('SELECT * FROM waitlist WHERE LOWER(email) = LOWER($1)', [email]);
      expect(result.rows).toHaveLength(1);
    });

    it('should detect duplicates case-insensitively', async () => {
      const email = 'CaseSensitive@Example.COM';

      // First submission
      await request(app)
        .post('/api/waitlist')
        .send({ email })
        .expect(201);

      // Try with different casing
      const response = await request(app)
        .post('/api/waitlist')
        .send({ email: email.toLowerCase() })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/duplicate|already exists/i);

      // Verify only one entry in database
      const result = await pool.query('SELECT * FROM waitlist');
      expect(result.rows).toHaveLength(1);
    });

    it('should detect duplicates with mixed casing variations', async () => {
      const baseEmail = 'test@example.com';
      const variations = [
        'TEST@EXAMPLE.COM',
        'Test@Example.Com',
        'tEsT@eXaMpLe.CoM'
      ];

      // First submission
      await request(app)
        .post('/api/waitlist')
        .send({ email: baseEmail })
        .expect(201);

      // All variations should be rejected
      for (const variation of variations) {
        await request(app)
          .post('/api/waitlist')
          .send({ email: variation })
          .expect(409);
      }

      // Verify only one entry in database
      const result = await pool.query('SELECT * FROM waitlist');
      expect(result.rows).toHaveLength(1);
    });
  });
});
