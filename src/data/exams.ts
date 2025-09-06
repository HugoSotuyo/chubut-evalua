
import type { Exam } from "@/lib/types";

const initialExams: Exam[] = [
    { id: '1', name: 'Diagnóstico Matemática 2024', tema: 'Matemática', grade: '3er Grado', created: '2024-05-10', status: 'Cerrado', questions: [{ consigna: '2+2', respuesta: '4', puntaje: 10 }, { consigna: '5*5', respuesta: '25', puntaje: 15 }] },
    { id: '2', name: 'Prácticas del Lenguaje - 1er Trimestre', tema: 'Lengua', grade: '3er Grado', created: '2024-04-22', status: 'Cerrado', questions: [{ consigna: 'Capital de Argentina', respuesta: 'Buenos Aires', puntaje: 10 }] },
    { id: '3', name: 'Ciencias Naturales - Seres Vivos', tema: 'Naturales', grade: '5to Grado', created: '2024-06-01', status: 'Abierto', questions: [{ consigna: 'Planeta Tierra es el...', respuesta: '3ro', puntaje: 10 }] },
];


export function getExamsSync(): Exam[] {
  if (typeof window !== 'undefined') {
    const storedExams = localStorage.getItem('chubut_evalua_exams');
    if (storedExams) {
        try {
            return JSON.parse(storedExams);
        } catch (e) {
            return initialExams;
        }
    }
  }
  return initialExams;
}

export function saveExamsSync(updatedExams: Exam[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('chubut_evalua_exams', JSON.stringify(updatedExams));
    // Optionally, you might want a way to notify other parts of the app
    window.dispatchEvent(new Event('storage'));
  }
}

export function addExam(examData: Omit<Exam, 'id' | 'status'>) {
  const currentExams = getExamsSync();
  const newExam: Exam = {
    ...examData,
    id: (Math.max(0, ...currentExams.map(e => parseInt(e.id, 10))) + 1).toString(),
    status: "Abierto",
  };
  saveExamsSync([...currentExams, newExam]);
}

export function updateExam(updatedExamData: Omit<Exam, 'status'>) {
  const currentExams = getExamsSync();
  const newExams = currentExams.map(exam =>
    exam.id === updatedExamData.id ? { ...exam, ...updatedExamData } : exam
  );
  saveExamsSync(newExams);
}


export function deleteExam(examId: string) {
  const currentExams = getExamsSync();
  const newExams = currentExams.filter(exam => exam.id !== examId);
  saveExamsSync(newExams);
}

export function toggleExamStatus(examId: string) {
  const currentExams = getExamsSync();
  const newExams = currentExams.map(exam =>
    exam.id === examId
      ? { ...exam, status: exam.status === "Abierto" ? "Cerrado" : "Abierto" }
      : exam
  );
  saveExamsSync(newExams);
}
