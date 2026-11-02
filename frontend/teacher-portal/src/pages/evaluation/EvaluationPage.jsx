import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { CheckIcon, XIcon } from '../../components/common/Icons';
import './EvaluationPage.css';

// Mock data - list of completed exams awaiting evaluation
// Mock data - list of completed exams awaiting evaluation
const mockEvaluations = [
  {
    id: 'e1',
    title: 'Midterm Chemistry',
    student: 'Alice',
    autoScore: 85, // objective auto‑evaluated score
    subjectiveScore: null,
    programmingScore: null,
    progDetails: [
      { test: 'Test 1', passed: true },
      { test: 'Test 2', passed: false },
    ],
    // Example submissions: objective and subjective questions
    submissions: [
      { q: 'What is H2O?', a: 'Water', type: 'objective', max: 5 },
      { q: 'Explain photosynthesis.', a: '...', type: 'subjective', max: 10 },
    ],
    feedback: '',
    status: 'pending', // pending | reviewed | published
  },
  {
    id: 'e2',
    title: 'Final Physics',
    student: 'Bob',
    autoScore: 78,
    subjectiveScore: null,
    programmingScore: 60,
    progDetails: [
      { test: 'Compile', passed: true },
      { test: 'Run', passed: false },
    ],
    submissions: [
      { q: 'Define Newton\'s second law.', a: 'F=ma', type: 'objective', max: 5 },
      { q: 'Write a function to compute factorial.', a: 'function factorial(n) { ... }', type: 'programming', max: 15 },
    ],
    feedback: '',
    status: 'pending',
  },
];


export const EvaluationPage = () => {
  const [evaluations, setEvaluations] = useState(mockEvaluations);
  const [selected, setSelected] = useState(null);

  const handleScoreChange = (id, field, value) => {
    setEvaluations((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, [field]: Number(value) } : ev))
    );
  };

  const handleFeedbackChange = (id, value) => {
    setEvaluations((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, feedback: value } : ev))
    );
  };

  const finalize = (id) => {
    setEvaluations((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, status: 'published' } : ev))
    );
    setSelected(null);
  };

  return (
    <div className="evaluation-page">
      <h2 className="page-title">Evaluation Dashboard</h2>

      {/* List of exams awaiting evaluation */}
      <table className="evaluation-table">
        <thead>
          <tr>
            <th>Exam</th>
            <th>Student</th>
            <th>Auto Score</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {evaluations.map((ev) => (
            <tr key={ev.id} className={ev.status === 'published' ? 'published' : ''}>
              <td>{ev.title}</td>
              <td>{ev.student}</td>
              <td>{ev.autoScore}%</td>
              <td>{ev.status}</td>
              <td className="action-cell">
                <Button size="sm" variant="outline" onClick={() => setSelected(ev)} icon={CheckIcon}>View</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Detail panel for selected evaluation */}
      {selected && (
        <div className="detail-panel">
          <h3>{selected.title} – {selected.student}</h3>

          {/* Objective auto‑evaluated */}
          <p>Objective (auto‑evaluated) score: <strong>{selected.autoScore}%</strong></p>

          {/* Subjective score input */}
          <Input
            label="Subjective Marks"
            type="number"
            value={selected.subjectiveScore ?? ''}
            onChange={(e) => handleScoreChange(selected.id, 'subjectiveScore', e.target.value)}
          />

          {/* Programming submission */}
          {selected.programmingScore !== null && (
            <div className="prog-section">
              <p>Programming score: {selected.programmingScore}%</p>
              <ul>
                {selected.progDetails.map((p, idx) => (
                  <li key={idx}>{p.test}: {p.passed ? 'Passed' : 'Failed'}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Feedback textarea */}
          <div className="feedback-section">
            <Input
              label="Feedback / Comments"
              type="text"
              value={selected.feedback}
              onChange={(e) => handleFeedbackChange(selected.id, e.target.value)}
            />
          </div>

          {/* Finalize button */}
          <div className="detail-actions">
            <Button variant="primary" onClick={() => finalize(selected.id)} icon={CheckIcon}>Finalize & Publish</Button>
            <Button variant="secondary" onClick={() => setSelected(null)} icon={XIcon}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
};
