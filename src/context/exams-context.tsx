
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { getExamsSync, saveExamsSync, addExam as addExamDb, updateExam as updateExamDb, deleteExam as deleteExamDb, toggleExamStatus as toggleExamStatusDb } from '@/data/exams';
import type { Exam } from '@/lib/types';

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
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshExams = useCallback(() => {
    const data = getExamsSync();
    setExams(data);
  }, []);

  useEffect(() => {
    refreshExams();
    setLoading(false);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'chubut_evalua_exams') {
        refreshExams();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshExams]);

  const addExam = async (examData: Omit<Exam, 'id' | 'status'>) => {
    await addExamDb(examData);
    refreshExams();
  };

  const updateExam = async (updatedExamData: Omit<Exam, 'status'>) => {
    await updateExamDb(updatedExamData);
    refreshExams();
  };

  const deleteExam = async (examId: string) => {
    await deleteExamDb(examId);
    refreshExams();
  };

  const toggleExamStatus = async (examId: string) => {
    await toggleExamStatusDb(examId);
    refreshExams();
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
