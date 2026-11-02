import { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_QUESTIONS } from '../data/questionStore';

const QuestionContext = createContext();

const STORAGE_KEY = 'examlan_teacher_questions_v1';

export const QuestionProvider = ({ children }) => {
  const [questions, setQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load questions from localStorage:', e);
    }
    return INITIAL_QUESTIONS;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
    } catch (e) {
      console.warn('Failed to persist questions to localStorage:', e);
    }
  }, [questions]);

  // Add a new question
  const addQuestion = (newQuestionData) => {
    const id = `q-${Date.now().toString().slice(-4)}`;
    const question = {
      ...newQuestionData,
      id,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setQuestions((prev) => [question, ...prev]);
    return question;
  };

  // Update existing question
  const updateQuestion = (id, updatedData) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              ...updatedData,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : q
      )
    );
  };

  // Delete question
  const deleteQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Duplicate question
  const duplicateQuestion = (id) => {
    const original = questions.find((q) => q.id === id);
    if (!original) return null;

    const newId = `q-${Date.now().toString().slice(-4)}`;
    const copy = {
      ...original,
      id: newId,
      title: `${original.title} (Copy)`,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setQuestions((prev) => {
      const index = prev.findIndex((q) => q.id === id);
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });

    return copy;
  };

  // Import questions from array
  const importQuestions = (importedArray) => {
    if (!Array.isArray(importedArray)) return { count: 0 };
    const valid = importedArray.filter((q) => q && q.title && q.statement);
    if (valid.length === 0) return { count: 0 };

    setQuestions((prev) => {
      // Merge unique by title
      const existingTitles = new Set(prev.map((p) => p.title.toLowerCase().trim()));
      const toAdd = valid.filter(
        (v) => !existingTitles.has(v.title.toLowerCase().trim())
      );
      return [...toAdd, ...prev];
    });

    return { count: valid.length };
  };

  // Export questions JSON
  const exportQuestions = () => {
    const jsonStr = JSON.stringify(questions, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `examlan-question-bank-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Reset to initial defaults
  const resetToDefaults = () => {
    setQuestions(INITIAL_QUESTIONS);
  };

  return (
    <QuestionContext.Provider
      value={{
        questions,
        totalQuestions: questions.length,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        duplicateQuestion,
        importQuestions,
        exportQuestions,
        resetToDefaults,
      }}
    >
      {children}
    </QuestionContext.Provider>
  );
};

export const useQuestions = () => {
  const context = useContext(QuestionContext);
  if (!context) {
    throw new Error('useQuestions must be used within a QuestionProvider');
  }
  return context;
};

