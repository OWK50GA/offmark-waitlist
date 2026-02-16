import validator from 'validator';

/**
 * Validates if an email address conforms to RFC 5322 standards
 * @param email - The email address to validate
 * @returns true if the email is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  // Check if email is a non-empty string
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Check length constraint (RFC 5321 maximum)
  if (email.length > 254) {
    return false;
  }

  // Use validator.js to check RFC 5322 compliance
  if (!validator.isEmail(email)) {
    return false;
  }

  // Verify presence of both local part and domain
  const atIndex = email.indexOf('@');
  if (atIndex === -1) {
    return false;
  }

  const localPart = email.substring(0, atIndex);
  const domain = email.substring(atIndex + 1);

  // Ensure both local part and domain are present
  if (!localPart || !domain) {
    return false;
  }

  return true;
}

/**
 * Normalizes an email address for consistent storage and comparison
 * @param email - The email address to normalize
 * @returns The normalized email address (lowercase and trimmed)
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  return email.trim().toLowerCase();
}
