
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { getAllResults, addResult as addResultDb, deleteResult as deleteResultDb, resultExists as resultExistsDb } from '@/lib/resultsService';
import type { Result } from '@/lib/types';

type NewResult = Omit<Result, 'id'>;

interface ResultsContextType {
  results: Result[];
  addResult: (result: NewResult) => Promise<void>;
  deleteResult: (resultId: string) => Promise<void>;
  resultExists: (studentId: string, examId: string) => Promise<boolean>;
  loading: boolean;
}

const ResultsContext = createContext<ResultsContextType | undefined>(undefined);

export function ResultsProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshResults = useCallback(async () => {
    setLoading(true);
    try {
        const data = await getAllResults();
        setResults(data);
    } catch (error) {
        console.error("Failed to fetch results:", error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshResults();
  }, [refreshResults]);


  const addResult = async (resultData: NewResult) => {
    await addResultDb(resultData);
    await refreshResults();
  };
  
  const deleteResult = async (resultId: string) => {
    await deleteResultDb(resultId);
    await refreshResults();
  };
  
  const resultExists = useCallback(async (studentId: string, examId: string): Promise<boolean> => {
    return await resultExistsDb(studentId, examId);
  }, []);

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
