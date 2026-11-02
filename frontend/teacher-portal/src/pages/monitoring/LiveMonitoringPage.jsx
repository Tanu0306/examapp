import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { CheckIcon, XIcon, AlertCircleIcon } from '../../components/common/Icons';
import './LiveMonitoringPage.css';

// Mock data – replace with real API calls in production
const mockExams = [
  { id: '1', title: 'Midterm Chemistry' },
  { id: '2', title: 'Final Physics' },
];

const mockStudents = {
  '1': [
    { id: 's1', name: 'Alice', roll: 'A001', terminal: 'T-01', progress: 45, remaining: '15m', connected: true, violations: [] },
    { id: 's2', name: 'Bob',   roll: 'A002', terminal: 'T-02', progress: 80, remaining: '5m',  connected: false, violations: ['Tab switch'] },
  ],
  '2': [
    { id: 's3', name: 'Charlie', roll: 'B001', terminal: 'T-03', progress: 30, remaining: '25m', connected: true, violations: [] },
  ],
};

export const LiveMonitoringPage = () => {
  const navigate = useNavigate();
  const [examId, setExamId] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [logMessage, setLogMessage] = useState('');

  // Load mock exam list on mount
  useEffect(() => {
    if (mockExams.length) setExamId(mockExams[0].id);
  }, []);

  // Load students whenever exam changes
  useEffect(() => {
    if (examId) setStudents(mockStudents[examId] || []);
  }, [examId]);

  const handleExtraTime = (studentId) => {
    console.log('Grant extra time to', studentId);
    setLogMessage(`Extra time granted to ${studentId}`);
  };

  const handleTerminate = (studentId) => {
    console.log('Terminate session for', studentId);
    setLogMessage(`Session terminated for ${studentId}`);
  };

  const handleAnnouncement = () => {
    if (selectedStudent) {
      console.log('Announce to', selectedStudent.id);
      setLogMessage(`Announcement sent to ${selectedStudent.name}`);
    }
  };

  return (
    <div className="live-monitoring-page">
      <h2 className="page-title">Live Monitoring</h2>

      {/* Exam selector */}
      <div className="exam-select">
        <Select
          label="Active Examination"
          value={examId}
          onChange={(e) => setExamId(e.target.value)}
          options={mockExams.map((ex) => ({ value: ex.id, label: ex.title }))}
          required
        />
      </div>

      {/* Students table */}
      <table className="students-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll #</th>
            <th>Terminal ID</th>
            <th>Progress</th>
            <th>Remaining</th>
            <th>Status</th>
            <th>Violations</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((stu) => (
            <tr key={stu.id} className={stu.connected ? 'connected' : 'disconnected'}>
              <td data-label="Name">{stu.name}</td>
              <td data-label="Roll #">{stu.roll}</td>
              <td data-label="Terminal ID">{stu.terminal}</td>
              <td data-label="Progress">{stu.progress}%</td>
              <td data-label="Remaining">{stu.remaining}</td>
              <td>{stu.connected ? 'Connected' : 'Disconnected'}</td>
              <td>{stu.violations.length ? stu.violations.join(', ') : '—'}</td>
              <td className="action-cell">
                <Button size="sm" variant="primary" onClick={() => handleExtraTime(stu.id)} icon={CheckIcon}>Extra Time</Button>
                <Button size="sm" variant="danger" onClick={() => handleTerminate(stu.id)} icon={XIcon}>Terminate</Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedStudent(stu)} icon={AlertCircleIcon}>Warn</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Selected student warning / announcement */}
      {selectedStudent && (
        <div className="announcement-panel">
          <h3>Send Warning / Announcement</h3>
          <p>Student: {selectedStudent.name} (Roll {selectedStudent.roll})</p>
          <Input label="Message" value={logMessage} onChange={(e) => setLogMessage(e.target.value)} placeholder="Enter warning or announcement" />
          <div className="announcement-actions">
            <Button variant="primary" onClick={handleAnnouncement} icon={CheckIcon}>Send</Button>
            <Button variant="secondary" onClick={() => setSelectedStudent(null)} icon={XIcon}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Bottom log area */}
      <div className="log-area">
        <h3>Event Log</h3>
        <p>{logMessage || 'No recent events.'}</p>
      </div>
    </div>
  );
};
