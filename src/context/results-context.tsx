
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Result = {
  id: string;
  studentId: string;
  studentName: string;
  examId: string;
  examName: string;
  school: string;
  grade: string;
  course: string;
  status: "Aprobado" | "Desaprobado";
  score: number; // Percentage score
  scores: Record<number, number>; // Score per question
  totalScore: number;
  maxScore: number;
};

type NewResult = Omit<Result, 'id'>;

interface ResultsContextType {
  results: Result[];
  addResult: (result: NewResult) => void;
  resultExists: (studentId: string, examId: string) => boolean;
}

const ResultsContext = createContext<ResultsContextType | undefined>(undefined);

const initialResults: Result[] = [
    { id: "res-001", studentId: "alu-001", studentName: "Juan Pérez", examId: "exm-001", examName: "Diagnóstico 2024", school: "Escuela N° 101", grade: "5to Grado", course: "A", status: "Aprobado", score: 85, scores: {0: 10, 1: 8}, totalScore: 18, maxScore: 20 },
    { id: "res-002", studentId: "alu-002", studentName: "María García", examId: "exm-001", examName: "Diagnóstico 2024", school: "Escuela N° 101", grade: "5to Grado", course: "A", status: "Desaprobado", score: 55, scores: {0: 5, 1: 6}, totalScore: 11, maxScore: 20 },
];

const LOCAL_STORAGE_KEY = 'chubut-evalua-results';

export function ResultsProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<Result[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedResults = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      setResults(storedResults ? JSON.parse(storedResults) : initialResults);
    } catch (error) {
      console.error("Error reading from localStorage", error);
      setResults(initialResults);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(results));
      } catch (error) {
        console.error("Error writing to localStorage", error);
      }
    }
  }, [results, isInitialized]);

  const addResult = (resultData: NewResult) => {
    const newResult: Result = {
        ...resultData,
        id: `res-${Date.now()}`,
    }
    setResults(prevResults => [...prevResults, newResult]);
  };
  
  const resultExists = (studentId: string, examId: string): boolean => {
    return results.some(r => r.studentId === studentId && r.examId === examId);
  }

  return (
    <ResultsContext.Provider value={{ results, addResult, resultExists }}>
      {children}
    </ResultsContext.Provider>
  );
}

export function useResults() {
  const context = useContext(ResultsContext);
  if (context === undefined) {
    throw new Error('useResults must be used within a ResultsProvider');
  }
  return context;
}
