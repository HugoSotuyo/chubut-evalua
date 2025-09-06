
"use client"
import type { Exam } from "@/lib/types";

let exams: Exam[] = [
    { id: '1', name: 'Diagnóstico Matemática 2024', tema: 'Matemática', grade: '3er Grado', created: '2024-05-10', status: 'Cerrado', questions: [{ consigna: '2+2', respuesta: '4', puntaje: 10 }, { consigna: '5*5', respuesta: '25', puntaje: 15 }] },
    { id: '2', name: 'Prácticas del Lenguaje - 1er Trimestre', tema: 'Lengua', grade: '3er Grado', created: '2024-04-22', status: 'Cerrado', questions: [{ consigna: 'Capital de Argentina', respuesta: 'Buenos Aires', puntaje: 10 }] },
    { id: '3', name: 'Ciencias Naturales - Seres Vivos', tema: 'Naturales', grade: '5to Grado', created: '2024-06-01', status: 'Abierto', questions: [{ consigna: 'Planeta Tierra es el...', respuesta: '3ro', puntaje: 10 }] },
];

if (typeof window !== 'undefined') {
  const storedExams = localStorage.getItem('chubut_evalua_exams');
  if (storedExams) {
    exams = JSON.parse(storedExams);
  } else {
    localStorage.setItem('chubut_evalua_exams', JSON.stringify(exams));
  }
}

export function getExamsSync(): Exam[] {
  if (typeof window !== 'undefined') {
    const storedExams = localStorage.getItem('chubut_evalua_exams');
    return storedExams ? JSON.parse(storedExams) : exams;
  }
  return exams;
}

export function saveExamsSync(updatedExams: Exam[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('chubut_evalua_exams', JSON.stringify(updatedExams));
    exams = updatedExams;
  }
}

export async function getExams(): Promise<Exam[]> {
  return Promise.resolve(getExamsSync());
}

export async function getExamById(id: string): Promise<Exam | undefined> {
    const currentExams = getExamsSync();
    return currentExams.find(e => e.id === id);
}

export async function addExam(examData: Omit<Exam, 'id' | 'status'>): Promise<Exam> {
  const currentExams = getExamsSync();
  const newExam: Exam = {
    ...examData,
    id: (Math.max(...currentExams.map(e => parseInt(e.id, 10)), 0) + 1).toString(),
    status: "Abierto",
  };
  saveExamsSync([...currentExams, newExam]);
  return newExam;
}

export async function updateExam(updatedExamData: Omit<Exam, 'status'>): Promise<Exam> {
  let currentExams = getExamsSync();
  let examToUpdate: Exam | undefined;
  
  const newExams = currentExams.map(exam => {
    if (exam.id === updatedExamData.id) {
      examToUpdate = { ...exam, ...updatedExamData };
      return examToUpdate;
    }
    return exam;
  });

  saveExamsSync(newExams);
  if (!examToUpdate) throw new Error("Exam not found for update");
  return examToUpdate;
}

export async function deleteExam(examId: string): Promise<void> {
  const currentExams = getExamsSync();
  const newExams = currentExams.filter(exam => exam.id !== examId);
  saveExamsSync(newExams);
}

export async function toggleExamStatus(examId: string): Promise<void> {
  const currentExams = getExamsSync();
  const newExams = currentExams.map(exam =>
    exam.id === examId
      ? { ...exam, status: exam.status === "Abierto" ? "Cerrado" : "Abierto" }
      : exam
  );
  saveExamsSync(newExams);
}
