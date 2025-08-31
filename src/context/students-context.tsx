
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

interface StudentsContextType {
  students: Student[];
  addStudent: (student: NewStudent) => void;
  deleteStudent: (studentId: string) => void;
}

const StudentsContext = createContext<StudentsContextType | undefined>(undefined);

const initialStudents: Student[] = [
    { id: "alu-001", name: "Juan Pérez", dni: "45.123.456", grade: "5to Grado", course: "A", school: "Escuela N° 101" },
    { id: "alu-002", name: "María García", dni: "46.789.012", grade: "5to Grado", course: "A", school: "Escuela N° 101" },
    { id: "alu-003", name: "Pedro Rodríguez", dni: "44.555.666", grade: "4to Grado", course: "B", school: "Escuela N° 789" },
    { id: "alu-004", name: "Ana Martínez", dni: "45.987.654", grade: "6to Grado", course: "C", school: "Escuela N° 101" },
];

const LOCAL_STORAGE_KEY = 'chubut-evalua-students';

export function StudentsProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedStudents = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      setStudents(storedStudents ? JSON.parse(storedStudents) : initialStudents);
    } catch (error) {
      console.error("Error reading from localStorage", error);
      setStudents(initialStudents);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(students));
      } catch (error) {
        console.error("Error writing to localStorage", error);
      }
    }
  }, [students, isInitialized]);

  const addStudent = (studentData: NewStudent) => {
    const newStudent: Student = {
        ...studentData,
        id: `alu-${Date.now()}`,
    }
    setStudents(prevStudents => [...prevStudents, newStudent]);
  };

  const deleteStudent = (studentId: string) => {
    setStudents(prevStudents => prevStudents.filter(student => student.id !== studentId));
  };

  return (
    <StudentsContext.Provider value={{ students, addStudent, deleteStudent }}>
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
