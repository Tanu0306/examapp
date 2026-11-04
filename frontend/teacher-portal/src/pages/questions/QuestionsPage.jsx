import { useState, useMemo, useRef } from 'react';
import { useQuestionBank } from '../../context/QuestionBankContext';
import { FolderCard } from '../../components/common/FolderCard';
import { FolderModal } from '../../components/common/FolderModal';
import { Button } from '../../components/common/Button';
import {
  QuestionsIcon,
  PlusCircleIcon,
  SearchIcon,
  CheckIcon,
  XIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  CopyIcon,
  DownloadIcon,
  UploadIcon,
  ChevronLeftIcon,
} from '../../components/common/Icons';
import {
  SUBJECT_OPTIONS,
  QUESTION_TYPES,
  DIFFICULTY_LEVELS,
} from '../../data/questionStore';
import './QuestionsPage.css';

// ─── Utility ──────────────────────────────────────────────────────────────────
const typeLabel = (type) => {
  if (type === 'mcq_single') return 'Multiple Choice';
  if (type === 'mcq_multi') return 'Multiple Choice';
  if (type === 'coding') return 'Coding';
  if (type === 'blanks') return 'Fill in Blanks';
  if (type === 'short_answer') return 'Short Answer';
  return type;
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const QuestionsPage = () => {
  const {
    questions,
    folders,
    addFolder,
    updateFolder,
    deleteFolder,
    selectedFolderId,
    setSelectedFolderId,
    questionsInFolder,
    unassignedQuestions,
    addQuestionToFolder,
    addExistingQuestionsToFolder,
    removeQuestionFromFolder,
    duplicateQuestion,
    exportQuestions,
    importQuestions,
    resetToDefaults,
    deleteQuestion,
    updateQuestion,
    getFolderById,
    foldersForQuestion,
  } = useQuestionBank();

  // ── UI state ────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [deleteFolderInfo, setDeleteFolderInfo] = useState(null);

  // Modals
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [addNewQOpen, setAddNewQOpen] = useState(false);
  const [addExistingOpen, setAddExistingOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [removeFolderConfirm, setRemoveFolderConfirm] = useState(null); // { questionId, folderId }
  const [showImportModal, setShowImportModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fileInputRef = useRef(null);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ── Derived data ────────────────────────────────────────────────────────────
  const currentFolder = selectedFolderId ? getFolderById(selectedFolderId) : null;
  const folderQuestions = selectedFolderId ? questionsInFolder(selectedFolderId) : [];
  const unassigned = unassignedQuestions();

  const stats = useMemo(() => ({
    total: questions.length,
    mcq: questions.filter((q) => q.type === 'mcq_single' || q.type === 'mcq_multi').length,
    coding: questions.filter((q) => q.type === 'coding').length,
    subjective: questions.filter((q) => q.type === 'short_answer' || q.type === 'blanks').length,
  }), [questions]);

  // Global search across all questions
  const globalSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return questions.filter(
      (question) =>
        question.title.toLowerCase().includes(q) ||
        question.statement.toLowerCase().includes(q) ||
        (question.topic && question.topic.toLowerCase().includes(q))
    );
  }, [questions, searchQuery]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        const res = importQuestions(parsed);
        if (res.count > 0) {
          showToast(`Imported ${res.count} questions.`, 'success');
          setShowImportModal(false);
        } else {
          showToast('No valid questions found in file.', 'error');
        }
      } catch {
        showToast('Invalid JSON file.', 'error');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleDeleteQuestion = () => {
    if (deleteConfirmId) {
      deleteQuestion(deleteConfirmId);
      setDeleteConfirmId(null);
      showToast('Question deleted from repository.', 'info');
    }
  };

  const handleRemoveFromFolder = () => {
    if (removeFolderConfirm) {
      removeQuestionFromFolder(removeFolderConfirm.questionId, removeFolderConfirm.folderId);
      setRemoveFolderConfirm(null);
      showToast('Question removed from folder.', 'info');
    }
  };

  const handleDuplicate = (id) => {
    const copy = duplicateQuestion(id);
    if (copy) showToast(`Duplicated "${copy.title}"`, 'success');
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="questions-page">

      {/* Toast */}
      {toastMessage && (
        <div className={`questions-toast toast-${toastMessage.type}`}>
          <div className="toast-content">
            <CheckIcon size={14} />
            <span>{toastMessage.message}</span>
          </div>
          <button className="toast-close" onClick={() => setToastMessage(null)}>
            <XIcon size={13} />
          </button>
        </div>
      )}

      {/* ── 1. Header ───────────────────────────────────────────────────── */}
      <section className="questions-header-strip">
        <div className="questions-header-info">
          <h1 className="questions-page-title">Question Bank</h1>
          <p className="questions-page-sub">
            Author, categorise and manage MCQ assessment questions organised in folders.
          </p>
        </div>
        <div className="questions-header-actions">
          <Button variant="outline" size="sm" icon={DownloadIcon} onClick={exportQuestions}>
            Export JSON
          </Button>
          <Button variant="outline" size="sm" icon={UploadIcon} onClick={() => setShowImportModal(true)}>
            Import
          </Button>
        </div>
      </section>

      {/* Stats bar */}
      <section className="questions-stats-bar">
        <div className="stat-unit">
          <span className="stat-unit-label">Total Questions</span>
          <span className="stat-unit-val">{stats.total}</span>
          <span className="stat-unit-sub">in local repository</span>
        </div>
        <div className="stat-unit-sep" />
        <div className="stat-unit">
          <span className="stat-unit-label">Objective MCQs</span>
          <span className="stat-unit-val">{stats.mcq}</span>
          <span className="stat-unit-sub">single &amp; multi-correct</span>
        </div>
        <div className="stat-unit-sep" />
        <div className="stat-unit">
          <span className="stat-unit-label">Coding Problems</span>
          <span className="stat-unit-val">{stats.coding}</span>
          <span className="stat-unit-sub">with test cases</span>
        </div>
        <div className="stat-unit-sep" />
        <div className="stat-unit">
          <span className="stat-unit-label">Folders</span>
          <span className="stat-unit-val">{folders.length}</span>
          <span className="stat-unit-sub">question groups</span>
        </div>
      </section>

      {/* ── 2. Search Bar ───────────────────────────────────────────────── */}
      <div className="toolbar-search-wrap" style={{ maxWidth: 520 }}>
        <span className="toolbar-search-icon"><SearchIcon size={14} /></span>
        <input
          type="text"
          className="toolbar-search-input"
          placeholder="Search questions across all folders…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="toolbar-search-clear" onClick={() => setSearchQuery('')}>
            <XIcon size={13} />
          </button>
        )}
      </div>

      {/* ── Global search results ───────────────────────────────────────── */}
      {globalSearchResults && (
        <section className="questions-table-wrap">
          <div className="folder-view-header" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {globalSearchResults.length} result{globalSearchResults.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
            </span>
          </div>
          {globalSearchResults.length === 0 ? (
            <div className="questions-empty-block">
              <QuestionsIcon size={22} className="empty-icon" />
              <h3 className="empty-heading">No questions match your search</h3>
            </div>
          ) : (
            <QuestionsTable
              questions={globalSearchResults}
              foldersForQuestion={foldersForQuestion}
              onPreview={setPreviewQuestion}
              onEdit={(q) => setEditingQuestion(q)}
              onDuplicate={handleDuplicate}
              onDelete={(id) => setDeleteConfirmId(id)}
              showFolderCol
            />
          )}
        </section>
      )}

      {/* ── 3. Folder Management (hidden during search) ─────────────────── */}
      {!globalSearchResults && (
        <>
          {!selectedFolderId ? (
            /* ── Folder Grid View ─────────────────────────────────────── */
            <section className="folder-section">
              <div className="folder-section-header">
                <h2 className="folder-section-title">Folders</h2>
                <Button
                  variant="primary"
                  size="sm"
                  icon={PlusCircleIcon}
                  onClick={() => { setEditingFolder(null); setShowFolderModal(true); }}
                >
                  Create Folder
                </Button>
              </div>

              {folders.length === 0 ? (
                <div className="folder-empty-state">
                  <span style={{ fontSize: '2rem' }}>📁</span>
                  <p>No folders yet. Create a folder to organise your questions.</p>
                </div>
              ) : (
                <div className="folder-grid">
                  {folders.map((folder) => (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      questionCount={questionsInFolder(folder.id).length}
                      isSelected={false}
                      onSelect={(id) => setSelectedFolderId(id)}
                      onEdit={(f) => { setEditingFolder(f); setShowFolderModal(true); }}
                      onDelete={(f) => setDeleteFolderInfo(f)}
                    />
                  ))}
                </div>
              )}

              {/* Unassigned questions */}
              {unassigned.length > 0 && (
                <div className="unassigned-section">
                  <h3 className="unassigned-title">
                    Unassigned Questions
                    <span className="unassigned-badge">{unassigned.length}</span>
                  </h3>
                  <p className="unassigned-desc">
                    These questions exist in the repository but are not in any folder. Open a folder and use &ldquo;Add Existing Questions&rdquo; to organise them.
                  </p>
                  <div className="questions-table-wrap" style={{ marginTop: 8 }}>
                    <QuestionsTable
                      questions={unassigned}
                      foldersForQuestion={foldersForQuestion}
                      onPreview={setPreviewQuestion}
                      onEdit={(q) => setEditingQuestion(q)}
                      onDuplicate={handleDuplicate}
                      onDelete={(id) => setDeleteConfirmId(id)}
                    />
                  </div>
                </div>
              )}
            </section>
          ) : (
            /* ── Folder Detail View ───────────────────────────────────── */
            <section className="folder-detail">
              {/* Back + folder actions */}
              <div className="folder-view-header">
                <button
                  className="folder-back-btn"
                  onClick={() => setSelectedFolderId(null)}
                >
                  <ChevronLeftIcon size={15} />
                  All Folders
                </button>
                <div className="folder-view-title-row">
                  <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                    📁 {currentFolder?.name}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: 8 }}>
                    {folderQuestions.length} question{folderQuestions.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="folder-view-actions">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={PlusCircleIcon}
                    onClick={() => setAddNewQOpen(true)}
                  >
                    Add New Question
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={PlusCircleIcon}
                    onClick={() => setAddExistingOpen(true)}
                  >
                    Add Existing Questions
                  </Button>
                </div>
              </div>

              {/* Questions in this folder */}
              <div className="questions-table-wrap">
                {folderQuestions.length === 0 ? (
                  <div className="questions-empty-block">
                    <QuestionsIcon size={22} className="empty-icon" />
                    <h3 className="empty-heading">This folder is empty</h3>
                    <p className="empty-text">Use the buttons above to add questions.</p>
                  </div>
                ) : (
                  <QuestionsTable
                    questions={folderQuestions}
                    foldersForQuestion={foldersForQuestion}
                    onPreview={setPreviewQuestion}
                    onEdit={(q) => setEditingQuestion(q)}
                    onDuplicate={handleDuplicate}
                    onDelete={(id) => setDeleteConfirmId(id)}
                    onRemoveFromFolder={(id) =>
                      setRemoveFolderConfirm({ questionId: id, folderId: selectedFolderId })
                    }
                  />
                )}
              </div>
            </section>
          )}
        </>
      )}

      {/* ── Folder Modal (create / rename) ──────────────────────────────── */}
      <FolderModal
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        onSave={(name, description) => {
          if (editingFolder) {
            updateFolder(editingFolder.id, { name, description });
            showToast(`Folder "${name}" updated.`, 'success');
          } else {
            addFolder(name, description);
            showToast(`Folder "${name}" created.`, 'success');
          }
          setShowFolderModal(false);
        }}
        initialName={editingFolder?.name || ''}
        initialDescription={editingFolder?.description || ''}
      />

      {/* ── Delete Folder Confirmation ──────────────────────────────────── */}
      {deleteFolderInfo && (
        <div className="modal-backdrop" onClick={() => setDeleteFolderInfo(null)}>
          <div className="modal-dialog delete-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Folder</h3>
              <button className="modal-close-btn" onClick={() => setDeleteFolderInfo(null)}>
                <XIcon size={16} />
              </button>
            </div>
            <div className="modal-body-padding">
              <p>
                Delete folder <strong>"{deleteFolderInfo.name}"</strong>?
                The questions inside will not be deleted — they will appear in Unassigned Questions.
              </p>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" size="sm" onClick={() => setDeleteFolderInfo(null)}>Cancel</Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  deleteFolder(deleteFolderInfo.id);
                  setDeleteFolderInfo(null);
                  showToast(`Folder "${deleteFolderInfo.name}" deleted.`, 'info');
                }}
              >
                Delete Folder
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add New MCQ Modal ───────────────────────────────────────────── */}
      {addNewQOpen && selectedFolderId && (
        <MCQAuthoringModal
          onClose={() => setAddNewQOpen(false)}
          onSave={(data) => {
            addQuestionToFolder(data, selectedFolderId);
            showToast(`Question "${data.title}" added to folder.`, 'success');
            setAddNewQOpen(false);
          }}
        />
      )}

      {/* ── Edit Existing Question Modal ────────────────────────────────── */}
      {editingQuestion && (
        <MCQAuthoringModal
          initialQuestion={editingQuestion}
          onClose={() => setEditingQuestion(null)}
          onSave={(data) => {
            updateQuestion(editingQuestion.id, data);
            showToast(`Question "${data.title}" updated.`, 'success');
            setEditingQuestion(null);
          }}
        />
      )}

      {/* ── Add Existing Questions Modal ────────────────────────────────── */}
      {addExistingOpen && selectedFolderId && (
        <AddExistingQuestionsModal
          currentFolderId={selectedFolderId}
          currentFolderQuestionIds={getFolderById(selectedFolderId)?.questionIds || []}
          allQuestions={questions}
          foldersForQuestion={foldersForQuestion}
          onClose={() => setAddExistingOpen(false)}
          onAdd={(ids) => {
            addExistingQuestionsToFolder(ids, selectedFolderId);
            showToast(`Added ${ids.length} question(s) to folder.`, 'success');
            setAddExistingOpen(false);
          }}
        />
      )}

      {/* ── Preview Modal ───────────────────────────────────────────────── */}
      {previewQuestion && (
        <PreviewModal question={previewQuestion} onClose={() => setPreviewQuestion(null)} />
      )}

      {/* ── Delete Question Confirmation ────────────────────────────────── */}
      {deleteConfirmId && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-dialog delete-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Question</h3>
              <button className="modal-close-btn" onClick={() => setDeleteConfirmId(null)}>
                <XIcon size={16} />
              </button>
            </div>
            <div className="modal-body-padding">
              <p>This will permanently remove the question from the repository and all folders. This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" size="sm" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={handleDeleteQuestion}>Delete Question</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Remove from Folder Confirmation ────────────────────────────── */}
      {removeFolderConfirm && (
        <div className="modal-backdrop" onClick={() => setRemoveFolderConfirm(null)}>
          <div className="modal-dialog delete-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Remove from Folder</h3>
              <button className="modal-close-btn" onClick={() => setRemoveFolderConfirm(null)}>
                <XIcon size={16} />
              </button>
            </div>
            <div className="modal-body-padding">
              <p>Remove this question from the folder? The question will still exist in the repository and can be re-added later.</p>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" size="sm" onClick={() => setRemoveFolderConfirm(null)}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={handleRemoveFromFolder}>Remove from Folder</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Import Modal ────────────────────────────────────────────────── */}
      {showImportModal && (
        <div className="modal-backdrop" onClick={() => setShowImportModal(false)}>
          <div className="modal-dialog import-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Import Questions</h3>
              <button className="modal-close-btn" onClick={() => setShowImportModal(false)}>
                <XIcon size={16} />
              </button>
            </div>
            <div className="modal-body-padding import-body">
              <p className="import-desc">Upload a JSON question file to bulk-import questions into the repository.</p>
              <div className="import-drop-zone" onClick={() => fileInputRef.current?.click()}>
                <UploadIcon size={24} className="import-drop-icon" />
                <span className="drop-title">Click to upload JSON file</span>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".json" onChange={handleFileUpload} />
              </div>
              <div className="import-template-row">
                <button
                  className="import-reset-link"
                  onClick={() => { resetToDefaults(); setShowImportModal(false); showToast('Reset to defaults.', 'info'); }}
                >
                  Reset to default questions
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

// ─── Questions Table Sub-component ────────────────────────────────────────────
const QuestionsTable = ({
  questions,
  foldersForQuestion,
  onPreview,
  onEdit,
  onDuplicate,
  onDelete,
  onRemoveFromFolder,
  showFolderCol = false,
}) => (
  <table className="questions-table">
    <thead>
      <tr>
        <th style={{ width: '38%' }}>Question</th>
        {showFolderCol && <th style={{ width: '15%' }}>Folder</th>}
        <th style={{ width: '12%' }}>Type</th>
        <th style={{ width: '10%' }}>Difficulty</th>
        <th style={{ width: '8%' }}>Marks</th>
        <th style={{ width: '12%' }} className="text-right">Actions</th>
      </tr>
    </thead>
    <tbody>
      {questions.map((q) => {
        const folders = foldersForQuestion ? foldersForQuestion(q.id) : [];
        return (
          <tr key={q.id}>
            <td>
              <div className="q-table-info">
                <span className="q-table-title">{q.title}</span>
                <p className="q-table-snippet">
                  {q.statement?.length > 90 ? `${q.statement.slice(0, 90)}…` : q.statement}
                </p>
              </div>
            </td>
            {showFolderCol && (
              <td>
                {folders.length > 0
                  ? folders.map((f) => (
                      <span key={f.id} className="folder-tag">{f.name}</span>
                    ))
                  : <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Unassigned</span>}
              </td>
            )}
            <td>
              <span className={`q-type-badge type-${q.type}`}>
                {typeLabel(q.type)}
              </span>
            </td>
            <td>
              <span className={`q-difficulty-pill diff-${q.difficulty?.toLowerCase()}`}>
                {q.difficulty}
              </span>
            </td>
            <td>
              <div className="q-table-marks">
                <span className="marks-val">{q.marks} pts</span>
                {q.negativeMarks > 0 && <span className="neg-marks-val">(-{q.negativeMarks})</span>}
              </div>
            </td>
            <td className="text-right">
              <div className="q-row-actions">
                <button className="q-icon-btn" title="Preview" onClick={() => onPreview(q)}><EyeIcon size={14} /></button>
                <button className="q-icon-btn" title="Edit" onClick={() => onEdit(q)}><EditIcon size={14} /></button>
                <button className="q-icon-btn" title="Duplicate" onClick={() => onDuplicate(q.id)}><CopyIcon size={14} /></button>
                {onRemoveFromFolder && (
                  <button className="q-icon-btn text-warning" title="Remove from folder" onClick={() => onRemoveFromFolder(q.id)}>
                    <XIcon size={14} />
                  </button>
                )}
                <button className="q-icon-btn text-danger" title="Delete permanently" onClick={() => onDelete(q.id)}><TrashIcon size={14} /></button>
              </div>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

// ─── MCQ Authoring Modal ──────────────────────────────────────────────────────
const MCQAuthoringModal = ({ initialQuestion = {}, onClose, onSave }) => {
  const isEditing = !!initialQuestion.id;

  const [title, setTitle] = useState(initialQuestion.title || '');
  const [statement, setStatement] = useState(initialQuestion.statement || '');
  const [difficulty, setDifficulty] = useState(initialQuestion.difficulty || 'Medium');
  const [marks, setMarks] = useState(initialQuestion.marks || 2);
  const [explanation, setExplanation] = useState(initialQuestion.explanation || '');
  const [subject, setSubject] = useState(initialQuestion.subject || SUBJECT_OPTIONS[0]);
  const [topic, setTopic] = useState(initialQuestion.topic || '');
  const [options, setOptions] = useState(
    initialQuestion.options?.length >= 2
      ? initialQuestion.options
      : [
          { id: 'opt-1', text: '', isCorrect: true },
          { id: 'opt-2', text: '', isCorrect: false },
          { id: 'opt-3', text: '', isCorrect: false },
          { id: 'opt-4', text: '', isCorrect: false },
        ]
  );
  const [error, setError] = useState('');

  const setCorrect = (id) => {
    setOptions((prev) => prev.map((o) => ({ ...o, isCorrect: o.id === id })));
  };

  const updateOptionText = (id, text) => {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  const addOption = () => {
    setOptions((prev) => [
      ...prev,
      { id: `opt-${Date.now()}`, text: '', isCorrect: false },
    ]);
  };

  const removeOption = (id) => {
    if (options.length <= 2) { setError('At least 2 options are required.'); return; }
    const remaining = options.filter((o) => o.id !== id);
    // If we removed the correct answer, default to first
    if (!remaining.some((o) => o.isCorrect)) {
      remaining[0].isCorrect = true;
    }
    setOptions(remaining);
  };

  const handleSave = () => {
    setError('');
    if (!title.trim()) { setError('Question title is required.'); return; }
    if (!statement.trim()) { setError('Question text/statement is required.'); return; }
    if (options.some((o) => !o.text.trim())) { setError('All option fields must be filled in.'); return; }
    if (!options.some((o) => o.isCorrect)) { setError('Select the correct answer.'); return; }
    if (!marks || isNaN(marks) || Number(marks) <= 0) { setError('Marks must be a positive number.'); return; }

    onSave({
      title: title.trim(),
      statement: statement.trim(),
      type: 'mcq_single', // extensible: change to mcq_multi when needed
      difficulty,
      marks: Number(marks),
      negativeMarks: 0,
      options,
      explanation: explanation.trim(),
      subject,
      topic: topic.trim(),
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog authoring-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEditing ? 'Edit Question' : 'Add New MCQ Question'}</h3>
          <button className="modal-close-btn" onClick={onClose}><XIcon size={16} /></button>
        </div>

        <div className="authoring-body">
          {error && <div className="auth-form-error">{error}</div>}

          {/* Type indicator (locked to MCQ for now) */}
          <div className="form-row">
            <label className="form-label">Question Type</label>
            <select className="toolbar-select" disabled value="mcq_single">
              <option value="mcq_single">MCQ – Multiple Choice (Single Correct)</option>
            </select>
          </div>

          <div className="form-row">
            <label className="form-label">Title <span className="req">*</span></label>
            <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short descriptive title" />
          </div>

          <div className="form-row-two">
            <div className="form-row">
              <label className="form-label">Subject</label>
              <select className="toolbar-select" value={subject} onChange={(e) => setSubject(e.target.value)}>
                {SUBJECT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">Topic</label>
              <input className="form-input" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Sorting & Recurrence" />
            </div>
          </div>

          <div className="form-row">
            <label className="form-label">Question Text <span className="req">*</span></label>
            <textarea className="form-textarea" rows={3} value={statement} onChange={(e) => setStatement(e.target.value)} placeholder="Enter the full question statement…" />
          </div>

          {/* Options */}
          <div className="form-row">
            <label className="form-label">Options <span className="req">*</span> <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>— select the correct answer</span></label>
            <div className="options-list">
              {options.map((opt, idx) => (
                <div key={opt.id} className="option-row">
                  <input
                    type="radio"
                    name="correct-option"
                    checked={opt.isCorrect}
                    onChange={() => setCorrect(opt.id)}
                    title="Mark as correct answer"
                    className="option-radio"
                  />
                  <span className="option-label-letter">{String.fromCharCode(65 + idx)}</span>
                  <input
                    className="form-input option-text-input"
                    value={opt.text}
                    onChange={(e) => updateOptionText(opt.id, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  />
                  {options.length > 2 && (
                    <button className="option-remove-btn" onClick={() => removeOption(opt.id)} title="Remove option">
                      <XIcon size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button className="add-option-btn" onClick={addOption}>+ Add Option</button>
          </div>

          <div className="form-row-two">
            <div className="form-row">
              <label className="form-label">Marks <span className="req">*</span></label>
              <input className="form-input" type="number" min="1" value={marks} onChange={(e) => setMarks(e.target.value)} />
            </div>
            <div className="form-row">
              <label className="form-label">Difficulty</label>
              <select className="toolbar-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                {DIFFICULTY_LEVELS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <label className="form-label">Explanation <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <textarea className="form-textarea" rows={2} value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Explain the correct answer (shown after exam review)…" />
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            {isEditing ? 'Save Changes' : 'Save Question'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Add Existing Questions Modal ─────────────────────────────────────────────
const AddExistingQuestionsModal = ({
  currentFolderId,
  currentFolderQuestionIds,
  allQuestions,
  foldersForQuestion,
  onClose,
  onAdd,
}) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set());

  // Exclude questions already in this folder
  const available = useMemo(() => {
    const q = search.toLowerCase();
    return allQuestions.filter((question) => {
      if (currentFolderQuestionIds.includes(question.id)) return false;
      if (!q) return true;
      return (
        question.title.toLowerCase().includes(q) ||
        question.statement.toLowerCase().includes(q)
      );
    });
  }, [allQuestions, currentFolderQuestionIds, search]);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog add-existing-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add Existing Questions</h3>
          <button className="modal-close-btn" onClick={onClose}><XIcon size={16} /></button>
        </div>

        <div className="add-existing-body">
          <div className="toolbar-search-wrap" style={{ marginBottom: 12 }}>
            <span className="toolbar-search-icon"><SearchIcon size={13} /></span>
            <input
              className="toolbar-search-input"
              placeholder="Search questions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && <button className="toolbar-search-clear" onClick={() => setSearch('')}><XIcon size={12} /></button>}
          </div>

          {available.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {allQuestions.length === currentFolderQuestionIds.length
                ? 'All questions are already in this folder.'
                : 'No questions match your search.'}
            </div>
          ) : (
            <div className="add-existing-list">
              {available.map((q) => {
                const folders = foldersForQuestion(q.id);
                return (
                  <label key={q.id} className={`add-existing-item ${selected.has(q.id) ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selected.has(q.id)}
                      onChange={() => toggle(q.id)}
                      className="add-existing-checkbox"
                    />
                    <div className="add-existing-info">
                      <span className="add-existing-title">{q.title}</span>
                      <span className="add-existing-meta">
                        <span className={`q-difficulty-pill diff-${q.difficulty?.toLowerCase()}`}>{q.difficulty}</span>
                        <span>{q.marks} pts</span>
                        <span className={`q-type-badge type-${q.type}`}>{typeLabel(q.type)}</span>
                        {folders.length > 0 && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                            in: {folders.map((f) => f.name).join(', ')}
                          </span>
                        )}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {selected.size} selected
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            size="sm"
            disabled={selected.size === 0}
            onClick={() => onAdd([...selected])}
          >
            Add Selected ({selected.size})
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Preview Modal ────────────────────────────────────────────────────────────
const PreviewModal = ({ question: q, onClose }) => (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="modal-dialog preview-dialog" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <div className="preview-header-meta">
          <span className="preview-label">Question Preview</span>
          <h3 className="modal-title">{q.title}</h3>
          <div className="preview-meta-chips">
            <span className="chip-subject">{q.subject}</span>
            {q.topic && <><span className="chip-sep">•</span><span className="chip-topic">{q.topic}</span></>}
            <span className="chip-sep">•</span>
            <span className={`q-difficulty-pill diff-${q.difficulty?.toLowerCase()}`}>{q.difficulty}</span>
            <span className="chip-sep">•</span>
            <span className="chip-marks">{q.marks} Marks</span>
          </div>
        </div>
        <button className="modal-close-btn" onClick={onClose}><XIcon size={16} /></button>
      </div>

      <div className="preview-body">
        <div className="preview-statement-box">
          <p className="preview-statement-text">{q.statement}</p>
        </div>

        {(q.type === 'mcq_single' || q.type === 'mcq_multi') && (
          <div className="preview-interactive-section">
            <span className="interactive-title">Options ({q.type === 'mcq_single' ? 'Single Correct' : 'Multiple Correct'}):</span>
            <div className="preview-options-list">
              {q.options?.map((opt, idx) => (
                <div key={opt.id || idx} className={`preview-option-item ${opt.isCorrect ? 'correct-highlight' : ''}`}>
                  <span className="option-marker">{String.fromCharCode(65 + idx)}</span>
                  <span className="option-text">{opt.text}</span>
                  {opt.isCorrect && <span className="correct-tag">✓ Correct</span>}
                </div>
              ))}
            </div>
            {q.explanation && (
              <div className="preview-explanation-box">
                <strong>Explanation:</strong> {q.explanation}
              </div>
            )}
          </div>
        )}

        {q.type === 'coding' && (
          <div className="preview-interactive-section">
            {q.constraints && (
              <div className="preview-constraints-box">
                <span className="constraints-label">Constraints:</span>
                <pre className="constraints-text">{q.constraints}</pre>
              </div>
            )}
            {q.testCases?.length > 0 && (
              <div className="preview-testcases-box">
                <span className="interactive-title">Test Cases:</span>
                {q.testCases.map((tc, idx) => (
                  <div key={tc.id || idx} className="testcase-card">
                    <div className="tc-header">
                      <span className="tc-num">Test #{idx + 1}</span>
                      {tc.isHidden && <span className="tc-hidden-badge">Hidden</span>}
                    </div>
                    <div className="tc-grid">
                      <div><span className="tc-sub">Input:</span><code>{tc.input}</code></div>
                      <div><span className="tc-sub">Expected:</span><code>{tc.expectedOutput}</code></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {q.type === 'blanks' && (
          <div className="preview-interactive-section">
            <span className="interactive-title">Accepted Answers:</span>
            <span> {q.acceptableAnswers?.join(', ')}</span>
          </div>
        )}

        {q.type === 'short_answer' && (
          <div className="preview-interactive-section">
            <span className="interactive-title">Model Answer:</span>
            <div className="preview-model-answer">{q.modelAnswer}</div>
          </div>
        )}
      </div>

      <div className="modal-footer">
        <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
      </div>
    </div>
  </div>
);
