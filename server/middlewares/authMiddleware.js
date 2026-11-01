/**
 * Authentication Middleware for Session-based Verification
 * Checks if a valid teacher session exists in PostgreSQL
 */
export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.teacher) {
    req.user = req.session.teacher;
    return next();
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
