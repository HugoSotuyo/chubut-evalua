
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

  const fetchExams = async () => {
    try {
      const examsCollection = collection(db, 'exams');
      const examsSnapshot = await getDocs(examsCollection);
      const examsList = examsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam));
      setExams(examsList);
    } catch (error) {
      console.error("Error fetching exams from Firestore:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const addExam = async (examData: Omit<Exam, 'id' | 'status'>) => {
    try {
      const newExam: Omit<Exam, 'id'> = {
          ...examData,
          status: "Abierto",
      }
      const docRef = await addDoc(collection(db, 'exams'), newExam);
      setExams(prevExams => [...prevExams, { ...newExam, id: docRef.id }]);
    } catch (error) {
      console.error("Error adding exam to Firestore:", error);
    }
  };

  const updateExam = async (updatedExamData: Omit<Exam, 'status'>) => {
    try {
      const examDocRef = doc(db, 'exams', updatedExamData.id);
      const { id, ...dataToUpdate } = updatedExamData;
      await updateDoc(examDocRef, dataToUpdate);

      setExams(prevExams =>
        prevExams.map(exam =>
          exam.id === updatedExamData.id ? { ...exam, ...dataToUpdate } : exam
        )
      );
    } catch (error) {
      console.error("Error updating exam in Firestore:", error);
    }
  };

  const deleteExam = async (examId: string) => {
    try {
      await deleteDoc(doc(db, 'exams', examId));
      setExams(prevExams => prevExams.filter(exam => exam.id !== examId));
    } catch (error) {
      console.error("Error deleting exam from Firestore:", error);
    }
  };

  const toggleExamStatus = async (examId: string) => {
    const examToToggle = exams.find(e => e.id === examId);
    if (!examToToggle) return;
    
    try {
      const newStatus = examToToggle.status === "Abierto" ? "Cerrado" : "Abierto";
      const examDocRef = doc(db, 'exams', examId);
      await updateDoc(examDocRef, { status: newStatus });
      setExams(prevExams =>
        prevExams.map(exam =>
          exam.id === examId
            ? { ...exam, status: newStatus }
            : exam
        )
      );
    } catch (error) {
      console.error("Error toggling exam status in Firestore:", error);
    }
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
