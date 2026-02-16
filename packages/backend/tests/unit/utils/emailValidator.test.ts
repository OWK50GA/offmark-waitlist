import { isValidEmail, normalizeEmail } from '../../../src/utils/emailValidator';

/**
 * Unit tests for email validator edge cases
 * Requirements: 2.2, 2.3, 2.4
 */
describe('Email Validator Edge Cases', () => {
  describe('isValidEmail', () => {
    test('rejects empty string', () => {
      expect(isValidEmail('')).toBe(false);
    });

    test('rejects string missing @ symbol', () => {
      expect(isValidEmail('invalidemail.com')).toBe(false);
      expect(isValidEmail('user.example.com')).toBe(false);
      expect(isValidEmail('nodomain')).toBe(false);
    });

    test('rejects string missing domain', () => {
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('admin@')).toBe(false);
    });

    test('handles special characters correctly', () => {
      // Valid special characters in local part
      expect(isValidEmail('user+tag@example.com')).toBe(true);
      expect(isValidEmail('user.name@example.com')).toBe(true);
      expect(isValidEmail('user_name@example.com')).toBe(true);
      
      // Invalid special characters
      expect(isValidEmail('user name@example.com')).toBe(false);
      expect(isValidEmail('user@domain@example.com')).toBe(false);
    });
  });

  describe('normalizeEmail', () => {
    test('handles empty string', () => {
      expect(normalizeEmail('')).toBe('');
    });

    test('handles null and undefined', () => {
      expect(normalizeEmail(null as any)).toBe('');
      expect(normalizeEmail(undefined as any)).toBe('');
    });

    test('trims whitespace', () => {
      expect(normalizeEmail('  user@example.com  ')).toBe('user@example.com');
      expect(normalizeEmail('\tuser@example.com\n')).toBe('user@example.com');
    });

    test('converts to lowercase', () => {
      expect(normalizeEmail('USER@EXAMPLE.COM')).toBe('user@example.com');
      expect(normalizeEmail('User@Example.Com')).toBe('user@example.com');
    });
  });
});
