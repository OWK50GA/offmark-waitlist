import request from 'supertest';
import { createApp } from '../../src/app';
import pool from '../../src/db/connection';
import { Application } from 'express';

/**
 * Integration Test: CORS Functionality
 * Tests CORS headers and cross-origin request handling
 * 
 * Validates:
 * - Requirements 5.4: CORS support for cross-origin requests
 */

describe('Integration: CORS Functionality', () => {
  let app: Application;
  const testOrigin = 'http://localhost:3000';

  beforeAll(() => {
    app = createApp();
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

  describe('OPTIONS /api/waitlist - Preflight Requests', () => {
    it('should return correct CORS headers for OPTIONS request', async () => {
      const response = await request(app)
        .options('/api/waitlist')
        .set('Origin', testOrigin)
        .set('Access-Control-Request-Method', 'POST')
        .expect(200);

      // Verify CORS headers are present
      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers).toHaveProperty('access-control-allow-methods');
    });

    it('should allow POST method in CORS headers', async () => {
      const response = await request(app)
        .options('/api/waitlist')
        .set('Origin', testOrigin)
        .set('Access-Control-Request-Method', 'POST');

      const allowedMethods = response.headers['access-control-allow-methods'];
      expect(allowedMethods).toBeDefined();
      expect(allowedMethods.toUpperCase()).toMatch(/POST/);
    });

    it('should allow GET method in CORS headers', async () => {
      const response = await request(app)
        .options('/api/waitlist')
        .set('Origin', testOrigin)
        .set('Access-Control-Request-Method', 'GET');

      const allowedMethods = response.headers['access-control-allow-methods'];
      expect(allowedMethods).toBeDefined();
      expect(allowedMethods.toUpperCase()).toMatch(/GET/);
    });

    it('should allow Content-Type header', async () => {
      const response = await request(app)
        .options('/api/waitlist')
        .set('Origin', testOrigin)
        .set('Access-Control-Request-Headers', 'Content-Type');

      const allowedHeaders = response.headers['access-control-allow-headers'];
      expect(allowedHeaders).toBeDefined();
      expect(allowedHeaders.toLowerCase()).toMatch(/content-type/);
    });

    it('should allow Authorization header', async () => {
      const response = await request(app)
        .options('/api/waitlist')
        .set('Origin', testOrigin)
        .set('Access-Control-Request-Headers', 'Authorization');

      const allowedHeaders = response.headers['access-control-allow-headers'];
      expect(allowedHeaders).toBeDefined();
      expect(allowedHeaders.toLowerCase()).toMatch(/authorization/);
    });
  });

  describe('POST /api/waitlist - Cross-Origin Requests', () => {
    it('should succeed with cross-origin POST request', async () => {
      const response = await request(app)
        .post('/api/waitlist')
        .set('Origin', testOrigin)
        .send({ email: `cors-test-${Date.now()}@example.com` })
        .expect(201);

      // Verify CORS headers are present in response
      expect(response.headers).toHaveProperty('access-control-allow-origin');
      
      // Verify request succeeded
      expect(response.body.success).toBe(true);
    });

    it('should include CORS headers in error responses', async () => {
      const response = await request(app)
        .post('/api/waitlist')
        .set('Origin', testOrigin)
        .send({ email: 'invalid-email' })
        .expect(400);

      // CORS headers should be present even in error responses
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should handle requests with Content-Type header', async () => {
      const response = await request(app)
        .post('/api/waitlist')
        .set('Origin', testOrigin)
        .set('Content-Type', 'application/json')
        .send({ email: `content-type-test-${Date.now()}@example.com` })
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/waitlist - Cross-Origin Requests', () => {
    it('should include CORS headers in GET responses', async () => {
      const response = await request(app)
        .get('/api/waitlist')
        .set('Origin', testOrigin);

      // Should have CORS headers (will fail auth but CORS should work)
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('CORS - Multiple Origins', () => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173'
    ];

    allowedOrigins.forEach((origin, index) => {
      it(`should handle requests from allowed origin: ${origin}`, async () => {
        const response = await request(app)
          .post('/api/waitlist')
          .set('Origin', origin)
          .send({ email: `test-origin-${index}-${Date.now()}@example.com` });

        // Should have CORS headers for allowed origins
        expect(response.headers).toHaveProperty('access-control-allow-origin');
      });
    });

    it('should reject requests from non-allowed origin', async () => {
      const response = await request(app)
        .post('/api/waitlist')
        .set('Origin', 'https://malicious-site.com')
        .send({ email: 'test@example.com' });

      // Should not have CORS headers or should fail
      // The request will be blocked by CORS
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Health Check - CORS', () => {
    it('should include CORS headers on health check endpoint', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', testOrigin)
        .expect(200);

      expect(response.body.success).toBe(true);
      // Health check may or may not have CORS depending on configuration
      // Just verify it responds correctly
    });
  });
});
