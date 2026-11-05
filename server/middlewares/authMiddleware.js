import { ensureTeacherQuestionBank } from '../services/questionBankService.js';

/**
 * Authentication Middleware for Session-based Verification
 * Checks if a valid teacher session exists in PostgreSQL
 */
export const isAuthenticated = async (req, res, next) => {
  if (req.session && req.session.teacher) {
    req.user = req.session.teacher;
    try {
      if (!req.session.teacher.questionBank) {
        req.session.teacher.questionBank = await ensureTeacherQuestionBank(req.user.id);
      }
      req.questionBank = req.session.teacher.questionBank;
      return next();
    } catch (error) {
      return next(error);
    }
  }
  return res.status(401).json({
    success: false,
    message: 'Unauthorized. Please sign in to access this resource.',
  });
};

/**
 * Role Authorization Guard
 * Ensures the authenticated user has the 'teacher' or 'admin' role
 */
