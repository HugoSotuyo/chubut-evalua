
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Result } from './results-context';

export type Student = {
  id: string;
  name: string;
  dni: string;
  grade: string;
  course: string;
  school: string;
  results?: Result[];
};

type NewStudent = Omit<Student, 'id' | 'results'>;

const initialStudents: Student[] = [
    { id: '1', name: 'Juan Perez', dni: '40123456', grade: '3er Grado', course: 'A', school: 'Escuela N° 123' },
    { id: '2', name: 'Maria Lopez', dni: '41987654', grade: '3er Grado', course: 'A', school: 'Escuela N° 123' },
    { id: '3', name: 'Pedro Gonzalez', dni: '42345678', grade: '5to Grado', course: 'B', school: 'Escuela N° 456' },
];

interface StudentsContextType {
  students: Student[];
  addStudent: (student: NewStudent) => void;
  deleteStudent: (studentId: string) => void;
  loading: boolean;
}

const StudentsContext = createContext<StudentsContextType | undefined>(undefined);

const STUDENTS_STORAGE_KEY = 'chubut_evalua_students';

export function StudentsProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedStudents = localStorage.getItem(STUDENTS_STORAGE_KEY);
      if (storedStudents) {
        setStudents(JSON.parse(storedStudents));
      } else {
        setStudents(initialStudents);
        localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(initialStudents));
      }
    } catch (error) {
      console.error("Failed to access localStorage for students:", error);
      setStudents(initialStudents);
    }
    setLoading(false);
  }, []);

  const updateStudentsInStateAndStorage = (newStudents: Student[]) => {
    setStudents(newStudents);
    try {
      localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(newStudents));
    } catch (error) {
      console.error("Failed to save students to localStorage:", error);
    }
  };

  const addStudent = (studentData: NewStudent) => {
    const newStudent: Student = {
        ...studentData,
        id: (Math.max(0, ...students.map(s => parseInt(s.id, 10))) + 1).toString(),
    };
    updateStudentsInStateAndStorage([...students, newStudent]);
  };

  const deleteStudent = (studentId: string) => {
    const newStudents = students.filter(student => student.id !== studentId);
    updateStudentsInStateAndStorage(newStudents);
  };

  return (
    <StudentsContext.Provider value={{ students, addStudent, deleteStudent, loading }}>
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
