import cors, { CorsOptions } from 'cors';

/**
 * Configure CORS middleware
 * Sets allowed origins from environment variable
 * Allows GET and POST methods
 * Allows Content-Type and Authorization headers
 */
export function configureCors() {
  // Get allowed origins from environment variable
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || '*';
  
  // Parse allowed origins (comma-separated list)
  const allowedOrigins = allowedOriginsEnv === '*' 
    ? '*' 
    : allowedOriginsEnv.split(',').map(origin => origin.trim());

  // CORS options
  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Allow all origins if wildcard is set
      if (allowedOrigins === '*') {
        callback(null, true);
        return;
      }

      if (Array.isArray(allowedOrigins) && allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
  };

  return cors(corsOptions);
}

/**
 * Get CORS middleware instance
 */
export function getCorsMiddleware() {
  return configureCors();
}
