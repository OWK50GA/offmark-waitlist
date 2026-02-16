import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import waitlistRoutes from './routes/waitlist';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

/**
 * Create and configure Express application
 */
export function createApp(): Application {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Service is healthy',
      timestamp: new Date().toISOString()
    });
  });

  app.use('/api/waitlist', waitlistRoutes);

  app.use(errorHandler);

  return app;
}

export default createApp;
