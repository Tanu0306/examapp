import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const ExamContext = createContext(null);

const request = async (path, { method = 'GET', body } = {}) => {
  const response = await fetch(`/api/exams${path}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Exam request failed.');
  return data;
};

export const ExamProvider = ({ children }) => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshExams = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) setIsLoading(true);
    setError('');
    try {
      const data = await request('');
      setExams(data.exams || []);
      return data.exams || [];
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setExams([]);
      setIsLoading(false);
      return;
    }
    refreshExams().catch(() => {});
  }, [user?.id, refreshExams]);

  const getExam = useCallback(async (id) => {
    const data = await request(`/${id}`);
    return data.exam;
  }, []);

  const addExam = async (exam) => {
    const data = await request('', { method: 'POST', body: exam });
    setExams((current) => [data.exam, ...current]);
    return data.exam;
  };

  const updateExam = async (id, updates) => {
    const data = await request(`/${id}`, { method: 'PATCH', body: updates });
    setExams((current) => current.map((exam) => exam.id === id ? data.exam : exam));
    return data.exam;
  };

  const deleteExam = async (id) => {
    await request(`/${id}`, { method: 'DELETE' });
    setExams((current) => current.filter((exam) => exam.id !== id));
  };

  return (
    <ExamContext.Provider value={{ exams, isLoading, error, refreshExams, getExam, addExam, updateExam, deleteExam }}>
      {children}
    </ExamContext.Provider>
  );
};

export const useExams = () => {
  const context = useContext(ExamContext);
  if (!context) throw new Error('useExams must be used within an ExamProvider');
  return context;
};
