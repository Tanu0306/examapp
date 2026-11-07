import React, { useEffect, useMemo, useState } from 'react';
import { Select } from '../../components/common/Select';
import { useExams } from '../../context/ExamContext';
import './LiveMonitoringPage.css';

const upsertStudent = (students, student) => {
  const existingIndex = students.findIndex((item) => item.id === student.id);
  if (existingIndex === -1) return [...students, student];
  return students.map((item) => item.id === student.id ? student : item);
};

const formatTime = (value) => value
  ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  : '—';

export const LiveMonitoringPage = () => {
  const { exams, isLoading, error: examError } = useExams();
  const publishedExams = useMemo(() => exams.filter((exam) => exam.status === 'published'), [exams]);
  const [examId, setExamId] = useState('');
  const [students, setStudents] = useState([]);
  const [connection, setConnection] = useState('disconnected');
  const [streamError, setStreamError] = useState('');

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
    if (!examId) {
      setStudents([]);
      setConnection('disconnected');
      return undefined;
    }

    setStudents([]);
    setStreamError('');
    setConnection('connecting');
    let active = true;
    let stream;

    const connect = async () => {
      try {
        const response = await fetch(`/api/exams/${encodeURIComponent(examId)}/participants`, {
          credentials: 'include',
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Could not load students for this exam.');
        if (!active) return;
        setStudents(data.students || []);

        stream = new EventSource(`/api/exams/${encodeURIComponent(examId)}/participants/events`);
        stream.onopen = () => setConnection('connected');
        stream.onerror = () => setConnection('reconnecting');
        stream.addEventListener('snapshot', (event) => {
          const snapshot = JSON.parse(event.data);
          setStudents(snapshot.students || []);
        });
        stream.addEventListener('student_joined', (event) => {
          setStudents((current) => upsertStudent(current, JSON.parse(event.data)));
        });
        stream.addEventListener('student_presence', (event) => {
          setStudents((current) => upsertStudent(current, JSON.parse(event.data)));
        });
        stream.addEventListener('error', (event) => {
          if (event.data) {
            try { setStreamError(JSON.parse(event.data).message || 'Live updates are unavailable.'); }
            catch { setStreamError('Live updates are unavailable.'); }
          }
        });
      } catch (error) {
        if (!active) return;
        setConnection('disconnected');
        setStreamError(error.message);
      }
    };
    connect();

    return () => {
      active = false;
      stream?.close();
    };
  }, [examId]);

  const connectionLabel = {
    connected: 'Live connection',
    connecting: 'Connecting…',
    reconnecting: 'Reconnecting…',
    disconnected: 'Not connected',
  }[connection];

  return (
    <div className="live-monitoring-page">
      <div className="monitoring-heading">
        <div>
          <h2 className="page-title">Live Monitoring</h2>
          <p>Students appear here as they join an exam.</p>
        </div>
        <span className={`monitoring-connection ${connection}`}>
          <i aria-hidden="true" />{connectionLabel}
        </span>
      </div>

      {examError && <p className="monitoring-message error">{examError}</p>}
      {streamError && <p className="monitoring-message error">{streamError}</p>}
      {isLoading ? <p className="monitoring-message">Loading exams…</p> : publishedExams.length > 0 ? (
        <div className="exam-select">
          <Select
            label="Published exam"
            value={examId}
            onChange={setExamId}
            options={publishedExams.map((exam) => ({ value: String(exam.id), label: exam.title }))}
            required
          />
        </div>
      ) : (
        <p className="monitoring-message">Publish an exam to start monitoring students.</p>
      )}

      {examId && (
        <section className="monitoring-roster" aria-live="polite">
          <div className="monitoring-roster-heading">
            <h3>Students</h3>
            <span>{students.length} joined</span>
          </div>
          {students.length === 0 ? (
            <div className="monitoring-empty">Waiting for students to open the exam link and join.</div>
          ) : (
            <div className="monitoring-table-wrap">
              <table className="students-table">
                <thead>
                  <tr><th>Student</th><th>Roll number</th><th>Joined</th><th>Last activity</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className={student.status === 'connected' ? 'connected' : 'disconnected'}>
                      <td data-label="Student">{student.fullName}</td>
                      <td data-label="Roll number">{student.rollNumber}</td>
                      <td data-label="Joined">{formatTime(student.joinedAt)}</td>
                      <td data-label="Last activity">{formatTime(student.lastSeenAt)}</td>
                      <td data-label="Status"><span className={`student-presence ${student.status}`}>{student.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
