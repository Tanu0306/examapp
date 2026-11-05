import pool from '../conn.js';

const validStatuses = new Set(['draft', 'published']);
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isUuid = (value) =>
  typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const isExamId = (value) => typeof value === 'string' && /^[1-9]\d*$/.test(value);

const validateExam = (exam) => {
  if (!isNonEmptyString(exam.title)) return 'Exam title is required.';
  if (!isNonEmptyString(exam.subject)) return 'Exam subject is required.';
  if (!Number.isInteger(Number(exam.duration)) || Number(exam.duration) <= 0) {
    return 'Duration must be a positive number of minutes.';
  }
  if (!validStatuses.has(exam.status)) return 'Status must be draft or published.';
  if (exam.status === 'published' && !exam.schedule) {
    return 'A scheduled date and time are required before publishing.';
  }
  if (!Array.isArray(exam.questions)) return 'Questions must be provided as an array.';
  if (exam.status === 'published' && exam.questions.length === 0) {
    return 'Add at least one question before publishing.';
  }

  for (const [index, question] of exam.questions.entries()) {
    if (!isNonEmptyString(question?.statement)) return `Question ${index + 1} needs question text.`;
    if (!['mcq_single', 'mcq_multi'].includes(question.type)) return `Question ${index + 1} has an unsupported type.`;
    if (!Array.isArray(question.options) || question.options.length < 2) return `Question ${index + 1} needs at least two options.`;
    if (question.options.some((option) => !isNonEmptyString(option?.text))) return `Question ${index + 1} has an empty option.`;
    const correctCount = question.options.filter((option) => option.isCorrect === true).length;
    if (question.type === 'mcq_single' && correctCount !== 1) return `Question ${index + 1} needs exactly one correct answer.`;
    if (question.type === 'mcq_multi' && correctCount < 2) return `Question ${index + 1} needs at least two correct answers.`;
    if (!Number.isFinite(Number(question.marks)) || Number(question.marks) <= 0) return `Question ${index + 1} needs positive marks.`;
  }

  return null;
};

const persistQuestions = async (client, examId, questions) => {
  await client.query('DELETE FROM exam_questions WHERE exam_id = $1', [examId]);
  for (const [index, question] of questions.entries()) {
    const sourceQuestionId = isUuid(question._bankQuestionId) ? question._bankQuestionId : null;
    await client.query(
      `INSERT INTO exam_questions (exam_id, position, source_question_id, question_data)
       VALUES ($1, $2, $3, $4)`,
      [examId, index + 1, sourceQuestionId, JSON.stringify(question)]
    );
  }
};

const examFromRow = (row) => {
  const questions = row.questions || [];
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    course: row.course,
    instructions: row.instructions,
    schedule: row.scheduled_at,
    duration: row.duration,
    lab: row.lab || (row.lab_id == null ? '' : String(row.lab_id)),
    batch: row.batch,
    security: {
      allowTabSwitch: Boolean(row.allow_tab_switch),
      enableAudioMonitor: Boolean(row.enable_audio_monitor),
    },
    totalMarks: Number(row.total_marks),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    questions,
    questionCount: Number(row.question_count ?? questions.length),
  };
};

export const listExams = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT e.*,
              (SELECT COUNT(*)::int FROM exam_questions eq WHERE eq.exam_id = e.id) AS question_count
       FROM exams e
       WHERE e.created_by = $1
       ORDER BY e.updated_at DESC`,
      [req.user.id]
    );
    return res.json({ success: true, exams: result.rows.map(examFromRow) });
  } catch (error) {
    return next(error);
  }
};

export const getExam = async (req, res, next) => {
  try {
    const { examId } = req.params;
    if (!isExamId(examId)) return res.status(400).json({ success: false, message: 'Invalid exam ID.' });

    const result = await pool.query(
      `SELECT e.*,
              COALESCE((SELECT jsonb_agg(eq.question_data ORDER BY eq.position)
                        FROM exam_questions eq WHERE eq.exam_id = e.id), '[]'::jsonb) AS questions,
              (SELECT COUNT(*)::int FROM exam_questions eq WHERE eq.exam_id = e.id) AS question_count
       FROM exams e
       WHERE e.id = $1 AND e.created_by = $2`,
      [examId, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Exam not found.' });
    return res.json({ success: true, exam: examFromRow(result.rows[0]) });
  } catch (error) {
    return next(error);
  }
};

export const createExam = async (req, res, next) => {
  const validationError = validateExam(req.body);
  if (validationError) return res.status(400).json({ success: false, message: validationError });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO exams (
         created_by, title, subject, course, instructions, scheduled_at,
         duration, lab, batch, allow_tab_switch, enable_audio_monitor, total_marks, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        req.user.id,
        req.body.title.trim(),
        req.body.subject.trim(),
        req.body.course || null,
        req.body.instructions || null,
        req.body.schedule || null,
        Number(req.body.duration),
        req.body.lab || '',
        req.body.batch || '',
        Boolean(req.body.security?.allowTabSwitch),
        Boolean(req.body.security?.enableAudioMonitor),
        Number(req.body.totalMarks || 0),
        req.body.status,
      ]
    );
    await persistQuestions(client, result.rows[0].id, req.body.questions);
    await client.query('COMMIT');
    return res.status(201).json({ success: true, exam: examFromRow({ ...result.rows[0], questions: req.body.questions }) });
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    return next(error);
  } finally {
    client.release();
  }
};

export const updateExam = async (req, res, next) => {
  const { examId } = req.params;
  if (!isExamId(examId)) return res.status(400).json({ success: false, message: 'Invalid exam ID.' });
  const validationError = validateExam(req.body);
  if (validationError) return res.status(400).json({ success: false, message: validationError });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `UPDATE exams
       SET title = $1, subject = $2, course = $3, instructions = $4,
           scheduled_at = $5, duration = $6, lab = $7, batch = $8,
           allow_tab_switch = $9, enable_audio_monitor = $10,
           total_marks = $11, status = $12, updated_at = NOW()
       WHERE id = $13 AND created_by = $14
       RETURNING *`,
      [
        req.body.title.trim(),
        req.body.subject.trim(),
        req.body.course || null,
        req.body.instructions || null,
        req.body.schedule || null,
        Number(req.body.duration),
        req.body.lab || '',
        req.body.batch || '',
        Boolean(req.body.security?.allowTabSwitch),
        Boolean(req.body.security?.enableAudioMonitor),
        Number(req.body.totalMarks || 0),
        req.body.status,
        examId,
        req.user.id,
      ]
    );
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }
    await persistQuestions(client, examId, req.body.questions);
    await client.query('COMMIT');
    return res.json({ success: true, exam: examFromRow({ ...result.rows[0], questions: req.body.questions }) });
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    return next(error);
  } finally {
    client.release();
  }
};

export const deleteExam = async (req, res, next) => {
  try {
    const { examId } = req.params;
    if (!isExamId(examId)) return res.status(400).json({ success: false, message: 'Invalid exam ID.' });
    const result = await pool.query(
      'DELETE FROM exams WHERE id = $1 AND created_by = $2 RETURNING id',
      [examId, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Exam not found.' });
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
};
