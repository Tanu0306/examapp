import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const QuestionBankContext = createContext(null);
const API_ROOT = '/api/question-bank';

const apiRequest = async (path, { method = 'GET', body } = {}) => {
  const response = await fetch(`${API_ROOT}${path}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Question bank request failed.');
  return data;
};

const normalizeQuestion = (question) => ({
  ...question,
  title: question.title || question.statement,
  negativeMarks: Number(question.negativeMarks || 0),
  marks: Number(question.marks || 1),
  options: (question.options || []).map((option) => ({
    ...option,
    isCorrect: Boolean(option.isCorrect),
  })),
});

const questionPayload = (question, folderIds) => ({
  type: question.type,
  statement: question.statement,
  options: question.options.map(({ text, isCorrect }) => ({ text, isCorrect })),
  explanation: question.explanation || null,
  marks: Number(question.marks),
  negativeMarks: Number(question.negativeMarks || 0),
  folderIds,
});

export const QuestionBankProvider = ({ children }) => {
  const { user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshData = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) setIsLoading(true);
    setError('');
    try {
      const [folderData, questionData] = await Promise.all([
        apiRequest('/folders'),
        apiRequest('/questions'),
      ]);
      const loadedQuestions = (questionData.questions || []).map(normalizeQuestion);
      const questionIdsByFolder = new Map();
      for (const question of loadedQuestions) {
        for (const folderId of question.folderIds || []) {
          const ids = questionIdsByFolder.get(folderId) || [];
          ids.push(question.id);
          questionIdsByFolder.set(folderId, ids);
        }
      }
      const loadedFolders = (folderData.folders || []).map((folder) => ({
        ...folder,
        questionIds: questionIdsByFolder.get(folder.id) || [],
      }));

      setFolders(loadedFolders);
      setQuestions(loadedQuestions);
      setSelectedFolderId((currentId) =>
        currentId && loadedFolders.some((folder) => folder.id === currentId) ? currentId : null
      );
      return { folders: loadedFolders, questions: loadedQuestions };
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setFolders([]);
    setQuestions([]);
    setSelectedFolderId(null);
    refreshData().catch(() => {});
  }, [user?.id, refreshData]);

  const addFolder = async (name) => {
    const data = await apiRequest('/folders', { method: 'POST', body: { name } });
    await refreshData({ showLoading: false });
    return data.folder;
  };

  const updateFolder = async (id, updates) => {
    const data = await apiRequest(`/folders/${id}`, {
      method: 'PATCH',
      body: { name: updates.name },
    });
    await refreshData({ showLoading: false });
    return data.folder;
  };

  const deleteFolder = async (id) => {
    await apiRequest(`/folders/${id}`, { method: 'DELETE' });
    setSelectedFolderId((currentId) => currentId === id ? null : currentId);
    await refreshData({ showLoading: false });
  };

  const addQuestionToFolder = async (questionData, folderId) => {
    const data = await apiRequest('/questions', {
      method: 'POST',
      body: questionPayload(questionData, [folderId]),
    });
    await refreshData({ showLoading: false });
    return normalizeQuestion(data.question);
  };

  const addExistingQuestionsToFolder = async (questionIds, folderId) => {
    await apiRequest(`/folders/${folderId}/questions`, {
      method: 'POST',
      body: { questionIds },
    });
    await refreshData({ showLoading: false });
  };

  const removeQuestionFromFolder = async (questionId, folderId) => {
    await apiRequest(`/folders/${folderId}/questions/${questionId}`, { method: 'DELETE' });
    await refreshData({ showLoading: false });
  };

  const updateQuestion = async (id, updates) => {
    const data = await apiRequest(`/questions/${id}`, {
      method: 'PATCH',
      body: questionPayload(updates, []),
    });
    await refreshData({ showLoading: false });
    return normalizeQuestion(data.question);
  };

  const deleteQuestion = async (id) => {
    await apiRequest(`/questions/${id}`, { method: 'DELETE' });
    await refreshData({ showLoading: false });
  };

  const duplicateQuestion = async (id) => {
    const original = questions.find((question) => question.id === id);
    if (!original) return null;
    const folderIds = foldersForQuestion(id).map((folder) => folder.id);
    if (folderIds.length === 0) return null;
    const data = await apiRequest('/questions', {
      method: 'POST',
      body: questionPayload(original, folderIds),
    });
    await refreshData({ showLoading: false });
    return normalizeQuestion(data.question);
  };

  const importQuestions = async (importedArray, folderId) => {
    if (!Array.isArray(importedArray) || !folderId) return { count: 0 };
    let count = 0;
    let skipped = 0;
    for (const question of importedArray) {
      try {
        const normalized = normalizeQuestion(question);
        if (!normalized.statement || normalized.options.length !== 4) {
          skipped += 1;
          continue;
        }
        await apiRequest('/questions', {
          method: 'POST',
          body: questionPayload(normalized, [folderId]),
        });
        count += 1;
      } catch {
        skipped += 1;
      }
    }
    await refreshData({ showLoading: false });
    return { count, skipped };
  };

  const exportQuestions = () => {
    const json = JSON.stringify(questions, null, 2);
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `examlan-question-bank-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const getFolderById = (id) => folders.find((folder) => folder.id === id) || null;
  const questionsInFolder = (folderId) =>
    questions.filter((question) => (question.folderIds || []).includes(folderId));
  const unassignedQuestions = () => [];
  const foldersForQuestion = (questionId) =>
    folders.filter((folder) => (folder.questionIds || []).includes(questionId));

  const value = {
    questions,
    folders,
    isLoading,
    error,
    refreshData,
    selectedFolderId,
    setSelectedFolderId,
    addFolder,
    updateFolder,
    deleteFolder,
    addQuestionToFolder,
    addExistingQuestionsToFolder,
    removeQuestionFromFolder,
    duplicateQuestion,
    exportQuestions,
    importQuestions,
    deleteQuestion,
    updateQuestion,
    getFolderById,
    questionsInFolder,
    unassignedQuestions,
    foldersForQuestion,
  };

  return <QuestionBankContext.Provider value={value}>{children}</QuestionBankContext.Provider>;
};

export const useQuestionBank = () => {
  const context = useContext(QuestionBankContext);
  if (!context) throw new Error('useQuestionBank must be used within a QuestionBankProvider');
  return context;
};
