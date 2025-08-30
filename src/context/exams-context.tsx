
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Question = {
  consigna: string;
  respuesta: string;
  puntaje: number;
};

export type Exam = {
    id: string;
    name: string;
    tema: string;
    created: string;
    status: "Abierto" | "Cerrado";
    questions: Question[];
};

interface ExamsContextType {
  exams: Exam[];
  addExam: (exam: Omit<Exam, 'id' | 'status'>) => void;
  updateExam: (exam: Omit<Exam, 'status'>) => void;
  deleteExam: (examId: string) => void;
  toggleExamStatus: (examId: string) => void;
}

const ExamsContext = createContext<ExamsContextType | undefined>(undefined);

const initialExams: Exam[] = [
    { id: "exm-001", name: "Diagnóstico 2024", tema: "Matemática", created: "2024-03-15", status: "Abierto", questions: [{consigna: "Resolver: 2+2", respuesta: "4", puntaje: 10}, {consigna: "Capital de Francia", respuesta: "Paris", puntaje: 10}] },
    { id: "exm-002", name: "Comprensión Lectora", tema: "Lengua", created: "2024-04-01", status: "Abierto", questions: [] },
    { id: "exm-003", name: "El Sistema Solar", tema: "Ciencias Naturales", created: "2023-09-10", status: "Cerrado", questions: [] },
    { id: "exm-004", name: "Cierre 2023", tema: "Matemática", created: "2023-11-20", status: "Cerrado", questions: [] },
];

const LOCAL_STORAGE_KEY = 'chubut-evalua-exams';

export function ExamsProvider({ children }: { children: ReactNode }) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedExams = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      setExams(storedExams ? JSON.parse(storedExams) : initialExams);
    } catch (error) {
      console.error("Error reading from localStorage", error);
      setExams(initialExams);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(exams));
      } catch (error) {
        console.error("Error writing to localStorage", error);
      }
    }
  }, [exams, isInitialized]);

  const addExam = (examData: Omit<Exam, 'id' | 'status'>) => {
    const newExam: Exam = {
        ...examData,
        id: `exm-${Date.now()}`,
        status: "Abierto",
    }
    setExams(prevExams => [...prevExams, newExam]);
  };

  const updateExam = (updatedExamData: Omit<Exam, 'status'>) => {
    setExams(prevExams =>
      prevExams.map(exam => {
        if (exam.id === updatedExamData.id) {
          return { ...exam, ...updatedExamData };
        }
        return exam;
      })
    );
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
    <ExamsContext.Provider value={{ exams, addExam, updateExam, deleteExam, toggleExamStatus }}>
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
