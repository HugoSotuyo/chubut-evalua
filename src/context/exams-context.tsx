
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { getAllExams, addExam as addExamDb, updateExam as updateExamDb, deleteExam as deleteExamDb, toggleExamStatus as toggleExamStatusDb } from '@/lib/examsService';
import type { Exam } from '@/lib/types';

interface ExamsContextType {
  exams: Exam[];
  addExam: (exam: Omit<Exam, 'id' | 'status'>) => Promise<void>;
  updateExam: (exam: Omit<Exam, 'status'>) => Promise<void>;
  deleteExam: (examId: string) => Promise<void>;
  toggleExamStatus: (examId: string) => Promise<void>;
  loading: boolean;
}

const ExamsContext = createContext<ExamsContextType | undefined>(undefined);

export function ExamsProvider({ children }: { children: ReactNode }) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshExams = useCallback(async () => {
    setLoading(true);
    try {
        const data = await getAllExams();
        setExams(data);
    } catch (error) {
        console.error("Failed to fetch exams:", error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshExams();
  }, [refreshExams]);

  const addExam = async (examData: Omit<Exam, 'id' | 'status'>) => {
    await addExamDb(examData);
    await refreshExams();
  };

  const updateExam = async (updatedExamData: Omit<Exam, 'status'>) => {
    await updateExamDb(updatedExamData);
    await refreshExams();
  };

  const deleteExam = async (examId: string) => {
    await deleteExamDb(examId);
    await refreshExams();
  };

  const toggleExamStatus = async (examId: string) => {
    await toggleExamStatusDb(examId);
    await refreshExams();
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
