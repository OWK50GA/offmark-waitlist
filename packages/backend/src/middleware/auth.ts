import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Extended Request interface to include user information
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    [key: string]: any;
  };
}

/**
 * Authentication middleware
 * Extracts Bearer token from Authorization header
 * Verifies JWT token signature and expiration
 * Attaches user info to request object
 * Returns 401 for invalid/missing tokens
 */
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  // Extract Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token is required'
      }
    });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET is not configured');
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authentication configuration error'
      }
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Attach user info to request
    req.user = {
      id: decoded.id || decoded.sub,
      email: decoded.email,
      ...decoded
    };

    // Continue to next middleware/route handler
    next();
  } catch (error: any) {
    // Handle token verification errors
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token has expired'
        }
      });
      return;
    }

    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid authentication token'
        }
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication failed'
      }
    });
  }
}
