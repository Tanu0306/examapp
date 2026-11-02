import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { CheckIcon, XIcon } from '../../components/common/Icons';

import { toast } from '../../utils/toast'; // we'll create a simple toast util later
import './CreateExamPage.css';

// Mock data for labs – in a real app this would come from the backend
const mockLabs = [
  { value: 'lab-1', label: 'Lab 1 – Computer Science' },
  { value: 'lab-2', label: 'Lab 2 – Electronics' },
  { value: 'lab-3', label: 'Lab 3 – Mechanical' },
];

// Simple date‑time picker using native inputs (no extra libraries)
const DateTimePicker = ({ label, value, onChange }) => (
  <div className="form-group">
    {label && <label className="form-label">{label}<span className="req">*</span></label>}
    <input type="datetime-local" className="form-input" value={value} onChange={onChange} required />
  </div>
);

export const CreateExamPage = () => {
  const navigate = useNavigate();
  // Removed question bank selection – teachers will create questions directly

  // Basic exam metadata
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [course, setCourse] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [duration, setDuration] = useState(60); // minutes
  // New questions created directly in the exam
  const [newQuestions, setNewQuestions] = useState([]); // each { id, title, marks }
  const [newTitle, setNewTitle] = useState('');
  const [newMarks, setNewMarks] = useState(1);

  // Lab / batch selection
  const [lab, setLab] = useState('');
  const [batch, setBatch] = useState('');

  // Security settings (simple checkboxes)
  const [allowTabSwitch, setAllowTabSwitch] = useState(false);
  const [enableAudioMonitor, setEnableAudioMonitor] = useState(false);



  // Load mock labs into select on mount
  useEffect(() => {
    if (mockLabs.length) setLab(mockLabs[0].value);
  }, []);





  const handleSave = (publish = false) => {
    if (!title.trim()) { toast.error('Exam title is required'); return; }
    if (!subject) { toast.error('Subject is required'); return; }
    if (!dateTime) { toast.error('Date & time are required'); return; }
    // In a real application we'd send this payload to the backend.
    const payload = {
      title,
      subject,
      course,
      instructions,
      schedule: dateTime,
      duration,
      lab,
      batch,
      security: { allowTabSwitch, enableAudioMonitor },
      questions: newQuestions,
      status: publish ? 'published' : 'draft',
    };
    console.log('Exam payload →', payload);
    toast.success(publish ? 'Exam published!' : 'Draft saved');
    // Return to exams list after a short delay
    setTimeout(() => navigate('/exams'), 1200);
  };

  return (
    <div className="create-exam-page">
      <h2 className="page-title">Create New Exam</h2>

      {/* Exam Metadata */}
      <section className="section-metadata">
        <Input label="Exam Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        <Input label="Course / Class" value={course} onChange={(e) => setCourse(e.target.value)} />
        <div className="form-group">
          <label className="form-label">Instructions</label>
          <textarea className="form-textarea" rows={4} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
        </div>
        <DateTimePicker label="Date & Time" value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
        <Input label="Duration (minutes)" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} required />
      </section>

      {/* Lab & Batch */}
      <section className="section-lab">
        <Select label="Lab" value={lab} onChange={(e) => setLab(e.target.value)} options={mockLabs} required />
        <Input label="Student Batch" value={batch} onChange={(e) => setBatch(e.target.value)} />
      </section>

      {/* Security Settings */}
      <section className="section-security">
        <h3>Security Settings</h3>
        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input type="checkbox" checked={allowTabSwitch} onChange={(e) => setAllowTabSwitch(e.target.checked)} />
            Allow Tab Switching (will be logged)
          </label>
        </div>
        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input type="checkbox" checked={enableAudioMonitor} onChange={(e) => setEnableAudioMonitor(e.target.checked)} />
            Enable Audio Monitoring
          </label>
        </div>
      </section>



      {/* New Question Creation */}
      <section className="section-new-questions">
        <h3>Add Questions Directly</h3>
        <div className="form-group">
          <Input label="Question Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
          <Input label="Marks" type="number" min={1} value={newMarks} onChange={(e) => setNewMarks(Number(e.target.value))} required />
          <Button variant="primary" onClick={() => {
            if (newTitle.trim() && newMarks > 0) {
              const newQ = { id: Date.now().toString(), title: newTitle.trim(), marks: newMarks };
              setNewQuestions((prev) => [...prev, newQ]);
              setNewTitle('');
              setNewMarks(1);
              toast.success('Question added');
            } else {
              toast.error('Provide title and marks');
            }
          }} icon={CheckIcon}>Add Question</Button>
        </div>
        {newQuestions.length > 0 && (
          <div className="question-list">
            <h4>Questions Added</h4>
            <ul>
              {newQuestions.map((q) => (
                <li key={q.id} className="question-item">
                  {q.title} (Marks: {q.marks})
                  <button className="remove-btn" onClick={() => setNewQuestions((prev) => prev.filter((item) => item.id !== q.id))}>✕</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>


      {/* Action Buttons */}
      <div className="form-actions">
        <Button variant="secondary" size="sm" onClick={() => handleSave(false)} icon={CheckIcon}>Save Draft</Button>
        <Button variant="primary" onClick={() => handleSave(true)} icon={CheckIcon}>Publish Exam</Button>
        <Button variant="outline" size="sm" onClick={() => navigate('/exams')} icon={XIcon}>Cancel</Button>
      </div>
    </div>
  );
};
