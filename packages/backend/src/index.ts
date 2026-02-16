import { createApp } from './app';
import { checkConnection } from './db/connection';

/**
 * Start the Express server
 */
async function startServer() {
  try {
    // Test database connection
    console.log('Testing database connection...');
    const isConnected = await checkConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    console.log('Database connection successful');

    // Create Express app
    const app = createApp();

    // Get port from environment or use default
    const PORT = process.env.PORT || 3000;

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API endpoint: http://localhost:${PORT}/api/waitlist`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

export { startServer };
