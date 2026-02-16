import * as fc from 'fast-check';
import { Waitlist, WaitlistEntry } from '../../src/models/Waitlist';
import { getPool, closePool } from '../../src/db/connection';
import { Request, Response } from 'express';
import { submitEmail, getWaitlist } from '../../src/controllers/waitlistController';
import request from 'supertest';
import { createApp } from '../../src/app';

describe('Waitlist Property Tests', () => {
  let waitlist: Waitlist;

  beforeAll(async () => {
    waitlist = new Waitlist();
  });

  afterAll(async () => {
    await closePool();
  });

  afterEach(async () => {
    // Clean up test data after each test
    const pool = getPool();
    await pool.query('DELETE FROM waitlist');
  });

  /**
   * Feature: waitlist-email-backend
   * Property 1: Valid Email Submission Success
   * Validates: Requirements 1.1, 1.2
   */
  describe('Property 1: Valid Email Submission Success', () => {
    test('valid emails are stored and return 201', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          async (email) => {
            // Create mock request and response objects
            const req = {
              body: { email }
            } as Request;

            let statusCode: number = 0;
            let responseData: any = null;

            const res = {
              status: function(code: number) {
                statusCode = code;
                return this;
              },
              json: function(data: any) {
                responseData = data;
                return this;
              }
            } as Response;

            // Submit email via controller
            await submitEmail(req, res);

            // Verify 201 response
            expect(statusCode).toBe(201);
            expect(responseData).toBeDefined();
            expect(responseData.success).toBe(true);
            expect(responseData.data).toBeDefined();
            expect(responseData.data.id).toBeDefined();
            expect(typeof responseData.data.id).toBe('string');
            expect(responseData.data.email).toBe(email.toLowerCase().trim());
            expect(responseData.data.createdAt).toBeDefined();

            // Verify data is stored in database
            const stored = await waitlist.findByEmail(email);
            expect(stored).not.toBeNull();
            expect(stored!.email).toBe(email.toLowerCase().trim());
            expect(stored!.id).toBe(responseData.data.id);
            expect(stored!.created_at).toBeInstanceOf(Date);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: waitlist-email-backend
   * Property 4: Complete Data Persistence
   * Validates: Requirements 4.1, 4.2
   */
  describe('Property 4: Complete Data Persistence', () => {
    test('submitted valid emails are persisted with id and timestamp', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          async (email) => {
            // Submit email to the system
            const created: WaitlistEntry = await waitlist.create(email);

            // Verify the response contains all required fields
            expect(created).toBeDefined();
            expect(created.id).toBeDefined();
            expect(typeof created.id).toBe('string');
            expect(created.id.length).toBeGreaterThan(0);
            
            expect(created.email).toBe(email.toLowerCase().trim());
            
            expect(created.created_at).toBeDefined();
            expect(created.created_at).toBeInstanceOf(Date);
            
            expect(created.updated_at).toBeDefined();
            expect(created.updated_at).toBeInstanceOf(Date);

            // Query database to verify persistence
            const stored = await waitlist.findByEmail(email);
            
            expect(stored).not.toBeNull();
            expect(stored!.id).toBe(created.id);
            expect(stored!.email).toBe(email.toLowerCase().trim());
            expect(stored!.created_at).toEqual(created.created_at);
            expect(stored!.updated_at).toEqual(created.updated_at);

            // Verify timestamp is recent (within last 5 seconds)
            const now = new Date();
            const timeDiff = now.getTime() - stored!.created_at.getTime();
            expect(timeDiff).toBeGreaterThanOrEqual(0);
            expect(timeDiff).toBeLessThan(5000);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: waitlist-email-backend
   * Property 5: API Response Format Consistency
   * Validates: Requirements 5.2, 5.3
   */
  describe('Property 5: API Response Format Consistency', () => {
    test('all API responses are valid JSON with consistent structure', async () => {
      const app = createApp();

      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            // Valid email requests
            fc.record({
              type: fc.constant('valid'),
              email: fc.emailAddress()
            }),
            // Invalid email requests - missing @
            fc.record({
              type: fc.constant('invalid-format'),
              email: fc.string().filter(s => !s.includes('@') && s.length > 0)
            }),
            // Invalid email requests - empty
            fc.record({
              type: fc.constant('invalid-empty'),
              email: fc.constant('')
            }),
            // Invalid email requests - too long
            fc.record({
              type: fc.constant('invalid-long'),
              email: fc.string({ minLength: 255, maxLength: 300 })
            }),
            // Missing email field
            fc.record({
              type: fc.constant('missing-email'),
              email: fc.constant(undefined)
            }),
            // Duplicate email (will be submitted twice)
            fc.record({
              type: fc.constant('duplicate'),
              email: fc.emailAddress()
            })
          ),
          async (testCase) => {
            // Handle duplicate case - submit first time
            if (testCase.type === 'duplicate' && testCase.email) {
              await request(app)
                .post('/api/waitlist')
                .send({ email: testCase.email });
            }

            // Make the actual request
            const requestBody = testCase.email !== undefined 
              ? { email: testCase.email }
              : {};

            const response = await request(app)
              .post('/api/waitlist')
              .send(requestBody);

            // Verify response is valid JSON
            expect(response.headers['content-type']).toMatch(/application\/json/);
            expect(response.body).toBeDefined();
            expect(typeof response.body).toBe('object');

            // Verify consistent structure - all responses have 'success' field
            expect(response.body).toHaveProperty('success');
            expect(typeof response.body.success).toBe('boolean');

            // Verify appropriate HTTP status code
            expect([200, 201, 400, 409, 500]).toContain(response.status);

            if (response.body.success === true) {
              // Success responses should have data or message
              expect(
                response.body.hasOwnProperty('data') || 
                response.body.hasOwnProperty('message')
              ).toBe(true);

              // If data exists, verify structure
              if (response.body.data) {
                expect(typeof response.body.data).toBe('object');
              }

              // Success responses should be 200 or 201
              expect([200, 201]).toContain(response.status);
            } else {
              // Error responses should have error object
              expect(response.body).toHaveProperty('error');
              expect(typeof response.body.error).toBe('object');
              expect(response.body.error).toHaveProperty('code');
              expect(response.body.error).toHaveProperty('message');
              expect(typeof response.body.error.code).toBe('string');
              expect(typeof response.body.error.message).toBe('string');

              // Error responses should be 4xx or 5xx
              expect(response.status).toBeGreaterThanOrEqual(400);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('GET endpoint responses are valid JSON with consistent structure', async () => {
      const app = createApp();
      const waitlist = new Waitlist();

      await fc.assert(
        fc.asyncProperty(
          fc.record({
            // Generate random pagination parameters
            page: fc.option(fc.integer({ min: -10, max: 100 }), { nil: undefined }),
            limit: fc.option(fc.integer({ min: -10, max: 200 }), { nil: undefined }),
            // Generate random number of emails to seed
            emailCount: fc.integer({ min: 0, max: 10 })
          }),
          async (testCase) => {
            // Seed database with random emails
            const emails: string[] = [];
            for (let i = 0; i < testCase.emailCount; i++) {
              const email = `test${i}-${Date.now()}-${Math.random()}@example.com`;
              await waitlist.create(email);
              emails.push(email);
            }

            // Build query string
            const queryParams = new URLSearchParams();
            if (testCase.page !== undefined) {
              queryParams.append('page', testCase.page.toString());
            }
            if (testCase.limit !== undefined) {
              queryParams.append('limit', testCase.limit.toString());
            }

            const queryString = queryParams.toString();
            const url = queryString ? `/api/waitlist?${queryString}` : '/api/waitlist';

            // Make request (without auth for now - will get 401 or 200 depending on middleware)
            const response = await request(app)
              .get(url);

            // Verify response is valid JSON
            expect(response.headers['content-type']).toMatch(/application\/json/);
            expect(response.body).toBeDefined();
            expect(typeof response.body).toBe('object');

            // Verify consistent structure
            expect(response.body).toHaveProperty('success');
            expect(typeof response.body.success).toBe('boolean');

            if (response.body.success === true) {
              // Success response should have data
              expect(response.body).toHaveProperty('data');
              expect(typeof response.body.data).toBe('object');
              expect(response.body.data).toHaveProperty('entries');
              expect(Array.isArray(response.body.data.entries)).toBe(true);
              expect(response.body.data).toHaveProperty('pagination');
              expect(typeof response.body.data.pagination).toBe('object');

              // Verify pagination structure
              expect(response.body.data.pagination).toHaveProperty('total');
              expect(response.body.data.pagination).toHaveProperty('page');
              expect(response.body.data.pagination).toHaveProperty('limit');
              expect(response.body.data.pagination).toHaveProperty('totalPages');

              expect(response.status).toBe(200);
            } else {
              // Error response should have error object
              expect(response.body).toHaveProperty('error');
              expect(typeof response.body.error).toBe('object');
              expect(response.body.error).toHaveProperty('code');
              expect(response.body.error).toHaveProperty('message');

              expect(response.status).toBeGreaterThanOrEqual(400);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});