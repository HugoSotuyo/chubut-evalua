
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
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

export function StudentsProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [loading] = useState(false);

  const addStudent = (studentData: NewStudent) => {
    const newStudent: Student = {
        ...studentData,
        id: (students.length + 1).toString(),
    };
    setStudents(prev => [...prev, newStudent]);
  };

  const deleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(student => student.id !== studentId));
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
