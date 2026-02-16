import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware
 * Catches all errors from routes and controllers
 * Maps error types to HTTP status codes
 * Formats consistent error responses
 * Logs errors without exposing sensitive information
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const logLevel = process.env.LOG_LEVEL || 'info';
  if (logLevel === 'debug' || logLevel === 'error') {
    console.error('Error occurred:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  } else {
    console.error('Error occurred:', {
      message: err.message,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message
      }
    });
    return;
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message
      }
    });
    return;
  }

  if (err.name === 'UnauthorizedError' || err.message.includes('token')) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required or failed'
      }
    });
    return;
  }

  // Handle database errors
  if (err.message.includes('database') || err.message.includes('query')) {
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Database operation failed'
      }
    });
    return;
  }

  // Default to 500 Internal Server Error for unexpected errors
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
}
