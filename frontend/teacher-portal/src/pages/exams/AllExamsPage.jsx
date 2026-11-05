import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { CheckIcon, XIcon } from '../../components/common/Icons';
import { useExams } from '../../context/ExamContext';
import { toast } from '../../utils/toast';
import './AllExamsPage.css';

const formatSchedule = (schedule) => {
  if (!schedule) return '--';
  const date = new Date(schedule);
  return Number.isNaN(date.getTime()) ? '--' : date.toLocaleString();
};

export const AllExamsPage = () => {
  const navigate = useNavigate();
  const { exams, isLoading, error, deleteExam } = useExams();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredExams = useMemo(() => exams.filter((exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || exam.status === filter;
    return matchesSearch && matchesFilter;
  }), [exams, search, filter]);

  const handleDelete = async (exam) => {
    if (!window.confirm(`Delete "${exam.title}"? This cannot be undone.`)) return;
    try {
      await deleteExam(exam.id);
      toast.success('Exam deleted.');
    } catch (requestError) {
      toast.error(requestError.message);
    }
  };

  return (
    <div className="all-exams-page">
      <h2 className="page-title">All Examinations</h2>

      <div className="controls">
        <Input
          placeholder="Search exams..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="exam-search-input"
        />
        <div className="status-filters">
          {['all', 'draft', 'published'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
        <Button variant="primary" onClick={() => navigate('/exams/create')} icon={CheckIcon}>
          Create New Exam
        </Button>
      </div>

      {error && <p className="no-results" role="alert">{error}</p>}
      {isLoading ? (
        <p className="no-results" role="status">Loading examinations…</p>
      ) : filteredExams.length === 0 ? (
        <p className="no-results">No examinations match your criteria.</p>
      ) : (
        <table className="exam-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Scheduled</th>
              <th>Questions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExams.map((exam) => (
              <tr key={exam.id}>
                <td>{exam.title}</td>
                <td>{exam.status}</td>
                <td>{formatSchedule(exam.schedule)}</td>
                <td>{exam.questionCount ?? exam.questions?.length ?? 0}</td>
                <td className="action-cell">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/exams/${exam.id}/edit`)}
                    icon={CheckIcon}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(exam)}
                    icon={XIcon}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
