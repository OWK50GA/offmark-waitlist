import * as fc from 'fast-check';
import { isValidEmail, normalizeEmail } from '../../src/utils/emailValidator';

/**
 * Feature: waitlist-email-backend
 * Property 2: Email Format Validation
 * Validates: Requirements 2.1, 2.2, 2.3
 */
describe('Property 2: Email Format Validation', () => {
  test('valid RFC 5322 emails are accepted', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        async (email) => {
          // Valid emails should be accepted
          expect(isValidEmail(email)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('emails exceeding 254 characters are rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 255, maxLength: 300 }),
        async (longString) => {
          // Create an email-like string that exceeds 254 characters
          const longEmail = longString + '@example.com';
          expect(isValidEmail(longEmail)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('strings without @ symbol are rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string().filter(s => !s.includes('@') && s.length > 0),
        async (invalidEmail) => {
          expect(isValidEmail(invalidEmail)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('strings with @ but missing local part are rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.domain(),
        async (domain) => {
          const invalidEmail = '@' + domain;
          expect(isValidEmail(invalidEmail)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('strings with @ but missing domain are rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 64 }).filter(s => !s.includes('@')),
        async (localPart) => {
          const invalidEmail = localPart + '@';
          expect(isValidEmail(invalidEmail)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('empty strings and non-strings are rejected', async () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail(null as any)).toBe(false);
    expect(isValidEmail(undefined as any)).toBe(false);
  });

  test('normalizeEmail produces lowercase trimmed output', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.constantFrom('', ' ', '  ', '\t', '\n'),
        fc.constantFrom('', ' ', '  ', '\t', '\n'),
        async (email, prefix, suffix) => {
          const paddedEmail = prefix + email + suffix;
          const normalized = normalizeEmail(paddedEmail);
          
          // Normalized email should be lowercase and trimmed
          expect(normalized).toBe(email.toLowerCase());
          expect(normalized).toBe(normalized.trim());
        }
      ),
      { numRuns: 100 }
    );
  });
});
