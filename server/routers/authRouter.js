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
router.post('/logout', logout);

// Protected Profile Endpoints (Session-authenticated)
router.get('/me', isAuthenticated, getProfile);
router.get('/profile', isAuthenticated, getProfile);

export default router;
