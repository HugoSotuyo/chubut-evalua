
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Exam = {
    id: string;
    name: string;
    created: string;
    status: "Abierto" | "Cerrado";
};

interface ExamsContextType {
  exams: Exam[];
  addExam: (exam: Exam) => void;
  deleteExam: (examId: string) => void;
  toggleExamStatus: (examId: string) => void;
}

const ExamsContext = createContext<ExamsContextType | undefined>(undefined);

const initialExams: Exam[] = [
    { id: "exm-001", name: "Matemática Diagnóstico 2024", created: "2024-03-15", status: "Abierto" },
    { id: "exm-002", name: "Lengua y Literatura 2024", created: "2024-04-01", status: "Abierto" },
    { id: "exm-003", name: "Ciencias Naturales 2023", created: "2023-09-10", status: "Cerrado" },
    { id: "exm-004", name: "Matemática Cierre 2023", created: "2023-11-20", status: "Cerrado" },
];

const LOCAL_STORAGE_KEY = 'chubut-evalua-exams';

export function ExamsProvider({ children }: { children: ReactNode }) {
  const [exams, setExams] = useState<Exam[]>(() => {
    if (typeof window === 'undefined') {
        return initialExams;
    }
    try {
      const storedExams = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      return storedExams ? JSON.parse(storedExams) : initialExams;
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return initialExams;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(exams));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  }, [exams]);

  const addExam = (exam: Exam) => {
    setExams(prevExams => [...prevExams, exam]);
  };

  const deleteExam = (examId: string) => {
    setExams(prevExams => prevExams.filter(exam => exam.id !== examId));
  };

  const toggleExamStatus = (examId: string) => {
    setExams(prevExams =>
      prevExams.map(exam =>
        exam.id === examId
          ? { ...exam, status: exam.status === "Abierto" ? "Cerrado" : "Abierto" }
          : exam
      )
    );
  };

  return (
    <ExamsContext.Provider value={{ exams, addExam, deleteExam, toggleExamStatus }}>
      {children}
    </ExamsContext.Provider>
  );
}

export function useExams() {
  const context = useContext(ExamsContext);
  if (context === undefined) {
    throw new Error('useExams must be used within an ExamsProvider');
  }
  return context;
}
