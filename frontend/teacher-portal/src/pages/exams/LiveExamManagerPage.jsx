import React, { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { useExams } from '../../context/ExamContext';
import './LiveExamManagerPage.css';

const formatClock = (date) => date
  ? new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  : '—';

const formatRemaining = (endsAt, now) => {
  if (!endsAt) return '—';
  const totalSeconds = Math.max(0, Math.floor((new Date(endsAt).getTime() - now) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const formatStudentRemaining = (student, now) => {
  if (student.status === 'submitted') return 'Submitted';
  if (student.status === 'terminated') return 'Locked';
  if (!student.attemptEndsAt) return 'Not started';
  const end = new Date(student.attemptEndsAt).getTime() + Number(student.extraTimeSeconds || 0) * 1000;
  return formatRemaining(end, now);
};

export const LiveExamManagerPage = () => {
  const navigate = useNavigate();
  const { exams, isLoading, error: examError } = useExams();
  const publishedExams = useMemo(() => exams.filter((exam) => exam.status === 'published'), [exams]);
  const [examId, setExamId] = useState('');
  const [managerState, setManagerState] = useState(null);
  const [socketStatus, setSocketStatus] = useState('connecting');
  const [message, setMessage] = useState('');
  const [now, setNow] = useState(Date.now());
  const socketRef = useRef(null);

  useEffect(() => {
    if (!publishedExams.length) {
      setExamId('');
      return;
    }
    if (!publishedExams.some((exam) => String(exam.id) === examId)) {
      setExamId(String(publishedExams[0].id));
    }
  }, [publishedExams, examId]);

  useEffect(() => {
    const socket = io({ withCredentials: true });
    socketRef.current = socket;
    socket.on('connect', () => setSocketStatus('connected'));
    socket.on('disconnect', () => setSocketStatus('disconnected'));
    socket.on('connect_error', (error) => {
      setSocketStatus('disconnected');
      setMessage(error.message || 'Could not connect to live exam services.');
    });
    socket.on('exam:manager_state', setManagerState);
    socket.on('exam:session', (liveSession) => {
      setManagerState((current) => current ? { ...current, liveSession } : current);
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket?.connected || !examId) return;
    setMessage('');
    setManagerState(null);
    socket.emit('teacher:join_exam', { examId }, (response) => {
      if (!response?.success) {
        setMessage(response?.message || 'Could not open this exam.');
        return;
      }
      setManagerState(response.state);
    });
  }, [examId, socketStatus]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const runCommand = (event, payload, successText) => {
    const socket = socketRef.current;
    if (!socket?.connected) {
      setMessage('Live service is disconnected. Reconnect before changing the exam.');
      return;
    }
    socket.emit(event, { examId, ...payload }, (response) => {
      if (!response?.success) {
        setMessage(response?.message || 'The command could not be completed.');
        return;
      }
      if (response.state) setManagerState(response.state);
      setMessage(successText);
    });
  };

  const liveSession = managerState?.liveSession || { status: 'waiting' };
  const students = managerState?.students || [];
  const violations = managerState?.violations || [];
  const activeTimers = students.filter((student) => student.attemptEndsAt && !['submitted', 'terminated'].includes(student.status)).length;
  const selectedExam = publishedExams.find((exam) => String(exam.id) === examId);

  return (
    <div className="live-exam-manager">
      <div className="lem-heading">
        <div>
          <p className="lem-eyebrow">EXAM CONTROL ROOM</p>
          <h2 className="page-title">Manage Live Exams</h2>
          <p className="lem-subtitle">Control the exam clock, monitor students, and respond to activity in real time.</p>
        </div>
        <span className={`lem-socket-status ${socketStatus}`}><i />{socketStatus === 'connected' ? 'Socket connected' : 'Socket disconnected'}</span>
      </div>

      {examError && <div className="lem-alert error">{examError}</div>}
      {message && <div className={`lem-alert ${message.startsWith('Could') || message.startsWith('Live service') ? 'error' : ''}`} role="status">{message}</div>}

      {isLoading ? <p className="lem-muted">Loading published exams…</p> : publishedExams.length === 0 ? (
        <section className="lem-empty-card">
          <h3>No published exams yet</h3>
          <p>Publish an exam first. It will appear here for live controls.</p>
          <Button variant="primary" onClick={() => navigate('/exams/create')}>Create an exam</Button>
        </section>
      ) : (
        <>
          <div className="lem-toolbar">
            <Select
              label="Published examination"
              value={examId}
              onChange={setExamId}
              options={publishedExams.map((exam) => ({ value: String(exam.id), label: exam.title }))}
              required
            />
            {selectedExam && <Button variant="outline" onClick={() => navigate(`/exams/${selectedExam.id}/edit`)}>Edit exam setup</Button>}
          </div>

          {selectedExam && (
            <>
              <section className="lem-clock-card">
                <div className="lem-exam-title">
                  <span className={`lem-state-pill ${liveSession.status}`}>{liveSession.status}</span>
                  <h3>{selectedExam.title}</h3>
                  <p>{selectedExam.subject}{selectedExam.course ? ` · ${selectedExam.course}` : ''}</p>
                </div>
                <div className="lem-clock">
                  <span>{liveSession.status === 'live' ? 'INDIVIDUAL TIMERS' : 'EXAM TIMER'}</span>
                  <strong>{liveSession.status === 'live' ? `${activeTimers} active` : '—'}</strong>
                  {liveSession.status === 'live' && <small>Each student gets the full duration when their questions load.</small>}
                </div>
                <div className="lem-controls">
                  {liveSession.status === 'waiting' && <Button variant="success" onClick={() => runCommand('teacher:start_exam', {}, 'Exam started.')}>Start Exam</Button>}
                  {liveSession.status === 'live' && <>
                    <Button variant="outline" onClick={() => runCommand('teacher:adjust_exam_time', { minutes: -5 }, 'Reduced each active and future student timer by 5 minutes.')}>− 5 min</Button>
                    <Button variant="outline" onClick={() => runCommand('teacher:adjust_exam_time', { minutes: 5 }, 'Added 5 minutes to each active and future student timer.')}>+ 5 min</Button>
                    <Button variant="danger" onClick={() => {
                      if (window.confirm('Finish this exam now? Students will be submitted and scores calculated.')) {
                        runCommand('teacher:finish_exam', {}, 'Exam finished and results calculated.');
                      }
                    }}>Finish Exam</Button>
                  </>}
                  {liveSession.status === 'finished' && <span className="lem-finished-note">Exam finished · results are available to students</span>}
                </div>
              </section>

              <section className="lem-panel">
                <div className="lem-panel-heading"><div><h3>Students</h3><p>Presence, extra time, scores, and session controls.</p></div><strong>{students.length}</strong></div>
                {students.length === 0 ? <div className="lem-empty">Waiting for students to join this exam.</div> : (
                  <div className="lem-table-wrap">
                    <table className="lem-table">
                      <thead><tr><th>Student</th><th>Roll no.</th><th>Presence</th><th>Progress</th><th>Time left</th><th>Extra time</th><th>Violations</th><th>Score</th><th>Actions</th></tr></thead>
                      <tbody>
                        {students.map((student) => (
                          <tr key={student.id}>
                            <td>{student.fullName}</td>
                            <td>{student.rollNumber}</td>
                            <td><span className={`lem-presence ${student.status}`}>{student.status}</span></td>
                            <td>{managerState?.questionCount ? `${student.answeredCount} / ${managerState.questionCount}` : '—'}</td>
                            <td>{formatStudentRemaining(student, now)}</td>
                            <td>{Math.floor(student.extraTimeSeconds / 60)} min</td>
                            <td>{student.violationCount}</td>
                            <td>{student.score == null ? '—' : `${student.score} / ${selectedExam.totalMarks}`}</td>
                            <td className="lem-actions">
                              {!['terminated', 'submitted'].includes(student.status) && <>
                                <button type="button" onClick={() => runCommand('teacher:adjust_student_time', { studentId: student.id, minutes: 5 }, `Added 5 minutes for ${student.fullName}.`)} title="Give student 5 extra minutes">+5 min</button>
                                <button type="button" onClick={() => runCommand('teacher:adjust_student_time', { studentId: student.id, minutes: -5 }, `Removed 5 extra minutes for ${student.fullName}.`)} title="Remove 5 minutes">−5 min</button>
                                <button type="button" onClick={() => {
                                  const warning = window.prompt(`Warning for ${student.fullName}:`);
                                  if (warning?.trim()) runCommand('teacher:warn_student', { studentId: student.id, message: warning }, `Warning sent to ${student.fullName}.`);
                                }}>Warn</button>
                                <button type="button" className="danger" onClick={() => {
                                  if (window.confirm(`Terminate ${student.fullName}'s exam session?`)) runCommand('teacher:terminate_student', { studentId: student.id }, `${student.fullName}'s session was terminated.`);
                                }}>End session</button>
                              </>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="lem-panel">
                <div className="lem-panel-heading"><div><h3>Activity and violations</h3><p>Latest events reported during this exam.</p></div><strong>{violations.length}</strong></div>
                {violations.length === 0 ? <div className="lem-empty">No violations or warnings recorded.</div> : (
                  <ul className="lem-violation-list">
                    {violations.map((violation) => (
                      <li key={violation.id}>
                        <span className="lem-violation-dot" />
                        <div><strong>{violation.fullName} · {violation.kind.replaceAll('_', ' ')}</strong><p>{violation.details || 'No additional details'}</p></div>
                        <time>{formatClock(violation.occurredAt)}</time>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
};
