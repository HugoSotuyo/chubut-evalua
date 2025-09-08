

import type { UserRole } from "@/lib/auth";

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  school: string;
  status: "Activo" | "Pendiente" | "Inactivo";
  grade?: string;
  course?: string;
  dni?: string;
};

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

export type Student = {
  id: string;
  name: string;
  dni: string;
  grade: string;
  course: string;
  school: string;
  results?: Result[];
};

export type Result = {
  id: string;
  studentId: string;
  studentName: string;
  examId: string;
  examName: string;
  school: string;
  grade: string;
  course: string;
  status: "Aprobado" | "Desaprobado";
  score: number; // Percentage score
  scores: Record<number, number>; // Score per question
  totalScore: number;
  maxScore: number;
};

export type School = {
  id: string;
  name: string;
  district: string;
  status: "Activa" | "Inactiva";
};

export type Course = {
  id: string;
  grade: string;
  section: string;
  school: string;
};
