import pool from '../conn.js';

const sendBadRequest = (res, message) =>
  res.status(400).json({ success: false, message });

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isUuid = (value) =>
  typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export const listFolders = async (req, res, next) => {
  try {
    const bankId = req.questionBank.id;

    const result = await pool.query(
      `SELECT qf.id, qf.bank_id, qf.name, qf.created_at,
              COUNT(DISTINCT qfq.question_id)::int AS question_count
       FROM question_folders qf
       LEFT JOIN question_folder_questions qfq ON qfq.folder_id = qf.id
       WHERE qf.bank_id = $1
       GROUP BY qf.id
       ORDER BY qf.created_at DESC`,
      [bankId]
    );

    return res.json({ success: true, folders: result.rows });
  } catch (error) {
    return next(error);
  }
};


export const createFolder = async (req, res, next) => {
  try {

    const bankId = req.questionBank.id;
    const { name } = req.body;
    if (!isNonEmptyString(name)) return sendBadRequest(res, 'Folder name is required.');

    const result = await pool.query(
      `INSERT INTO question_folders (bank_id, name)
       VALUES ($1, $2)
       RETURNING id, bank_id, name, created_at`,
      [bankId, name.trim()]
    );

    return res.status(201).json({ success: true, folder: result.rows[0] });
  } catch (error) {
    return next(error);
  }
};

const fetchQuestionOptions = async (client, questionIds) => {
  if (questionIds.length === 0) return [];
  const result = await client.query(
    `SELECT id, question_id, option_text AS text, position, is_correct AS "isCorrect"
     FROM question_options
     WHERE question_id = ANY($1::uuid[])
     ORDER BY question_id, position`,
    [questionIds]
  );
  return result.rows;
};

export const listQuestions = async (req, res, next) => {
  try {
    const bankId = req.questionBank.id;
    const result = await pool.query(
      `SELECT q.id, q.type, q.prompt AS statement, q.explanation,
              q.marks, q.negative_marks AS "negativeMarks",
              array_agg(DISTINCT qfq.folder_id) AS "folderIds"
       FROM questions q
       JOIN question_folder_questions qfq ON qfq.question_id = q.id
       JOIN question_folders qf ON qf.id = qfq.folder_id
       WHERE qf.bank_id = $1
       GROUP BY q.id
       ORDER BY q.created_at DESC`,
      [bankId]
    );
    const options = await fetchQuestionOptions(pool, result.rows.map((question) => question.id));
    const optionsByQuestionId = new Map();
    for (const option of options) {
      const questionOptions = optionsByQuestionId.get(option.question_id) || [];
      questionOptions.push({
        id: option.id,
        text: option.text,
        position: option.position,
        isCorrect: option.isCorrect,
      });
      optionsByQuestionId.set(option.question_id, questionOptions);
    }

    const questions = result.rows.map((question) => ({
      ...question,
      title: question.statement,
      options: optionsByQuestionId.get(question.id) || [],
    }));
    return res.json({ success: true, questions });
  } catch (error) {
    return next(error);
  }
};

export const listFolderQuestions = async (req, res, next) => {
  try {
    const { folderId } = req.params;
    const bankId = req.questionBank.id;
    if (!isUuid(folderId)) return sendBadRequest(res, 'Invalid folder ID.');
    const folderResult = await pool.query(
      `SELECT qf.id
       FROM question_folders qf
       JOIN question_banks qb ON qb.id = qf.bank_id
       WHERE qf.id = $1 AND qb.id = $2 AND qb.teacher_id = $3`,
      [folderId, bankId, req.user.id]
    );
    if (folderResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Folder not found.' });
    }

    const result = await pool.query(
      `SELECT q.id, q.type, q.prompt AS statement, q.explanation,
              q.marks, q.negative_marks AS "negativeMarks"
       FROM questions q
       JOIN question_folder_questions qfq ON qfq.question_id = q.id
       WHERE qfq.folder_id = $1
       ORDER BY q.created_at DESC`,
      [folderId]
    );
    const options = await fetchQuestionOptions(pool, result.rows.map((question) => question.id));
    const optionsByQuestionId = new Map();
    for (const option of options) {
      const questionOptions = optionsByQuestionId.get(option.question_id) || [];
      questionOptions.push({
        id: option.id,
        text: option.text,
        position: option.position,
        isCorrect: option.isCorrect,
      });
      optionsByQuestionId.set(option.question_id, questionOptions);
    }

    const questions = result.rows.map((question) => ({
      ...question,
      title: question.statement,
      options: optionsByQuestionId.get(question.id) || [],
    }));
    return res.json({ success: true, questions });
  } catch (error) {
    return next(error);
  }
};


export const createQuestion = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const bankId = req.questionBank.id;
    const {
      type = 'mcq_single',
      statement,
      prompt,
      options,
      explanation = null,
      marks = 1,
      negativeMarks = 0,
      folderIds,
    } = req.body;
    const questionPrompt = statement ?? prompt;

    if (!['mcq_single', 'mcq_multi'].includes(type)) {
      return sendBadRequest(res, 'Question type must be mcq_single or mcq_multi.');
    }
    if (!isNonEmptyString(questionPrompt)) {
      return sendBadRequest(res, 'Question statement is required.');
    }
    if (!Array.isArray(options) || options.length !== 4) {
      return sendBadRequest(res, 'An MCQ must have exactly four options.');
    }
    if (options.some((option) => !isNonEmptyString(option?.text ?? option?.option_text))) {
      return sendBadRequest(res, 'All four options must have text.');
    }
    const correctCount = options.filter((option) => option?.isCorrect === true || option?.is_correct === true).length;
    if (correctCount === 0 || (type === 'mcq_single' && correctCount !== 1) || (type === 'mcq_multi' && correctCount < 2)) {
      return sendBadRequest(res, type === 'mcq_single'
        ? 'A single-answer question must have exactly one correct option.'
        : 'A multiple-answer question must have at least two correct options.');
    }
    if (!Array.isArray(folderIds) || folderIds.length === 0) {
      return sendBadRequest(res, 'Select at least one folder for this question.');
    }
    if (!folderIds.every(isUuid)) return sendBadRequest(res, 'Every folder ID must be a valid UUID.');
    if (!Number.isFinite(Number(marks)) || Number(marks) <= 0 || !Number.isFinite(Number(negativeMarks)) || Number(negativeMarks) < 0) {
      return sendBadRequest(res, 'Marks must be positive and negative marks cannot be below zero.');
    }

    await client.query('BEGIN');
    const uniqueFolderIds = [...new Set(folderIds)];
    const ownedFolders = await client.query(
      `SELECT qf.id
       FROM question_folders qf
       WHERE qf.bank_id = $1 AND qf.id = ANY($2::uuid[])`,
      [bankId, uniqueFolderIds]
    );
    if (ownedFolders.rowCount !== uniqueFolderIds.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'One or more folders do not belong to this question bank.' });
    }
    const questionResult = await client.query(
      `INSERT INTO questions (type, prompt, explanation, marks, negative_marks)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, type, prompt AS statement, explanation, marks,
                 negative_marks AS "negativeMarks", created_at`,
      [type, questionPrompt.trim(), isNonEmptyString(explanation) ? explanation.trim() : null, Number(marks), Number(negativeMarks)]
    );
    const question = questionResult.rows[0];

    for (const [index, option] of options.entries()) {
      await client.query(
        `INSERT INTO question_options (question_id, option_text, position, is_correct)
         VALUES ($1, $2, $3, $4)`,
        [question.id, (option.text ?? option.option_text).trim(), index + 1, option.isCorrect === true || option.is_correct === true]
      );
    }
    for (const folderId of uniqueFolderIds) {
      await client.query(
        `INSERT INTO question_folder_questions (question_id, folder_id)
         VALUES ($1, $2)`,
        [question.id, folderId]
      );
    }

    await client.query('COMMIT');
    const savedOptions = await fetchQuestionOptions(client, [question.id]);
    question.title = question.statement;
    question.options = savedOptions.map(({ id, text, position, isCorrect }) => ({ id, text, position, isCorrect }));
    return res.status(201).json({ success: true, question });
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    return next(error);
  } finally {
    client.release();
  }
};
