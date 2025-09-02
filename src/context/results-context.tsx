
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, getDocs, addDoc, doc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  addResult: (result: NewResult) => Promise<void>;
  deleteResult: (resultId: string) => Promise<void>;
  resultExists: (studentId: string, examId: string) => boolean;
  loading: boolean;
}

const ResultsContext = createContext<ResultsContextType | undefined>(undefined);

export function ResultsProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    try {
      const resultsCollection = collection(db, 'results');
      const resultsSnapshot = await getDocs(resultsCollection);
      const resultsList = resultsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Result));
      setResults(resultsList);
    } catch (error) {
      console.error("Error fetching results from Firestore:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const addResult = async (resultData: NewResult) => {
    try {
      const docRef = await addDoc(collection(db, 'results'), resultData);
      setResults(prevResults => [...prevResults, { ...resultData, id: docRef.id }]);
    } catch (error) {
      console.error("Error adding result to Firestore:", error);
    }
  };
  
  const deleteResult = async (resultId: string) => {
    try {
      await deleteDoc(doc(db, 'results', resultId));
      setResults(prevResults => prevResults.filter(result => result.id !== resultId));
    } catch (error) {
      console.error("Error deleting result from Firestore:", error);
    }
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
