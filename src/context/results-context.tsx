
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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

const initialResults: Result[] = [
    { id: '1', studentId: '1', studentName: 'Juan Perez', examId: '1', examName: 'Diagnóstico Matemática 2024', school: 'Escuela N° 123', grade: '3er Grado', course: 'A', status: 'Aprobado', score: 80, scores: {0: 8, 1: 12}, totalScore: 20, maxScore: 25 },
    { id: '2', studentId: '2', studentName: 'Maria Lopez', examId: '1', examName: 'Diagnóstico Matemática 2024', school: 'Escuela N° 123', grade: '3er Grado', course: 'A', status: 'Desaprobado', score: 40, scores: {0: 5, 1: 5}, totalScore: 10, maxScore: 25},
    { id: '3', studentId: '1', studentName: 'Juan Perez', examId: '2', examName: 'Prácticas del Lenguaje - 1er Trimestre', school: 'Escuela N° 123', grade: '3er Grado', course: 'A', status: 'Aprobado', score: 100, scores: {0: 10}, totalScore: 10, maxScore: 10 },
];

const RESULTS_STORAGE_KEY = 'chubut_evalua_results';

interface ResultsContextType {
  results: Result[];
  addResult: (result: NewResult) => void;
  deleteResult: (resultId: string) => void;
  resultExists: (studentId: string, examId: string) => boolean;
  loading: boolean;
}

const ResultsContext = createContext<ResultsContextType | undefined>(undefined);

export function ResultsProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
        const storedResults = localStorage.getItem(RESULTS_STORAGE_KEY);
        if (storedResults) {
            setResults(JSON.parse(storedResults));
        } else {
            setResults(initialResults);
            localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(initialResults));
        }
    } catch (error) {
        console.error("Failed to access localStorage for results:", error);
        setResults(initialResults);
    }
    setLoading(false);
  }, []);

  const updateResultsInStateAndStorage = (newResults: Result[]) => {
    setResults(newResults);
    try {
        localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(newResults));
    } catch (error) {
        console.error("Failed to save results to localStorage:", error);
    }
  };

  const addResult = (resultData: NewResult) => {
    const newResult: Result = {
        ...resultData,
        id: (Math.max(0, ...results.map(r => parseInt(r.id, 10))) + 1).toString()
    };
    updateResultsInStateAndStorage([...results, newResult]);
  };
  
  const deleteResult = (resultId: string) => {
    const newResults = results.filter(result => result.id !== resultId);
    updateResultsInStateAndStorage(newResults);
  };
  
  const resultExists = (studentId: string, examId: string): boolean => {
    return results.some(r => r.studentId === studentId && r.examId === examId);
  }

  return (
    <ResultsContext.Provider value={{ results, addResult, deleteResult, resultExists, loading }}>
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
