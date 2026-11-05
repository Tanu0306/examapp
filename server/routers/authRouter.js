import { Router } from 'express';
import {
  login,
  register,
  getProfile,
  logout,
} from '../controllers/authController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const router = Router();

// Public Authentication Endpoints
router.post('/login', login);
router.post('/register', register);

// All auth endpoints below this line require a valid teacher session.
router.use(isAuthenticated);

// Protected Authentication Endpoints
router.post('/logout', logout);
router.get('/me', getProfile);
router.get('/profile', getProfile);

export default router;
