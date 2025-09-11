
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { getAllExams, addExam as addExamDb, updateExam as updateExamDb, deleteExam as deleteExamDb, toggleExamStatus as toggleExamStatusDb } from '@/lib/examsService';
import type { Exam } from '@/lib/types';
import { useAuditLogs } from './audit-log-context';

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
  const { addAuditLog } = useAuditLogs();

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
    const examToSave: any = { ...examData };
    if (examToSave.fileDataUrl === undefined) {
      delete examToSave.fileDataUrl;
    }
    if (examToSave.fileName === undefined) {
      delete examToSave.fileName;
    }

    await addExamDb(examToSave);
    await addAuditLog({ action: "CREAR_EXAMEN", details: `Se creó el examen "${examData.name}"` });
    await refreshExams();
  };

  const updateExam = async (updatedExamData: Omit<Exam, 'status'>) => {
    const examToUpdate: any = { ...updatedExamData };
    if (examToUpdate.fileDataUrl === undefined) {
      delete examToUpdate.fileDataUrl;
    }
    if (examToUpdate.fileName === undefined) {
      delete examToUpdate.fileName;
    }

    await updateExamDb(examToUpdate);
    await addAuditLog({ action: "EDITAR_EXAMEN", details: `Se editó el examen "${updatedExamData.name}"` });
    await refreshExams();
  };

  const deleteExam = async (examId: string) => {
    const examToDelete = exams.find(e => e.id === examId);
    await deleteExamDb(examId);
    if(examToDelete) {
        await addAuditLog({ action: "ELIMINAR_EXAMEN", details: `Se eliminó el examen "${examToDelete.name}"` });
    }
    await refreshExams();
  };

  const toggleExamStatus = async (examId: string) => {
    const exam = exams.find(e => e.id === examId);
    await toggleExamStatusDb(examId);
     if (exam) {
        const newStatus = exam.status === "Abierto" ? "Cerrado" : "Abierto";
        await addAuditLog({ action: "CAMBIAR_ESTADO_EXAMEN", details: `Se cambió el estado del examen "${exam.name}" a ${newStatus}` });
    }
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
