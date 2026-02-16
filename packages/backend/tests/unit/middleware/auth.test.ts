import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, AuthRequest } from '../../../src/middleware/auth';

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

describe('Authentication Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Setup mock request
    mockRequest = {
      headers: {},
    };

    // Setup mock response
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    // Setup mock next function
    mockNext = jest.fn();

    // Clear all mocks
    jest.clearAllMocks();

    // Set JWT_SECRET for tests
    process.env.JWT_SECRET = 'test-secret-key';
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  describe('Valid token', () => {
    it('should allow access with valid token', () => {
      // Setup valid token
      const token = 'valid.jwt.token';
      const decodedPayload = {
        id: 'user-123',
        email: 'test@example.com',
      };

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      // Mock jwt.verify to return decoded payload
      (jwt.verify as jest.Mock).mockReturnValue(decodedPayload);

      // Call middleware
      authenticateToken(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      // Verify jwt.verify was called with correct parameters
      expect(jwt.verify).toHaveBeenCalledWith(token, 'test-secret-key');

      // Verify user info was attached to request
      expect(mockRequest.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
      });

      // Verify next() was called
      expect(mockNext).toHaveBeenCalledTimes(1);

      // Verify no error response was sent
      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).not.toHaveBeenCalled();
    });

    it('should handle token with sub field instead of id', () => {
      const token = 'valid.jwt.token';
      const decodedPayload = {
        sub: 'user-456',
        email: 'user@example.com',
      };

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      (jwt.verify as jest.Mock).mockReturnValue(decodedPayload);

      authenticateToken(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toEqual({
        id: 'user-456',
        email: 'user@example.com',
        sub: 'user-456',
      });

      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('Invalid token', () => {
    it('should return 401 for invalid token', () => {
      const token = 'invalid.jwt.token';

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      // Mock jwt.verify to throw JsonWebTokenError
      const error = new Error('invalid signature');
      error.name = 'JsonWebTokenError';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw error;
      });

      authenticateToken(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid authentication token',
        },
      });

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for expired token', () => {
      const token = 'expired.jwt.token';

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      // Mock jwt.verify to throw TokenExpiredError
      const error = new Error('jwt expired');
      error.name = 'TokenExpiredError';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw error;
      });

      authenticateToken(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token has expired',
        },
      });

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for other verification errors', () => {
      const token = 'malformed.token';

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      // Mock jwt.verify to throw generic error
      const error = new Error('Something went wrong');
      error.name = 'SomeOtherError';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw error;
      });

      authenticateToken(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication failed',
        },
      });

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Missing token', () => {
    it('should return 401 when Authorization header is missing', () => {
      // No authorization header
      mockRequest.headers = {};

      authenticateToken(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token is required',
        },
      });

      expect(mockNext).not.toHaveBeenCalled();
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it('should return 401 when Authorization header does not start with Bearer', () => {
      mockRequest.headers = {
        authorization: 'Basic some-credentials',
      };

      authenticateToken(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token is required',
        },
      });

      expect(mockNext).not.toHaveBeenCalled();
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it('should return 401 when Bearer token is empty', () => {
      mockRequest.headers = {
        authorization: 'Bearer ',
      };

      authenticateToken(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token is required',
        },
      });

      expect(mockNext).not.toHaveBeenCalled();
      expect(jwt.verify).not.toHaveBeenCalled();
    });
  });

  describe('Configuration errors', () => {
    it('should return 500 when JWT_SECRET is not configured', () => {
      delete process.env.JWT_SECRET;

      const token = 'some.jwt.token';
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      authenticateToken(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith('JWT_SECRET is not configured');
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Authentication configuration error',
        },
      });

      expect(mockNext).not.toHaveBeenCalled();
      expect(jwt.verify).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
