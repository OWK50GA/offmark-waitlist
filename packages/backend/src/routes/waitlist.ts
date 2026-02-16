import { Router } from 'express';
import { submitEmail, getWaitlist } from '../controllers/waitlistController';
import { authenticateToken } from '../middleware/auth';
import { getCorsMiddleware } from '../middleware/cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

/**
 * Waitlist routes
 * Defines POST /api/waitlist and GET /api/waitlist endpoints
 */
const router = Router();

router.use(getCorsMiddleware());

/**
 * POST /api/waitlist/login
 * Admin login with bcrypt authentication
 * Production-ready authentication system
 */
router.post('/login', async (req, res) => {
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

    // Get database connection
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
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
});

/**
 * POST /api/waitlist
 * Submit email to waitlist
 * Public endpoint - no authentication required
 */
router.post('/', submitEmail);

/**
 * GET /api/waitlist
 * Retrieve waitlist entries with pagination
 * Protected endpoint - requires authentication
 */
router.get('/', authenticateToken, getWaitlist);

export default router;