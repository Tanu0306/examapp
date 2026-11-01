import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pool from './conn.js';
import authRouter from './routers/authRouter.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const PgSession = connectPgSimple(session);

// CORS for local lab frontend communication with credentials/cookies
app.use((req, res, next) => {
  const origin = req.headers.origin || 'http://localhost:5173';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Session configuration backed by PostgreSQL
app.use(
  session({
    store: new PgSession({
      pool: pool,
      tableName: 'session',
      createTableIfMissing: true, // Automatically creates the "session" table in PostgreSQL
    }),
    secret: process.env.SESSION_SECRET || 'examlan_master_lab_session_secret_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days session lifetime
      httpOnly: true, // Prevent client-side script access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  })
);

// Server Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    server: 'ExamLAN Master Server Node',
    version: '2.4.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Authentication Router
app.use('/api/auth', authRouter);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`[ExamLAN Server] Master Node running on port ${PORT}`);
  console.log(`[ExamLAN Server] Auth endpoints mounted at http://localhost:${PORT}/api/auth`);
});

export default app;
