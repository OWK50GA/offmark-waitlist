import { Router } from 'express';
import { submitEmail, getWaitlist, login } from '../controllers/waitlistController';
import { authenticateToken } from '../middleware/auth';
import { getCorsMiddleware } from '../middleware/cors';
import dotenv from 'dotenv';

/**
 * Waitlist routes
 * Defines POST /api/waitlist and GET /api/waitlist endpoints
 */
const router = Router();

router.use(getCorsMiddleware());
dotenv.config();

/**
 * POST /api/waitlist/login
 * Admin login with bcrypt authentication
 * Production-ready authentication system
 */
router.post('/login', login);

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