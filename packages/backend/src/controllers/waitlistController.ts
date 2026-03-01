import { Request, Response } from 'express';
import { Waitlist, WaitlistEntry } from '../models/Waitlist';
import { isValidEmail } from '../utils/emailValidator';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
import mailer from '../mailer/mailer';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
/**
 * Submit email controller function
 * Handles POST /api/waitlist requests
 */
export async function submitEmail(req: Request, res: Response): Promise<void> {
  try {
    // Extract email from request body
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_EMAIL',
          message: 'Email field is required'
        }
      });
      return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Email format is invalid'
        }
      });
      return;
    }

    // Check if email exceeds maximum length
    if (email.length > 254) {
      res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_TOO_LONG',
          message: 'Email exceeds 254 characters'
        }
      });
      return;
    }

    const waitlist = new Waitlist();

    const existingEntry = await waitlist.findByEmail(email);
    if (existingEntry) {
      res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_EMAIL',
          message: 'Email already exists in waitlist'
        }
      });
      return;
    }

    const entry: WaitlistEntry = await waitlist.create(email);

    // Respond first, then attempt to send a confirmation email asynchronously.
    res.status(201).json({
      success: true,
      message: 'Email successfully added to waitlist',
      data: {
        id: entry.id,
        email: entry.email,
        createdAt: entry.created_at.toISOString()
      }
    });

    // fire-and-forget email; log any failure but don't affect response
    mailer
      .sendMail({
        to: entry.email,
        subject: 'Thanks for joining the Offmark waitlist!',
        text: 'We have received your registration and will be in touch soon.',
      })
      .catch((err) => console.error('Failed to send confirmation email:', err));
  } catch (error: any) {
    if (error.message === 'Email already exists in waitlist') {
      res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_EMAIL',
          message: 'Email already exists in waitlist'
        }
      });
      return;
    }

    console.error('Error submitting email:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to process email submission'
      }
    });
  }
}

export async function login (req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined> {
  if (!connectionString) {
    throw new Error("Connection string not found");
  }

  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required'
        }
      });
    }

    const useSSL = connectionString.includes('render.com')

    // Get database connection
    const pool = new Pool({
      connectionString,
      ssl: useSSL ? { rejectUnauthorized: false } : undefined
    });

    // Find user by email
    const userResult = await pool.query(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password'
        }
      });
    }

    const user = userResult.rows[0];

    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password'
        }
      });
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin privileges required'
        }
      });
    }

    // Get JWT secret
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'JWT configuration error'
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        expiresIn: '24h',
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      }
    });

    // Close database connection
    await pool.end();

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Login failed'
      }
    });
  }
}

/**
 * Get waitlist controller function
 * Handles GET /api/waitlist requests with pagination
 */
export async function getWaitlist(req: Request, res: Response): Promise<void> {
  try {
    const pageParam = req.query.page;
    const limitParam = req.query.limit;

    let page = 1;
    let limit = 50;

    if (pageParam) {
      const parsedPage = parseInt(pageParam as string, 10);
      if (!isNaN(parsedPage) && parsedPage > 0) {
        page = parsedPage;
      }
    }

    if (limitParam) {
      const parsedLimit = parseInt(limitParam as string, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        // Enforce maximum limit of 100
        limit = Math.min(parsedLimit, 100);
      }
    }
    const offset = (page - 1) * limit;

    const waitlist = new Waitlist();

    const entries = await waitlist.findAll(offset, limit);
    const total = await waitlist.count();
    const totalPages = Math.ceil(total / limit);

    // Return paginated response
    res.status(200).json({
      success: true,
      data: {
        entries: entries.map(entry => ({
          id: entry.id,
          email: entry.email,
          createdAt: entry.created_at.toISOString(),
          updatedAt: entry.updated_at.toISOString()
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      }
    });
  } catch (error: any) {
    // Handle database errors
    console.error('Error retrieving waitlist:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to retrieve waitlist entries'
      }
    });
  }
}
