

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
  schoolYear: string;
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
  schoolYear: string;
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
  districtId: string;
  status: "Activa" | "Inactiva";
};

export type District = {
    id: string;
    name: string;
};

export type AuditAction = 
  | "CREAR_EXAMEN"
  | "EDITAR_EXAMEN"
  | "ELIMINAR_EXAMEN"
  | "CAMBIAR_ESTADO_EXAMEN"
  | "ALTA_USUARIO_PENDIENTE"
  | "HABILITAR_USUARIO"
  | "EDITAR_USUARIO"
  | "ELIMINAR_USUARIO"
  | "CAMBIAR_CONTRASENA"
  | "CREAR_ESCUELA"
  | "EDITAR_ESCUELA"
  | "ELIMINAR_ESCUELA"
  | "CAMBIAR_ESTADO_ESCUELA"
  | "CREAR_DISTRITO"
  | "ELIMINAR_DISTRITO"
  | "ACTUALIZAR_PARAMETROS";

export type AuditLog = {
    id: string;
    user: string;
    action: AuditAction;
    details: string;
    timestamp: string; // ISO 8601 string
};

export type SystemSettings = {
    approvalThreshold: number;
    currentSchoolYear: string;
    correctScore: number;
    partialScore: number;
    incorrectScore: number;
    defaultScore: number;
    scoreStep: number;
};
