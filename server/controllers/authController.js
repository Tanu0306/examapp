import argon2 from 'argon2';
import pool from '../conn.js';

/**
 * Teacher Registration Controller
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required.',
      });
    }

    const trimmedName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid institutional email address.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check if email already registered
    const existingUser = await pool.query(
      'SELECT id FROM teachers WHERE LOWER(email) = $1',
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Hash password with Argon2
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
    });

    // Insert into PostgreSQL
    const insertResult = await pool.query(
      `INSERT INTO teachers (full_name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, full_name, email,created_at`,
      [trimmedName, normalizedEmail, passwordHash]
    );

    const newTeacher = insertResult.rows[0];

    // Initialize session stored in PostgreSQL
    req.session.teacher = {
      id: newTeacher.id,
      fullName: newTeacher.full_name,
      email: newTeacher.email,
      role: newTeacher.role,
    };

    return res.status(201).json({
      success: true,
      message: 'Teacher registered successfully.',
      user: req.session.teacher,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Teacher Login Controller
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Query teacher by email
    const result = await pool.query(
      'SELECT id, full_name, email, password_hash, role FROM teachers WHERE LOWER(email) = $1',
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }
    const teacher = result.rows[0];
    // Verify password with Argon2
    const isPasswordValid = await argon2.verify(teacher.password_hash, password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Set authenticated session in PostgreSQL
    req.session.teacher = {
      id: teacher.id,
      fullName: teacher.full_name,
      email: teacher.email
    };

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully.',
      user: req.session.teacher,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current Authenticated Teacher Profile
 * GET /api/auth/me
 */
export const getProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.session.teacher,
  });
};

/**
 * Teacher Logout Controller
 * POST /api/auth/logout
 */
export const logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }

    res.clearCookie('connect.sid');
    return res.status(200).json({
      success: true,
      message: 'Signed out successfully.',
    });
  });
};
