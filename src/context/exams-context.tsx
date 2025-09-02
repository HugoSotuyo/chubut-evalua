
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Question = {
  consigna: string;
  respuesta: string;
  puntaje: number;
};

export type Exam = {
    id: string;
    name: string;
    tema: string;
    grade: string;
    created: string;
    status: "Abierto" | "Cerrado";
    questions: Question[];
    fileDataUrl?: string;
    fileName?: string;
};

const initialExams: Exam[] = [
    { id: '1', name: 'Diagnóstico Matemática 2024', tema: 'Matemática', grade: '3er Grado', created: '2024-05-10', status: 'Cerrado', questions: [{ consigna: '2+2', respuesta: '4', puntaje: 10 }, { consigna: '5*5', respuesta: '25', puntaje: 15 }] },
    { id: '2', name: 'Prácticas del Lenguaje - 1er Trimestre', tema: 'Lengua', grade: '3er Grado', created: '2024-04-22', status: 'Cerrado', questions: [{ consigna: 'Capital de Argentina', respuesta: 'Buenos Aires', puntaje: 10 }] },
    { id: '3', name: 'Ciencias Naturales - Seres Vivos', tema: 'Naturales', grade: '5to Grado', created: '2024-06-01', status: 'Abierto', questions: [{ consigna: 'Planeta Tierra es el...', respuesta: '3ro', puntaje: 10 }] },
];

interface ExamsContextType {
  exams: Exam[];
  addExam: (exam: Omit<Exam, 'id' | 'status'>) => void;
  updateExam: (exam: Omit<Exam, 'status'>) => void;
  deleteExam: (examId: string) => void;
  toggleExamStatus: (examId: string) => void;
  loading: boolean;
}

const ExamsContext = createContext<ExamsContextType | undefined>(undefined);

export function ExamsProvider({ children }: { children: ReactNode }) {
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [loading] = useState(false);

  const addExam = (examData: Omit<Exam, 'id' | 'status'>) => {
    const newExam: Exam = {
      ...examData,
      id: (exams.length + 1).toString(),
      status: "Abierto",
    };
    setExams(prevExams => [...prevExams, newExam]);
  };

  const updateExam = (updatedExamData: Omit<Exam, 'status'>) => {
    setExams(prevExams =>
      prevExams.map(exam =>
        exam.id === updatedExamData.id ? { ...exam, ...updatedExamData } : exam
      )
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
    <ExamsContext.Provider value={{ exams, addExam, updateExam, deleteExam, toggleExamStatus, loading }}>
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
