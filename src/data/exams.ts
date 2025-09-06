
import type { Exam } from "@/lib/types";

const initialExams: Exam[] = [
    { id: '1', name: 'Diagnóstico Matemática 2024', tema: 'Matemática', grade: '3er Grado', created: '2024-05-10', status: 'Cerrado', questions: [{ consigna: '2+2', respuesta: '4', puntaje: 10 }, { consigna: '5*5', respuesta: '25', puntaje: 15 }] },
    { id: '2', name: 'Prácticas del Lenguaje - 1er Trimestre', tema: 'Lengua', grade: '3er Grado', created: '2024-04-22', status: 'Cerrado', questions: [{ consigna: 'Capital de Argentina', respuesta: 'Buenos Aires', puntaje: 10 }] },
    { id: '3', name: 'Ciencias Naturales - Seres Vivos', tema: 'Naturales', grade: '5to Grado', created: '2024-06-01', status: 'Abierto', questions: [{ consigna: 'Planeta Tierra es el...', respuesta: '3ro', puntaje: 10 }] },
];

// Mock function to simulate fetching data from a database or API
export async function getExams(): Promise<Exam[]> {
  // In a real app, you'd fetch this from your DB.
  // For now, we return a static list.
  return Promise.resolve(initialExams);
}

export async function getExamById(id: string): Promise<Exam | undefined> {
    const exams = await getExams();
    return exams.find(e => e.id === id);
}
