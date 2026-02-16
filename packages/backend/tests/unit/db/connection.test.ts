import { Pool } from 'pg';
import { checkConnection, getPool, closePool } from '../../../src/db/connection';

// Mock the pg module
jest.mock('pg', () => {
  const mPool = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

describe('Database Connection', () => {
  let mockPool: any;

  beforeEach(() => {
    // Get the mocked pool instance
    mockPool = new Pool();
    jest.clearAllMocks();
  });

  describe('checkConnection', () => {
    it('should return true when connection is successful', async () => {
      // Mock successful connection
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] }),
        release: jest.fn(),
      };
      mockPool.connect.mockResolvedValue(mockClient);

      const result = await checkConnection();

      expect(result).toBe(true);
      expect(mockPool.connect).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledWith('SELECT 1');
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });

    it('should return false when connection fails', async () => {
      // Mock connection failure
      const connectionError = new Error('Connection refused');
      mockPool.connect.mockRejectedValue(connectionError);

      // Spy on console.error to suppress error output in tests
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await checkConnection();

      expect(result).toBe(false);
      expect(mockPool.connect).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Database connection check failed:',
        connectionError
      );

      consoleErrorSpy.mockRestore();
    });

    it('should return false when query fails', async () => {
      // Mock successful connection but failed query
      const queryError = new Error('Query execution failed');
      const mockClient = {
        query: jest.fn().mockRejectedValue(queryError),
        release: jest.fn(),
      };
      mockPool.connect.mockResolvedValue(mockClient);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await checkConnection();

      expect(result).toBe(false);
      expect(mockPool.connect).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledWith('SELECT 1');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Database connection check failed:',
        queryError
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getPool', () => {
    it('should return the pool instance', () => {
      const pool = getPool();
      expect(pool).toBeDefined();
      expect(pool).toHaveProperty('connect');
      expect(pool).toHaveProperty('query');
      expect(pool).toHaveProperty('end');
    });
  });

  describe('closePool', () => {
    it('should close the pool successfully', async () => {
      mockPool.end.mockResolvedValue(undefined);
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await closePool();

      expect(mockPool.end).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith('Database pool closed successfully');

      consoleLogSpy.mockRestore();
    });

    it('should throw error when pool closure fails', async () => {
      const closeError = new Error('Failed to close pool');
      mockPool.end.mockRejectedValue(closeError);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(closePool()).rejects.toThrow('Failed to close pool');
      expect(mockPool.end).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error closing database pool:', closeError);

      consoleErrorSpy.mockRestore();
    });
  });
});
