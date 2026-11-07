import pool from '../conn.js';
import { publishExamPresence, subscribeToExamPresence } from '../services/studentPresenceService.js';

const isExamId = (value) => typeof value === 'string' && /^[1-9]\d*$/.test(value);
const writeEvent = (res, type, data) => {
  res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
};

const getOwnedExam = async (examId, teacherId) => {
  if (!isExamId(examId)) return false;
  const result = await pool.query(
    'SELECT id FROM exams WHERE id = $1 AND created_by = $2',
    [examId, teacherId]
  );
  return result.rowCount > 0;
};

const getParticipants = async (examId) => {
  const result = await pool.query(
    `SELECT id, full_name, roll_number, joined_at, last_seen_at, status
     FROM exam_participants
     WHERE exam_id = $1
     ORDER BY joined_at ASC`,
    [examId]
  );
  return result.rows.map((row) => ({
    id: row.id,
    fullName: row.full_name,
    rollNumber: row.roll_number,
    joinedAt: row.joined_at,
    lastSeenAt: row.last_seen_at,
    status: row.status,
  }));
};

export const listExamParticipants = async (req, res, next) => {
  try {
    if (!await getOwnedExam(req.params.examId, req.user.id)) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }
    const students = await getParticipants(req.params.examId);
    return res.json({ success: true, students });
  } catch (error) {
    return next(error);
  }
};

export const streamExamParticipants = async (req, res, next) => {
  const { examId } = req.params;
  try {
    if (!await getOwnedExam(examId, req.user.id)) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    res.status(200);
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.flushHeaders?.();

    let ready = false;
    const pendingEvents = [];
    const unsubscribe = subscribeToExamPresence(examId, (event) => {
      if (!ready) pendingEvents.push(event);
      else writeEvent(res, event.type, event.data);
    });

    const heartbeat = setInterval(() => res.write(': keep-alive\n\n'), 20000);
    const staleCheck = setInterval(async () => {
      try {
        const stale = await pool.query(
          `UPDATE exam_participants
           SET status = 'disconnected'
           WHERE exam_id = $1 AND status = 'connected'
             AND last_seen_at < NOW() - INTERVAL '45 seconds'
           RETURNING id, full_name, roll_number, joined_at, last_seen_at, status`,
          [examId]
        );
        for (const row of stale.rows) {
          publishExamPresence(examId, {
            type: 'student_presence',
            data: {
              id: row.id,
              fullName: row.full_name,
              rollNumber: row.roll_number,
              joinedAt: row.joined_at,
              lastSeenAt: row.last_seen_at,
              status: row.status,
            },
          });
        }
      } catch (error) {
        console.error('[Monitoring] Presence check failed:', error.message);
      }
    }, 15000);

    res.on('close', () => {
      clearInterval(heartbeat);
      clearInterval(staleCheck);
      unsubscribe();
    });

    const students = await getParticipants(examId);
    writeEvent(res, 'snapshot', { students });
    ready = true;
    for (const event of pendingEvents) writeEvent(res, event.type, event.data);
  } catch (error) {
    if (res.headersSent) {
      console.error('[Monitoring] Event stream stopped:', error.message);
      return res.end();
    }
    return next(error);
  }
};
