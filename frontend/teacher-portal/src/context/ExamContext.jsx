import React, { createContext, useContext, useEffect, useState } from "react";
import { MOCK_EXAMS, generateExamId } from "../data/examStore";

const ExamContext = createContext();

export const ExamProvider = ({ children }) => {
  const [exams, setExams] = useState(() => {
    const stored = localStorage.getItem("exams");
    return stored ? JSON.parse(stored) : MOCK_EXAMS;
  });

  useEffect(() => {
    localStorage.setItem("exams", JSON.stringify(exams));
  }, [exams]);

  const addExam = (exam) => {
    const newExam = { ...exam, id: generateExamId() };
    setExams((prev) => [...prev, newExam]);
    return newExam.id;
  };

  const updateExam = (id, updates) => {
    setExams((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const deleteExam = (id) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  const value = { exams, addExam, updateExam, deleteExam };
  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
};

export const useExams = () => useContext(ExamContext);

