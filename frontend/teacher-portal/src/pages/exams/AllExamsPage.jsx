import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { CheckIcon, XIcon } from '../../components/common/Icons';
import './AllExamsPage.css';

// Mock exam data – replace with real API calls in production
const mockExams = [
  { id: '1', title: 'Midterm Chemistry', status: 'ongoing', date: '2024-10-15' },
  { id: '2', title: 'Final Physics',    status: 'scheduled', date: '2024-12-01' },
  { id: '3', title: 'Quiz Math',       status: 'draft',     date: '' },
  { id: '4', title: 'Project Presentation', status: 'completed', date: '2024-09-20' },
];

export const AllExamsPage = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  // Simulate fetching exams
  useEffect(() => {
    setExams(mockExams);
  }, []);

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || exam.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleAction = (examId, action) => {
    console.log(`Exam ${examId} - ${action}`);
    if (action === 'delete') {
      setExams((prev) => prev.filter((e) => e.id !== examId));
    }
    // Add further actions (cancel, reschedule, duplicate, view results) as needed
  };

  return (
    <div className="all-exams-page">
      <h2 className="page-title">All Examinations</h2>

      {/* Controls: search, status filter, create new exam */}
      <div className="controls">
        <Input
          placeholder="Search exams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="status-filters">
          {['all', 'ongoing', 'scheduled', 'draft', 'completed'].map((st) => (
            <Button
              key={st}
              variant={filter === st ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter(st)}
            >
              {st.charAt(0).toUpperCase() + st.slice(1)}
            </Button>
          ))}
        </div>
        <Button variant="primary" onClick={() => navigate('/teacher/create-exam')} icon={CheckIcon}>
          Create New Exam
        </Button>
      </div>

      {/* Exam list */}
      {filteredExams.length === 0 ? (
        <p className="no-results">No exams match your criteria.</p>
      ) : (
        <table className="exam-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExams.map((exam) => (
              <tr key={exam.id}>
                <td>{exam.title}</td>
                <td>{exam.status}</td>
                <td>{exam.date || '--'}</td>
                <td className="action-cell">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/teacher/exams/${exam.id}/details`)} icon={CheckIcon}>View</Button>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/teacher/exams/${exam.id}/edit`)} icon={CheckIcon}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleAction(exam.id, 'delete')} icon={XIcon}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
