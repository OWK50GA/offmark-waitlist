import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// ensure mailer-related vars exist with harmless defaults for tests
process.env.SMTP_HOST = process.env.SMTP_HOST || 'localhost';
process.env.SMTP_PORT = process.env.SMTP_PORT || '1025';
process.env.SMTP_SECURE = process.env.SMTP_SECURE || 'false';
process.env.SMTP_USER = process.env.SMTP_USER || 'test';
process.env.SMTP_PASS = process.env.SMTP_PASS || 'test';
process.env.SMTP_FROM = process.env.SMTP_FROM || 'test@example.com';
