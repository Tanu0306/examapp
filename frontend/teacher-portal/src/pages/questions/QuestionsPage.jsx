import { useState, useMemo, useRef } from 'react';
import { useQuestions } from '../../context/QuestionContext';
import { Button } from '../../components/common/Button';
import {
  QuestionsIcon,
  PlusCircleIcon,
  SearchIcon,
  FilterIcon,
  CheckIcon,
  XIcon,
  EyeIcon,
  CodeIcon,
  AlertCircleIcon,
  EditIcon,
  TrashIcon,
  CopyIcon,
  DownloadIcon,
  UploadIcon,
  RefreshIcon,
} from '../../components/common/Icons';
import {
  SUBJECT_OPTIONS,
  QUESTION_TYPES,
  DIFFICULTY_LEVELS,
} from '../../data/questionStore';
import './QuestionsPage.css';

export const QuestionsPage = () => {
  const {
    questions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    importQuestions,
    exportQuestions,
    resetToDefaults,
  } = useQuestions();

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Modal States
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [authoringQuestion, setAuthoringQuestion] = useState(null); // null = closed, {} = new, question obj = edit
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // File import ref
  const fileInputRef = useRef(null);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Filtered Questions Memo
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch =
        !searchQuery.trim() ||
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.statement.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubject = selectedSubject === 'All' || q.subject === selectedSubject;
      const matchesType = selectedType === 'All' || q.type === selectedType;
      const matchesDifficulty = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;

      return matchesSearch && matchesSubject && matchesType && matchesDifficulty;
    });
  }, [questions, searchQuery, selectedSubject, selectedType, selectedDifficulty]);

  // Statistics
  const stats = useMemo(() => {
    const total = questions.length;
    const coding = questions.filter((q) => q.type === 'coding').length;
    const mcq = questions.filter((q) => q.type === 'mcq_single' || q.type === 'mcq_multi').length;
    const subjective = questions.filter((q) => q.type === 'short_answer' || q.type === 'blanks').length;
    return { total, coding, mcq, subjective };
  }, [questions]);

  // Duplicate Handler
  const handleDuplicate = (id) => {
    const copied = duplicateQuestion(id);
    if (copied) {
      showToast(`Duplicated "${copied.title}"`, 'success');
    }
  };

  // Delete Handler
  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      deleteQuestion(deleteConfirmId);
      setDeleteConfirmId(null);
      showToast('Question removed from repository.', 'info');
    }
  };

  // File Upload Handler (Import JSON)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        const res = importQuestions(parsed);
        if (res.count > 0) {
          showToast(`Successfully imported ${res.count} questions.`, 'success');
          setShowImportModal(false);
        } else {
          showToast('No valid questions found in uploaded file.', 'error');
        }
      } catch (err) {
        showToast('Invalid JSON file format.', 'error');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSubject('All');
    setSelectedType('All');
    setSelectedDifficulty('All');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedSubject !== 'All' ||
    selectedType !== 'All' ||
    selectedDifficulty !== 'All';

  return (
    <div className="questions-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`questions-toast toast-${toastMessage.type}`} role="status">
          <div className="toast-content">
            <CheckIcon size={15} />
            <span>{toastMessage.message}</span>
          </div>
          <button
            type="button"
            className="toast-close"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss"
          >
            <XIcon size={14} />
          </button>
        </div>
      )}

      {/* Header & Actions */}
      <section className="questions-header-strip">
        <div className="questions-header-info">
          <h1 className="questions-page-title">Question Bank</h1>
          <p className="questions-page-sub">
            Author, categorize and manage assessment problems for laboratory examinations
          </p>
        </div>
        <div className="questions-header-actions">
          <Button variant="outline" size="sm" icon={DownloadIcon} onClick={exportQuestions} title="Download repository as JSON">
            Export JSON
          </Button>
          <Button variant="outline" size="sm" icon={UploadIcon} onClick={() => setShowImportModal(true)} title="Import questions from file">
            Import
          </Button>
          <Button variant="primary" size="sm" icon={PlusCircleIcon} onClick={() => setAuthoringQuestion({})}>
            New Question
          </Button>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="questions-stats-bar" aria-label="Question Bank Statistics">
        <div className="stat-unit">
          <span className="stat-unit-label">Total Questions</span>
          <span className="stat-unit-val">{stats.total}</span>
          <span className="stat-unit-sub">in local repository</span>
        </div>
        <div className="stat-unit-sep" />
        <div className="stat-unit">
          <span className="stat-unit-label">Coding Problems</span>
          <span className="stat-unit-val">{stats.coding}</span>
          <span className="stat-unit-sub">with test cases</span>
        </div>
        <div className="stat-unit-sep" />
        <div className="stat-unit">
          <span className="stat-unit-label">Objective MCQs</span>
          <span className="stat-unit-val">{stats.mcq}</span>
          <span className="stat-unit-sub">single &amp; multi-correct</span>
        </div>
        <div className="stat-unit-sep" />
        <div className="stat-unit">
          <span className="stat-unit-label">Subjective &amp; Blanks</span>
          <span className="stat-unit-val">{stats.subjective}</span>
          <span className="stat-unit-sub">fill-in &amp; definitions</span>
        </div>
      </section>

      {/* Filter Toolbar */}
      <section className="questions-filter-toolbar">
        {/* Search */}
        <div className="toolbar-search-wrap">
          <span className="toolbar-search-icon"><SearchIcon size={14} /></span>
          <input
            type="text"
            className="toolbar-search-input"
            placeholder="Search by title, topic, or problem keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="toolbar-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
              <XIcon size={13} />
            </button>
          )}
        </div>
        {/* Filters Group */}
        <div className="toolbar-selects-group">
          {/* Subject */}
          <select className="toolbar-select" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} aria-label="Filter by Subject">
            <option value="All">All Subjects</option>
            {SUBJECT_OPTIONS.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
          {/* Type */}
          <select className="toolbar-select" value={selectedType} onChange={(e) => setSelectedType(e.target.value)} aria-label="Filter by Question Type">
            <option value="All">All Types</option>
            {QUESTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {/* Difficulty */}
          <select className="toolbar-select" value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)} aria-label="Filter by Difficulty">
            <option value="All">All Difficulties</option>
            {DIFFICULTY_LEVELS.map((diff) => (
              <option key={diff} value={diff}>{diff}</option>
            ))}
          </select>
          {hasActiveFilters && (
            <button type="button" className="toolbar-reset-btn" onClick={handleResetFilters}>Clear Filters</button>
          )}
        </div>
      </section>

      {/* Results Counter */}
      <div className="questions-count-line">
        <span>
          Showing <strong>{filteredQuestions.length}</strong> of <strong>{questions.length}</strong> questions
        </span>
      </div>

      {/* Questions Table */}
      <section className="questions-table-wrap">
        {filteredQuestions.length > 0 ? (
          <table className="questions-table">
            <thead>
              <tr>
                <th style={{ width: '38%' }}>Question</th>
                <th style={{ width: '22%' }}>Subject &amp; Topic</th>
                <th style={{ width: '12%' }}>Type</th>
                <th style={{ width: '10%' }}>Difficulty</th>
                <th style={{ width: '8%' }}>Marks</th>
                <th style={{ width: '10%' }} className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.map((q) => {
                const typeObj = QUESTION_TYPES.find((t) => t.value === q.type);
                const typeLabel = typeObj ? typeObj.label.split('(')[0].trim() : q.type;
                return (
                  <tr key={q.id}>
                    <td>
                      <div className="q-table-info">
                        <span className="q-table-title">{q.title}</span>
                        <p className="q-table-snippet">
                          {q.statement.length > 95 ? `${q.statement.slice(0, 95)}...` : q.statement}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="q-table-subject-box">
                        <span className="q-table-subject">{q.subject}</span>
                        <span className="q-table-topic">{q.topic}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`q-type-badge type-${q.type}`}>{typeLabel}</span>
                    </td>
                    <td>
                      <span className={`q-difficulty-pill diff-${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                    </td>
                    <td>
                      <div className="q-table-marks">
                        <span className="marks-val">{q.marks} pts</span>
                        {q.negativeMarks > 0 && (<span className="neg-marks-val">(-{q.negativeMarks})</span>)}
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="q-row-actions">
                        <button type="button" className="q-icon-btn" title="Preview Student View" onClick={() => setPreviewQuestion(q)}><EyeIcon size={14} /></button>
                        <button type="button" className="q-icon-btn" title="Edit Question" onClick={() => setAuthoringQuestion(q)}><EditIcon size={14} /></button>
                        <button type="button" className="q-icon-btn" title="Duplicate Question" onClick={() => handleDuplicate(q.id)}><CopyIcon size={14} /></button>
                        <button type="button" className="q-icon-btn text-danger" title="Delete Question" onClick={() => setDeleteConfirmId(q.id)}><TrashIcon size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="questions-empty-block">
            <QuestionsIcon size={24} className="empty-icon" />
            <h3 className="empty-heading">No questions found</h3>
            <p className="empty-text">
              {hasActiveFilters ? 'No questions match your current search and filter settings.' : 'Your question repository is currently empty.'}
            </p>
            {hasActiveFilters ? (
              <Button variant="secondary" size="sm" onClick={handleResetFilters}>Clear All Filters</Button>
            ) : (
              <Button variant="primary" size="sm" icon={PlusCircleIcon} onClick={() => setAuthoringQuestion({})}>Create First Question</Button>
            )}
          </div>
        )}
      </section>

      {/* Preview Modal */}
      {previewQuestion && (
        <div className="modal-backdrop" onClick={() => setPreviewQuestion(null)}>
          <div className="modal-dialog preview-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="modal-header">
              <div className="preview-header-meta">
                <span className="preview-label">Student Terminal View Simulation</span>
                <h3 className="modal-title">{previewQuestion.title}</h3>
                <div className="preview-meta-chips">
                  <span className="chip-subject">{previewQuestion.subject}</span>
                  <span className="chip-sep">•</span>
                  <span className="chip-topic">{previewQuestion.topic}</span>
                  <span className="chip-sep">•</span>
                  <span className={`q-difficulty-pill diff-${previewQuestion.difficulty.toLowerCase()}`}>{previewQuestion.difficulty}</span>
                  <span className="chip-sep">•</span>
                  <span className="chip-marks">{previewQuestion.marks} Marks</span>
                </div>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setPreviewQuestion(null)} aria-label="Close">
                <XIcon size={16} />
              </button>
            </div>
            <div className="preview-body">
              {/* Question Statement */}
              <div className="preview-statement-box">
                <p className="preview-statement-text">{previewQuestion.statement}</p>
              </div>
              {/* MCQ Preview */}
              {(previewQuestion.type === 'mcq_single' || previewQuestion.type === 'mcq_multi') && (
                <div className="preview-interactive-section">
                  <span className="interactive-title">Options ({previewQuestion.type === 'mcq_single' ? 'Single Choice' : 'Multiple Select'}):</span>
                  <div className="preview-options-list">
                    {previewQuestion.options?.map((opt, idx) => (
                      <div key={opt.id || idx} className={`preview-option-item ${opt.isCorrect ? 'correct-highlight' : ''}`}>
                        <span className="option-marker">{String.fromCharCode(65 + idx)}</span>
                        <span className="option-text">{opt.text}</span>
                        {opt.isCorrect && (<span className="correct-tag">Correct Answer</span>)}
                      </div>
                    ))}
                  </div>
                  {previewQuestion.explanation && (
                    <div className="preview-explanation-box"><strong>Solution Explanation:</strong> {previewQuestion.explanation}</div>
                  )}
                </div>
              )}
              {/* Coding Preview */}
              {previewQuestion.type === 'coding' && (
                <div className="preview-interactive-section">
                  {previewQuestion.constraints && (
                    <div className="preview-constraints-box">
                      <span className="constraints-label">Constraints:</span>
                      <pre className="constraints-text">{previewQuestion.constraints}</pre>
                    </div>
                  )}
                  <div className="preview-testcases-box">
                    <span className="interactive-title">Evaluation Test Cases:</span>
                    <div className="testcases-list">
                      {previewQuestion.testCases?.map((tc, idx) => (
                        <div key={tc.id || idx} className="testcase-card">
                          <div className="tc-header">
                            <span className="tc-num">Test Case #{idx + 1}</span>
                            {tc.isHidden && (<span className="tc-hidden-badge">Hidden Test Case</span>)}
                          </div>
                          <div className="tc-grid">
                            <div><span className="tc-sub">Input:</span><code>{tc.input}</code></div>
                            <div><span className="tc-sub">Expected Output:</span><code>{tc.expectedOutput}</code></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* Fill in Blanks Preview */}
              {previewQuestion.type === 'blanks' && (
                <div className="preview-interactive-section">
                  <span className="interactive-title">Candidate Terminal Input:</span>
                  <div className="preview-blank-sim">
                    <input type="text" className="sim-blank-input" placeholder="Student enters answer here..." disabled />
                    <div className="acceptable-answers-note"><strong>Accepted Variations:</strong> {previewQuestion.acceptableAnswers?.join(', ') || 'N/A'}</div>
                  </div>
                </div>
              )}
              {/* Short Answer Preview */}
              {previewQuestion.type === 'short_answer' && (
                <div className="preview-interactive-section">
                  <span className="interactive-title">Evaluation Model Answer:</span>
                  <div className="preview-model-answer">{previewQuestion.modelAnswer || 'No model answer provided.'}</div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <Button variant="secondary" size="sm" onClick={() => setPreviewQuestion(null)}>Close Preview</Button>
            </div>
          </div>
        </div>
      )}

      {/* Authoring Modal */}
      {authoringQuestion && (
        <QuestionAuthoringModal
          initialQuestion={authoringQuestion}
          onClose={() => setAuthoringQuestion(null)}
          onSave={(data) => {
            if (authoringQuestion.id) {
              updateQuestion(authoringQuestion.id, data);
              showToast(`Updated "${data.title}"`, 'success');
            } else {
              addQuestion(data);
              showToast(`Created question "${data.title}"`, 'success');
            }
            setAuthoringQuestion(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-dialog delete-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="modal-header">
              <h3 className="modal-title">Delete Question</h3>
              <button type="button" className="modal-close-btn" onClick={() => setDeleteConfirmId(null)}>
                <XIcon size={16} />
              </button>
            </div>
            <div className="modal-body-padding">
              <p className="delete-warning-text">Are you sure you want to delete this question? It will be removed from your Question Bank and will not be available when composing new exams.</p>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" size="sm" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={handleConfirmDelete}>Delete Question</Button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-backdrop" onClick={() => setShowImportModal(false)}>
          <div className="modal-dialog import-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="modal-header">
              <h3 className="modal-title">Import Question Repository</h3>
              <button type="button" className="modal-close-btn" onClick={() => setShowImportModal(false)}>
                <XIcon size={16} />
              </button>
            </div>
            <div className="modal-body-padding import-body">
              <p className="import-desc">Upload a JSON question file formatted for the ExamLAN portal to bulk-import assessment items into your active Question Bank.</p>
              <div className="import-drop-zone" onClick={() => fileInputRef.current?.click()}>
                <UploadIcon size={24} className="import-drop-icon" />
                <span className="drop-title">Click to upload JSON file</span>
                <span className="drop-sub">Formatted ExamLAN repository array (.json)</span>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".json" onChange={handleFileUpload} />
              </div>
              <div className="import-template-row">
                <span className="template-note">Need sample data?</span>
                <button type="button" className="import-reset-link" onClick={() => { resetToDefaults(); setShowImportModal(false); showToast('Question bank reset to institutional defaults.', 'info'); }}>
                  Reset repository to institutional defaults
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" size="sm" onClick={() => setShowImportModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponent: Question Authoring Modal (Add / Edit)
const QuestionAuthoringModal = ({ initialQuestion, onClose, onSave }) => {
  const isEditing = !!initialQuestion.id;

  const [title, setTitle] = useState(initialQuestion.title || '');
  const [subject, setSubject] = useState(initialQuestion.subject || SUBJECT_OPTIONS[0]);
  const [topic, setTopic] = useState(initialQuestion.topic || '');
  const [type, setType] = useState(initialQuestion.type || 'mcq_single');
  const [difficulty, setDifficulty] = useState(initialQuestion.difficulty || 'Medium');
  const [marks, setMarks] = useState(initialQuestion.marks || 5);
  const [negativeMarks, setNegativeMarks] = useState(initialQuestion.negativeMarks || 0);
  const [statement, setStatement] = useState(initialQuestion.statement || '');

  // MCQ Options State
  const [options, setOptions] = useState(
    initialQuestion.options || [
      { id: 'opt-1', text: '', isCorrect: true },
      { id: 'opt-2', text: '', isCorrect: false },
      { id: 'opt-3', text: '', isCorrect: false },
      { id: 'opt-4', text: '', isCorrect: false },
    ]
  );
  const [explanation, setExplanation] = useState(initialQuestion.explanation || '');

  // Coding State
  const [constraints, setConstraints] = useState(initialQuestion.constraints || '');
  const [testCases, setTestCases] = useState(
    initialQuestion.testCases || [
      { id: 'tc-1', input: '', expectedOutput: '', isHidden: false },
    ]
  );

  // Fill in Blanks State
  const [acceptableAnswersText, setAcceptableAnswersText] = useState(
    (initialQuestion.acceptableAnswers || []).join(', ')
  );

  // Short Answer State
  const [modelAnswer, setModelAnswer] = useState(initialQuestion.modelAnswer || '');

  const [formError, setFormError] = useState('');

  // Handlers omitted for brevity – unchanged
  // ... (the rest of the file remains unchanged)
};
