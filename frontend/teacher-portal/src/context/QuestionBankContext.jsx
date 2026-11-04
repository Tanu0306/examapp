import React, { createContext, useContext, useState } from 'react';
import { useQuestions } from './QuestionContext';

// -----------------------------------------------------------------------------
// QuestionBankContext – folder-wise organisation on top of QuestionContext.
// Folders store their question associations as an array of question IDs
// (folder.questionIds[]). This means:
//   - Existing question records need ZERO changes.
//   - A question can appear in multiple folders (shared) without duplicating data.
//   - questionsInFolder() looks up IDs from the folder, not from q.folderId.
// -----------------------------------------------------------------------------

const QuestionBankContext = createContext(null);

const FOLDERS_STORAGE_KEY = 'examlan_teacher_folders_v1';

const loadFolders = () => {
  try {
    const saved = localStorage.getItem(FOLDERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
};

const saveFolders = (folders) => {
  try {
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
  } catch {}
};

export const QuestionBankProvider = ({ children }) => {
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

  // Folders: [{ id, name, description, questionIds: [] }]
  const [folders, setFolders] = useState(loadFolders);
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  // Persist folders whenever they change
  const updateFolders = (updater) => {
    setFolders((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveFolders(next);
      return next;
    });
  };

  // ── Folder CRUD ────────────────────────────────────────────────────────────

  const addFolder = (name, description = '') => {
    const id = `fld-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    updateFolders((prev) => [...prev, { id, name, description, questionIds: [] }]);
    return id;
  };

  const updateFolder = (id, updates) => {
    updateFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const renameFolder = (id, newName) => updateFolder(id, { name: newName });

  const deleteFolder = (id) => {
    updateFolders((prev) => prev.filter((f) => f.id !== id));
    if (selectedFolderId === id) setSelectedFolderId(null);
  };

  // ── Folder ↔ Question associations ────────────────────────────────────────

  /**
   * Add a brand-new question (created from the MCQ form) and immediately
   * link it to the given folder. Returns the new question object.
   */
  const addQuestionToFolder = (questionData, folderId) => {
    const newQ = addQuestion(questionData);        // creates in QuestionContext
    updateFolders((prev) =>
      prev.map((f) =>
        f.id === folderId
          ? { ...f, questionIds: [...new Set([...f.questionIds, newQ.id])] }
          : f
      )
    );
    return newQ;
  };

  /**
   * Link one or more existing question IDs to a folder (no data duplication).
   */
  const addExistingQuestionsToFolder = (questionIds, folderId) => {
    updateFolders((prev) =>
      prev.map((f) =>
        f.id === folderId
          ? { ...f, questionIds: [...new Set([...f.questionIds, ...questionIds])] }
          : f
      )
    );
  };

  /**
   * Remove a question ID from a folder (does NOT delete the question itself).
   */
  const removeQuestionFromFolder = (questionId, folderId) => {
    updateFolders((prev) =>
      prev.map((f) =>
        f.id === folderId
          ? { ...f, questionIds: f.questionIds.filter((id) => id !== questionId) }
          : f
      )
    );
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getFolderById = (id) => folders.find((f) => f.id === id) || null;

  /** Questions that belong to a specific folder (by ID lookup in the folder). */
  const questionsInFolder = (folderId) => {
    const folder = getFolderById(folderId);
    if (!folder) return [];
    return questions.filter((q) => folder.questionIds.includes(q.id));
  };

  /** Questions not in ANY folder. */
  const unassignedQuestions = () => {
    const allLinkedIds = new Set(folders.flatMap((f) => f.questionIds));
    return questions.filter((q) => !allLinkedIds.has(q.id));
  };

  /** All folder IDs that contain a given question ID. */
  const foldersForQuestion = (questionId) =>
    folders.filter((f) => f.questionIds.includes(questionId));

  // ── Provider ───────────────────────────────────────────────────────────────

  return (
    <QuestionBankContext.Provider
      value={{
        // Raw question helpers (forwarded from QuestionContext)
        questions,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        duplicateQuestion,
        importQuestions,
        exportQuestions,
        resetToDefaults,

        // Folder state
        folders,
        selectedFolderId,
        setSelectedFolderId,

        // Folder CRUD
        addFolder,
        updateFolder,
        renameFolder,
        deleteFolder,

        // Folder ↔ question associations
        addQuestionToFolder,
        addExistingQuestionsToFolder,
        removeQuestionFromFolder,

        // Helpers
        getFolderById,
        questionsInFolder,
        unassignedQuestions,
        foldersForQuestion,
      }}
    >
      {children}
    </QuestionBankContext.Provider>
  );
};

export const useQuestionBank = () => {
  const context = useContext(QuestionBankContext);
  if (!context) {
    throw new Error('useQuestionBank must be used within a QuestionBankProvider');
  }
  return context;
};
