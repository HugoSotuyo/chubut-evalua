
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { getAllStudents, addStudent as addStudentDb, updateStudent as updateStudentDb, deleteStudent as deleteStudentDb } from '@/lib/studentsService';
import type { Student } from '@/lib/types';
import { useSettings } from './settings-context';

type NewStudent = Omit<Student, 'id' | 'results' | 'schoolYear'>;

interface StudentsContextType {
  students: Student[];
  addStudent: (student: NewStudent) => Promise<void>;
  updateStudent: (student: Omit<Student, 'results'>) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  loading: boolean;
}

const StudentsContext = createContext<StudentsContextType | undefined>(undefined);

export function StudentsProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings, loading: settingsLoading } = useSettings();

  const refreshStudents = useCallback(async () => {
    if (settingsLoading) return;
    setLoading(true);
    try {
      const allStudents = await getAllStudents();
      const filteredStudents = allStudents.filter(s => s.schoolYear === settings.currentSchoolYear);
      setStudents(filteredStudents);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
        setLoading(false);
    }
  }, [settings.currentSchoolYear, settingsLoading]);

  useEffect(() => {
    refreshStudents();
  }, [refreshStudents]);

  const addStudent = async (studentData: NewStudent) => {
    const studentWithYear = { ...studentData, schoolYear: settings.currentSchoolYear };
    await addStudentDb(studentWithYear);
    await refreshStudents();
  };
  
  const updateStudent = async (updatedStudent: Omit<Student, 'results'>) => {
      await updateStudentDb(updatedStudent);
      await refreshStudents();
  };

  const deleteStudent = async (studentId: string) => {
    await deleteStudentDb(studentId);
    await refreshStudents();
  };

  return (
    <StudentsContext.Provider value={{ students, addStudent, updateStudent, deleteStudent, loading }}>
      {children}
    </StudentsContext.Provider>
  );
}

export function useStudents() {
  const context = useContext(StudentsContext);
  if (context === undefined) {
    throw new Error('useStudents must be used within a StudentsProvider');
  }
  return context;
}
