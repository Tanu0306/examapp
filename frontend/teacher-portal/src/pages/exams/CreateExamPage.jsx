import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import {
  CheckIcon,
  XIcon,
  SearchIcon,
  PlusCircleIcon,
  EditIcon,
  TrashIcon,
} from '../../components/common/Icons';
import { useQuestionBank } from '../../context/QuestionBankContext';
import { useExams } from '../../context/ExamContext';
import { toast } from '../../utils/toast';
import './CreateExamPage.css';

// ─── Constants ────────────────────────────────────────────────────────────────

const mockLabs = [
  { value: 'lab-1', label: 'Lab 1 – Computer Science' },
  { value: 'lab-2', label: 'Lab 2 – Electronics' },
  { value: 'lab-3', label: 'Lab 3 – Mechanical' },
];

// ── Extensibility: add new question types here as the app grows.
// Each entry needs a matching form block inside DirectMCQForm's conditional render.
// Example future types (uncomment + build a matching form component to enable):
//   { value: 'true_false',   label: 'True / False' },
//   { value: 'short_answer', label: 'Short Answer' },
//   { value: 'coding',       label: 'Coding / Programming' },
const MCQ_TYPES = [
  { value: 'mcq_single', label: 'Single Correct MCQ' },
  { value: 'mcq_multi',  label: 'Multiple Correct MCQ' },
];

const TYPE_LABELS = {
  mcq_single: 'Single Correct',
  mcq_multi:  'Multiple Correct',
};

// ─── Utilities ────────────────────────────────────────────────────────────────

const genId    = () => `cep-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const genOptId = () => `opt-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;

const defaultOptions = () => [
  { id: genOptId(), text: '', isCorrect: true  },
  { id: genOptId(), text: '', isCorrect: false },
  { id: genOptId(), text: '', isCorrect: false },
  { id: genOptId(), text: '', isCorrect: false },
];

// ─── Question Bank Modal ──────────────────────────────────────────────────────

const QuestionBankModal = ({ allQuestions, folders, alreadyAddedBankIds, onClose, onAdd }) => {
  const [search,          setSearch]          = useState('');
  const [filterType,      setFilterType]      = useState('');
  const [folderId,        setFolderId]        = useState('');
  const [selected,        setSelected]        = useState(new Set());

  // Only MCQ questions are relevant for Create Exam
  const mcqOnly = useMemo(
    () => allQuestions.filter(q => q.type === 'mcq_single' || q.type === 'mcq_multi'),
    [allQuestions]
  );

  const folderQuestions = useMemo(
    () => mcqOnly.filter(question => (question.folderIds || []).includes(folderId)),
    [mcqOnly, folderId]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return folderQuestions.filter(question => {
      if (alreadyAddedBankIds.has(question.id)) return false;
      if (filterType       && question.type       !== filterType)       return false;
      if (q &&
        !question.title.toLowerCase().includes(q) &&
        !(question.statement || '').toLowerCase().includes(q)
      ) return false;
      return true;
    });
  }, [folderQuestions, search, filterType, alreadyAddedBankIds]);

  const toggle = (id) => {
    if (alreadyAddedBankIds.has(id)) return;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedMarks = useMemo(
    () => folderQuestions
      .filter(q => selected.has(q.id))
      .reduce((s, q) => s + (Number(q.marks) || 0), 0),
    [folderQuestions, selected]
  );

  const handleAdd = () => {
    const toAdd = [...selected]
      .map(id => folderQuestions.find(q => q.id === id))
      .filter(Boolean);
    onAdd(toAdd);
  };

  const handleAddEntireFolder = () => {
    onAdd(folderQuestions.filter(question => !alreadyAddedBankIds.has(question.id)));
  };

  return (
    <div className="cep-modal-backdrop" onClick={onClose}>
      <div className="cep-modal-dialog cep-bank-dialog" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="cep-modal-header">
          <div className="cep-modal-header-info">
            <h3 className="cep-modal-title">Question Bank</h3>
            <p className="cep-modal-sub">Import a whole folder or choose individual questions</p>
          </div>
          <button className="cep-modal-close" onClick={onClose} type="button">
            <XIcon size={16} />
          </button>
        </div>

        {/* Filters */}
        <div className="cep-bank-filters">
          <select
            className="cep-filter-select cep-folder-select"
            value={folderId}
            onChange={event => { setFolderId(event.target.value); setSelected(new Set()); }}
            aria-label="Choose question folder"
          >
            <option value="">Choose a folder…</option>
            {folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
          </select>
          <div className="cep-search-wrap">
            <SearchIcon size={13} className="cep-search-icon" />
            <input
              className="cep-search-input"
              placeholder="Search questions…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="cep-search-clear" onClick={() => setSearch('')} type="button">
                <XIcon size={12} />
              </button>
            )}
          </div>
          <select className="cep-filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            {MCQ_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {/* Question list */}
        <div className="cep-bank-list">
          {!folderId ? (
            <div className="cep-bank-empty">
              {folders.length === 0 ? 'Create a folder and add questions to your Question Bank first.' : 'Choose a folder to see its questions.'}
            </div>
          ) : filtered.length === 0 ? (
            <div className="cep-bank-empty">
              {folderQuestions.length === 0
                ? 'This folder has no MCQ questions.'
                : 'No questions available for these filters. Questions already in this exam are excluded.'}
            </div>
          ) : (
            filtered.map(q => {
              const isDupe     = alreadyAddedBankIds.has(q.id);
              const isSel      = selected.has(q.id);
              return (
                <label
                  key={q.id}
                  className={`cep-bank-item${isSel ? ' is-selected' : ''}${isDupe ? ' is-duplicate' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="cep-bank-checkbox"
                    checked={isSel || isDupe}
                    disabled={isDupe}
                    onChange={() => toggle(q.id)}
                  />
                  <div className="cep-bank-item-info">
                    <span className="cep-bank-item-title">{q.title}</span>
                    {q.statement && (
                      <span className="cep-bank-item-statement">
                        {q.statement.length > 110 ? q.statement.slice(0, 110) + '…' : q.statement}
                      </span>
                    )}
                    <div className="cep-bank-item-meta">
                      <span className={`cep-type-badge type-${q.type}`}>{TYPE_LABELS[q.type]}</span>
                      <span className="cep-marks-chip">{q.marks} pts</span>
                    </div>
                  </div>
                  {isDupe && <span className="cep-duplicate-tag">Already added</span>}
                </label>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="cep-modal-footer">
          <div className="cep-bank-footer-info">
            {!folderId
              ? 'Choose a folder to import questions'
              : selected.size > 0
              ? `${selected.size} selected · ${selectedMarks} pts`
              : `${filtered.length} question${filtered.length !== 1 ? 's' : ''} shown`}
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!folderId || folderQuestions.every(question => alreadyAddedBankIds.has(question.id))}
            onClick={handleAddEntireFolder}
          >
            Add Entire Folder ({folderQuestions.filter(question => !alreadyAddedBankIds.has(question.id)).length})
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!folderId || selected.size === 0}
            onClick={handleAdd}
          >
            Add Selected ({selected.size})
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Shared MCQ Fields (used in both DirectMCQForm and EditMCQModal) ──────────

const MCQFields = ({ qType, statement, onStatementChange, options, onOptionsChange, marks, onMarksChange, explanation, onExplanationChange, namePrefix }) => {
  const updateText = (id, text) =>
    onOptionsChange(prev => prev.map(o => o.id === id ? { ...o, text } : o));

  const setSingle = (id) =>
    onOptionsChange(prev => prev.map(o => ({ ...o, isCorrect: o.id === id })));

  const toggleMulti = (id) =>
    onOptionsChange(prev => prev.map(o => o.id === id ? { ...o, isCorrect: !o.isCorrect } : o));

  const addOption = () => {
    if (options.length >= 8) return;
    onOptionsChange(prev => [...prev, { id: genOptId(), text: '', isCorrect: false }]);
  };

  const removeOption = (id, setErr) => {
    if (options.length <= 2) { setErr('At least 2 options are required.'); return; }
    const remaining = options.filter(o => o.id !== id);
    if (!remaining.some(o => o.isCorrect)) remaining[0].isCorrect = true;
    onOptionsChange(() => remaining);
  };

  return (
    <>
      {/* Statement */}
      <div className="cep-form-row">
        <label className="cep-form-label">Question Text <span className="req">*</span></label>
        <textarea
          className="cep-form-textarea"
          rows={3}
          value={statement}
          onChange={e => onStatementChange(e.target.value)}
          placeholder="Enter the full question statement…"
        />
      </div>

      {/* Options */}
      <div className="cep-form-row">
        <label className="cep-form-label">
          Options <span className="req">*</span>
          <span className="cep-hint">
            {qType === 'mcq_single'
              ? '— select the one correct answer'
              : '— check all correct answers'}
          </span>
        </label>
        <div className="cep-options-list">
          {options.map((opt, idx) => (
            <div key={opt.id} className="cep-option-row">
              {qType === 'mcq_single' ? (
                <input
                  type="radio"
                  name={`${namePrefix}-correct`}
                  className="cep-option-radio"
                  checked={opt.isCorrect}
                  onChange={() => setSingle(opt.id)}
                  title="Mark as correct answer"
                />
              ) : (
                <input
                  type="checkbox"
                  className="cep-option-radio"
                  checked={opt.isCorrect}
                  onChange={() => toggleMulti(opt.id)}
                  title="Mark as correct answer"
                />
              )}
              <span className="cep-option-letter">{String.fromCharCode(65 + idx)}</span>
              <input
                className="cep-option-text"
                value={opt.text}
                onChange={e => updateText(opt.id, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + idx)}`}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  className="cep-option-remove"
                  onClick={() => removeOption(opt.id, () => {})}
                  title="Remove option"
                >
                  <XIcon size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
        {options.length < 8 && (
          <button type="button" className="cep-add-option-btn" onClick={addOption}>
            + Add Option
          </button>
        )}
      </div>

      {/* Marks + Explanation */}
      <div className="cep-form-row-two">
        <div className="cep-form-row">
          <label className="cep-form-label">Marks <span className="req">*</span></label>
          <input
            className="cep-form-input cep-marks-input"
            type="number"
            min="1"
            value={marks}
            onChange={e => onMarksChange(e.target.value)}
          />
        </div>
        <div className="cep-form-row">
          <label className="cep-form-label">
            Explanation <span className="cep-optional">(optional)</span>
          </label>
          <textarea
            className="cep-form-textarea"
            rows={2}
            value={explanation}
            onChange={e => onExplanationChange(e.target.value)}
            placeholder="Explain the correct answer (shown after review)…"
          />
        </div>
      </div>
    </>
  );
};

// ─── Validate MCQ ─────────────────────────────────────────────────────────────

const validateMCQ = (statement, options, qType, marks) => {
  if (!qType)                                      return 'Please select a question type.';
  if (!statement.trim())                           return 'Question text is required.';
  if (options.length < 2)                          return 'At least 2 options are required.';
  if (options.some(o => !o.text.trim()))           return 'All option fields must be filled in.';
  if (qType === 'mcq_single' && options.filter(o => o.isCorrect).length !== 1)
    return 'Single Correct MCQ must have exactly one correct answer.';
  if (qType === 'mcq_multi'  && options.filter(o => o.isCorrect).length < 2)
    return 'Multiple Correct MCQ must have at least two correct answers.';
  if (!marks || isNaN(marks) || Number(marks) <= 0)
    return 'Marks must be a positive number.';
  return null;
};

// ─── Direct MCQ Form ──────────────────────────────────────────────────────────

const DirectMCQForm = ({ onAdd }) => {
  const [qType,       setQType]       = useState('');
  const [statement,   setStatement]   = useState('');
  const [marks,       setMarks]       = useState(2);
  const [explanation, setExplanation] = useState('');
  const [options,     setOptions]     = useState(defaultOptions);
  const [error,       setError]       = useState('');

  const handleTypeChange = (newType) => {
    setQType(newType);
    setError('');
    if (newType === 'mcq_single') {
      const fi = options.findIndex(o => o.isCorrect);
      setOptions(prev => prev.map((o, i) => ({ ...o, isCorrect: i === (fi >= 0 ? fi : 0) })));
    }
  };

  const handleAdd = () => {
    setError('');
    const err = validateMCQ(statement, options, qType, marks);
    if (err) { setError(err); return; }

    const shortTitle = statement.trim().slice(0, 80) + (statement.trim().length > 80 ? '…' : '');
    onAdd({
      _examId:  genId(),
      _source:  'direct',
      id:       genId(),
      title:    shortTitle,
      statement: statement.trim(),
      type:     qType,
      marks:    Number(marks),
      options:  options.map(o => ({ ...o })),
      explanation: explanation.trim(),
      difficulty: 'Medium',
      subject:  '',
      topic:    '',
    });

    // Reset
    setStatement('');
    setMarks(2);
    setExplanation('');
    setOptions(defaultOptions());
    setError('');
    setQType('');
  };

  const isMCQ = qType === 'mcq_single' || qType === 'mcq_multi';

  return (
    <div className="cep-direct-form">
      {/* ── Question Type Dropdown: always visible at the top ── */}
      <div className="cep-form-row">
        <label className="cep-form-label">
          Question Type <span className="req">*</span>
        </label>
        <select
          className="cep-filter-select cep-type-select"
          value={qType}
          onChange={e => handleTypeChange(e.target.value)}
        >
          <option value="">Select question type…</option>
          {MCQ_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
          {/* Extensibility: To add new question types in the future:
              1. Add an entry to MCQ_TYPES (or QUESTION_TYPES) at the top
              2. Add a matching form component below (e.g. {qType === 'coding' && <CodingFields ... />})
          */}
        </select>
      </div>

      {/* ── Placeholder shown before selecting a question type ── */}
      {!qType ? (
        <div className="cep-type-placeholder">
          Please select a question type above to configure the question details and options.
        </div>
      ) : (
        <>
          {error && <div className="cep-form-error">{error}</div>}

          {/* ── MCQ Form Fields (Single Correct / Multiple Correct) ── */}
          {isMCQ && (
            <MCQFields
              qType={qType}
              statement={statement}
              onStatementChange={setStatement}
              options={options}
              onOptionsChange={setOptions}
              marks={marks}
              onMarksChange={setMarks}
              explanation={explanation}
              onExplanationChange={setExplanation}
              namePrefix="direct"
            />
          )}

          {/* Extensibility: Future question types go here, e.g.:
              {qType === 'true_false' && <TrueFalseFields ... />}
              {qType === 'coding' && <CodingFields ... />}
              {qType === 'short_answer' && <ShortAnswerFields ... />}
          */}

          <div className="cep-direct-actions">
            <Button variant="primary" size="sm" icon={PlusCircleIcon} onClick={handleAdd}>
              Add Question
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Edit MCQ Modal ───────────────────────────────────────────────────────────

const EditMCQModal = ({ question, onClose, onSave }) => {
  const [qType,       setQType]       = useState(question.type || 'mcq_single');
  const [statement,   setStatement]   = useState(question.statement || '');
  const [marks,       setMarks]       = useState(question.marks || 2);
  const [explanation, setExplanation] = useState(question.explanation || '');
  const [options,     setOptions]     = useState(
    question.options?.length >= 2
      ? question.options.map(o => ({ ...o }))
      : defaultOptions()
  );
  const [error, setError] = useState('');

  const handleTypeChange = (newType) => {
    setQType(newType);
    setError('');
    if (newType === 'mcq_single') {
      const fi = options.findIndex(o => o.isCorrect);
      setOptions(prev => prev.map((o, i) => ({ ...o, isCorrect: i === (fi >= 0 ? fi : 0) })));
    }
  };

  const handleSave = () => {
    setError('');
    const err = validateMCQ(statement, options, qType, marks);
    if (err) { setError(err); return; }

    onSave({
      ...question,
      type:      qType,
      statement: statement.trim(),
      title:     statement.trim().slice(0, 80) + (statement.trim().length > 80 ? '…' : ''),
      marks:     Number(marks),
      options:   options.map(o => ({ ...o })),
      explanation: explanation.trim(),
    });
  };

  return (
    <div className="cep-modal-backdrop" onClick={onClose}>
      <div className="cep-modal-dialog cep-edit-dialog" onClick={e => e.stopPropagation()}>
        <div className="cep-modal-header">
          <h3 className="cep-modal-title">Edit Question</h3>
          <button className="cep-modal-close" onClick={onClose} type="button">
            <XIcon size={16} />
          </button>
        </div>

        <div className="cep-edit-body">
          {error && <div className="cep-form-error">{error}</div>}

          {/* Question Type selector */}
          <div className="cep-form-row">
            <label className="cep-form-label">Question Type <span className="req">*</span></label>
            <select
              className="cep-filter-select cep-type-select"
              value={qType}
              onChange={e => handleTypeChange(e.target.value)}
            >
              {MCQ_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <MCQFields
            qType={qType}
            statement={statement}
            onStatementChange={setStatement}
            options={options}
            onOptionsChange={setOptions}
            marks={marks}
            onMarksChange={setMarks}
            explanation={explanation}
            onExplanationChange={setExplanation}
            namePrefix="edit"
          />
        </div>

        <div className="cep-modal-footer">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const CreateExamPage = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const isEditingExam = Boolean(examId);
  const { questions: bankQuestions, folders: bankFolders } = useQuestionBank();
  const { addExam, updateExam, getExam } = useExams();
  const [isLoadingExam, setIsLoadingExam] = useState(isEditingExam);
  const [isSaving, setIsSaving] = useState(false);
  const [publishedLink, setPublishedLink] = useState('');

  // ── Exam metadata ──
  const [title,              setTitle]              = useState('');
  const [subject,            setSubject]            = useState('');
  const [course,             setCourse]             = useState('');
  const [instructions,       setInstructions]       = useState('');
  const [duration,           setDuration]           = useState(60);
  const [lab,                setLab]                = useState(mockLabs[0].value);
  const [batch,              setBatch]              = useState('');
  const [allowTabSwitch,     setAllowTabSwitch]     = useState(false);
  const [enableAudioMonitor, setEnableAudioMonitor] = useState(false);

  // ── Questions ──
  const [examQuestions,  setExamQuestions]  = useState([]);
  const [showBankModal,  setShowBankModal]  = useState(false);
  const [editingQ,       setEditingQ]       = useState(null);

  useEffect(() => {
    if (!examId) return undefined;
    let cancelled = false;
    setIsLoadingExam(true);
    getExam(examId)
      .then((exam) => {
        if (cancelled) return;
        setTitle(exam.title || '');
        if (exam.status === 'published') setPublishedLink(exam.joinUrl || '');
        setSubject(exam.subject || '');
        setCourse(exam.course || '');
        setInstructions(exam.instructions || '');
        setDuration(Number(exam.duration) || 60);
        setLab(exam.lab || mockLabs[0].value);
        setBatch(exam.batch || '');
        setAllowTabSwitch(Boolean(exam.security?.allowTabSwitch));
        setEnableAudioMonitor(Boolean(exam.security?.enableAudioMonitor));
        setExamQuestions((exam.questions || []).map((question) => ({
          ...question,
          _examId: question._examId || genId(),
          _source: question._source || 'direct',
        })));
      })
      .catch((requestError) => {
        if (!cancelled) {
          toast.error(requestError.message);
          navigate('/exams');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingExam(false);
      });
    return () => { cancelled = true; };
  }, [examId, getExam, navigate]);

  // IDs of bank questions already in the exam (duplicate guard)
  const alreadyAddedBankIds = useMemo(
    () => new Set(
      examQuestions
        .filter(q => q._source === 'bank')
        .map(q => q._bankQuestionId)
    ),
    [examQuestions]
  );

  const totalMarks = useMemo(
    () => examQuestions.reduce((s, q) => s + (Number(q.marks) || 0), 0),
    [examQuestions]
  );

  // ── Handlers ──

  const handleBankAdd = (selectedQs) => {
    const snapshots = selectedQs.map(q => ({
      ...q,
      _examId:          genId(),
      _source:          'bank',
      _bankQuestionId:  q.id,
      id:               genId(), // unique copy id within the exam
    }));
    setExamQuestions(prev => [...prev, ...snapshots]);
    setShowBankModal(false);
    toast.success(`${snapshots.length} question${snapshots.length !== 1 ? 's' : ''} added from Question Bank`);
  };

  const handleDirectAdd = (q) => {
    setExamQuestions(prev => [...prev, q]);
    toast.success('Question added');
  };

  const handleRemove = (examId) => {
    setExamQuestions(prev => prev.filter(q => q._examId !== examId));
  };

  const moveQuestion = (examId, dir) => {
    setExamQuestions(prev => {
      const idx = prev.findIndex(q => q._examId === examId);
      if (idx < 0) return prev;
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const handleEditSave = (updated) => {
    setExamQuestions(prev => prev.map(q => q._examId === updated._examId ? updated : q));
    setEditingQ(null);
    toast.success('Question updated');
  };

  // ── Save / Publish ──

  const handleSave = async (publish = false) => {
    if (!title.trim())   { toast.error('Exam title is required');       return; }
    if (!subject.trim()) { toast.error('Subject is required');          return; }
    if (!Number.isFinite(Number(duration)) || Number(duration) <= 0) {
      toast.error('Duration must be greater than zero.');
      return;
    }

    if (publish && examQuestions.length === 0) {
      toast.error('Add at least one question before publishing.');
      return;
    }

    // Per-question validation
    for (let i = 0; i < examQuestions.length; i++) {
      const q = examQuestions[i];
      const label = `Question ${i + 1}`;
      if (!q.statement?.trim())                   { toast.error(`${label}: Question text is required.`);       return; }
      if (!q.options || q.options.length < 2)      { toast.error(`${label}: At least 2 options are required.`);return; }
      if (q.type === 'mcq_single' && q.options.filter(o => o.isCorrect).length !== 1)
        { toast.error(`${label}: Single Correct MCQ must have exactly one correct answer.`); return; }
      if (q.type === 'mcq_multi'  && q.options.filter(o => o.isCorrect).length < 2)
        { toast.error(`${label}: Multiple Correct MCQ must have at least two correct answers.`); return; }
      if (!q.marks || Number(q.marks) <= 0)        { toast.error(`${label}: Marks must be a positive number.`);return; }
    }

    const payload = {
      title:        title.trim(),
      subject:      subject.trim(),
      course,
      instructions,
      duration:     Number(duration),
      lab,
      batch,
      security:     { allowTabSwitch, enableAudioMonitor },
      questions:    examQuestions,
      totalMarks,
      status:       publish ? 'published' : 'draft',
    };

    setIsSaving(true);
    try {
      const savedExam = isEditingExam
        ? await updateExam(examId, payload)
        : await addExam(payload);
      if (publish) setPublishedLink(savedExam.joinUrl || '');
      toast.success(isEditingExam
        ? (publish ? 'Exam changes published.' : 'Draft changes saved.')
        : (publish ? 'Exam published!' : 'Draft saved to the database.'));
      if (!publish) setTimeout(() => navigate('/exams'), 800);
    } catch (requestError) {
      toast.error(requestError.message || 'Unable to save this exam.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render ──

  if (isLoadingExam) {
    return <div className="create-exam-page" role="status">Loading exam for editing…</div>;
  }

  return (
    <div className="create-exam-page">
      <h2 className="page-title">{isEditingExam ? 'Edit Examination' : 'Create New Exam'}</h2>

      {publishedLink && (
        <section className="cep-published-link" aria-live="polite">
          <div>
            <strong>Student link is ready</strong>
            <p>Share this link with students to open the exam details page.</p>
            <a href={publishedLink} target="_blank" rel="noreferrer">{publishedLink}</a>
          </div>
          <Button variant="primary" size="sm" onClick={async () => {
            try {
              await navigator.clipboard.writeText(publishedLink);
              toast.success('Student link copied.');
            } catch {
              toast.error('Could not copy the link. Select and copy it instead.');
            }
          }}>Copy Link</Button>
        </section>
      )}

      {/* ── Exam Details ── */}
      <section className="cep-section">
        <h3 className="cep-section-title">Exam Details</h3>
        <div className="cep-fields-grid">
          <div className="cep-field-full">
            <Input label="Exam Title" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <Input label="Subject" value={subject} onChange={e => setSubject(e.target.value)} required />
          <Input label="Course / Class" value={course} onChange={e => setCourse(e.target.value)} />
          <div className="cep-field-full">
            <div className="form-group">
              <label className="form-label">Instructions</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                placeholder="Enter exam instructions for students…"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Exam duration ── */}
      <section className="cep-section">
        <h3 className="cep-section-title">Exam Duration</h3>
        <p className="cep-section-description">Each student gets this full duration starting when their questions finish loading.</p>
        <div className="cep-fields-grid">
          <Input
            label="Duration (minutes)"
            type="number"
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
            required
          />
        </div>
      </section>

      {/* ── Lab & Batch ── */}
      <section className="cep-section">
        <h3 className="cep-section-title">Lab & Batch</h3>
        <div className="cep-fields-grid">
          <Select label="Lab" value={lab} onChange={e => setLab(e.target.value)} options={mockLabs} required />
          <Input label="Student Batch" value={batch} onChange={e => setBatch(e.target.value)} />
        </div>
      </section>

      {/* ── Security ── */}
      <section className="cep-section">
        <h3 className="cep-section-title">Security Settings</h3>
        <div className="cep-checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={allowTabSwitch}
              onChange={e => setAllowTabSwitch(e.target.checked)}
            />
            Allow Tab Switching (will be logged)
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={enableAudioMonitor}
              onChange={e => setEnableAudioMonitor(e.target.checked)}
            />
            Enable Audio Monitoring
          </label>
        </div>
      </section>

      {/* ── Add from Question Bank ── */}
      <section className="cep-section">
        <div className="cep-section-header-row">
          <div>
            <h3 className="cep-section-title">Add Questions from Question Bank</h3>
            <p className="cep-section-desc">
              Browse and select existing MCQ questions from your repository.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={SearchIcon}
            onClick={() => setShowBankModal(true)}
          >
            Browse Question Bank
          </Button>
        </div>
      </section>

      {/* ── Add Directly ── */}
      <section className="cep-section">
        <h3 className="cep-section-title">Add Question Directly</h3>
        <DirectMCQForm onAdd={handleDirectAdd} />
      </section>

      {/* ── Exam Questions List ── */}
      {examQuestions.length > 0 && (
        <section className="cep-section">
          <div className="cep-qlist-header">
            <h3 className="cep-section-title">
              Exam Questions
            </h3>
            <div className="cep-qlist-summary">
              {examQuestions.length} question{examQuestions.length !== 1 ? 's' : ''} &middot; {totalMarks} pts total
            </div>
          </div>

          <div className="cep-question-list">
            {examQuestions.map((q, idx) => (
              <div key={q._examId} className="cep-qcard">
                {/* Card top row */}
                <div className="cep-qcard-toprow">
                  <span className="cep-qcard-num">Q{idx + 1}</span>
                  <div className="cep-qcard-badges">
                    <span className={`cep-type-badge type-${q.type}`}>
                      {TYPE_LABELS[q.type]}
                    </span>
                    {q.difficulty && (
                      <span className={`cep-diff-pill diff-${(q.difficulty).toLowerCase()}`}>
                        {q.difficulty}
                      </span>
                    )}
                    {q._source === 'bank' && (
                      <span className="cep-source-tag">Bank</span>
                    )}
                  </div>
                  <span className="cep-qcard-marks">{q.marks} pts</span>
                  <div className="cep-qcard-actions">
                    <button
                      type="button"
                      className="cep-qcard-btn"
                      onClick={() => moveQuestion(q._examId, -1)}
                      disabled={idx === 0}
                      title="Move up"
                    >▲</button>
                    <button
                      type="button"
                      className="cep-qcard-btn"
                      onClick={() => moveQuestion(q._examId, 1)}
                      disabled={idx === examQuestions.length - 1}
                      title="Move down"
                    >▼</button>
                    <button
                      type="button"
                      className="cep-qcard-btn cep-btn-edit"
                      onClick={() => setEditingQ(q)}
                      title="Edit question"
                    >
                      <EditIcon size={13} />
                    </button>
                    <button
                      type="button"
                      className="cep-qcard-btn cep-btn-remove"
                      onClick={() => handleRemove(q._examId)}
                      title="Remove question"
                    >
                      <TrashIcon size={13} />
                    </button>
                  </div>
                </div>

                {/* Statement */}
                <p className="cep-qcard-statement">{q.statement}</p>

                {/* Options */}
                <div className="cep-qcard-options">
                  {q.options?.map((opt, oi) => (
                    <div
                      key={opt.id || oi}
                      className={`cep-qcard-option${opt.isCorrect ? ' is-correct' : ''}`}
                    >
                      <span className="cep-qcard-opt-letter">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="cep-qcard-opt-text">{opt.text}</span>
                      {opt.isCorrect && (
                        <span className="cep-correct-mark">✓</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="cep-qcard-explanation">
                    <span className="cep-explanation-label">Explanation:</span>{' '}
                    {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Action Buttons ── */}
      <div className="form-actions">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleSave(false)}
          icon={CheckIcon}
          isLoading={isSaving}
        >
          {isEditingExam ? 'Save Changes as Draft' : 'Save Draft'}
        </Button>
        <Button
          variant="primary"
          onClick={() => handleSave(true)}
          icon={CheckIcon}
          isLoading={isSaving}
        >
          Publish Exam
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/exams')}
          icon={XIcon}
        >
          Cancel
        </Button>
      </div>

      {/* ── Modals ── */}
      {showBankModal && (
        <QuestionBankModal
          allQuestions={bankQuestions}
          folders={bankFolders}
          alreadyAddedBankIds={alreadyAddedBankIds}
          onClose={() => setShowBankModal(false)}
          onAdd={handleBankAdd}
        />
      )}
      {editingQ && (
        <EditMCQModal
          question={editingQ}
          onClose={() => setEditingQ(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
};
