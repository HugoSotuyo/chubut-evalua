
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
  addStudent: (student: NewStudent) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  loading: boolean;
}

const StudentsContext = createContext<StudentsContextType | undefined>(undefined);

export function StudentsProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const studentsCollection = collection(db, 'students');
      const studentsSnapshot = await getDocs(studentsCollection);
      const studentsList = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
      setStudents(studentsList);
    } catch (error) {
      console.error("Error fetching students from Firestore:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const addStudent = async (studentData: NewStudent) => {
    try {
      const docRef = await addDoc(collection(db, 'students'), studentData);
      setStudents(prevStudents => [...prevStudents, { ...studentData, id: docRef.id }]);
    } catch (error) {
      console.error("Error adding student to Firestore:", error);
    }
  };

  const deleteStudent = async (studentId: string) => {
    try {
      await deleteDoc(doc(db, 'students', studentId));
      setStudents(prevStudents => prevStudents.filter(student => student.id !== studentId));
    } catch (error) {
      console.error("Error deleting student from Firestore:", error);
    }
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
