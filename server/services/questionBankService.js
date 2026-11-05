import pool from '../conn.js';

/**
 * Return the teacher's single question bank, creating it on first sign-in.
 * The transaction-scoped advisory lock prevents parallel login requests from
 * creating duplicate banks without requiring a unique database constraint.
 */
export const ensureTeacherQuestionBank = async (teacherId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1::bigint)', [teacherId]);

    const existing = await client.query(
      `SELECT id, teacher_id, name, created_at
       FROM question_banks
       WHERE teacher_id = $1
       ORDER BY created_at ASC
       LIMIT 1`,
      [teacherId]
    );
    if (existing.rowCount > 0) {
      await client.query('COMMIT');
      return existing.rows[0];
    }

    const created = await client.query(
      `INSERT INTO question_banks (teacher_id, name)
       VALUES ($1, $2)
       RETURNING id, teacher_id, name, created_at`,
      [teacherId, 'Question Bank']
    );
    await client.query('COMMIT');
    return created.rows[0];
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    throw error;
  } finally {
    client.release();
  }
};
