
import type { Result } from "@/lib/types";

const initialResults: Result[] = [
    { id: '1', studentId: '1', studentName: 'Juan Perez', examId: '1', examName: 'Diagnóstico Matemática 2024', school: 'Escuela N° 123', grade: '3er Grado', course: 'A', status: 'Aprobado', score: 80, scores: {0: 8, 1: 12}, totalScore: 20, maxScore: 25 },
    { id: '2', studentId: '2', studentName: 'Maria Lopez', examId: '1', examName: 'Diagnóstico Matemática 2024', school: 'Escuela N° 123', grade: '3er Grado', course: 'A', status: 'Desaprobado', score: 40, scores: {0: 5, 1: 5}, totalScore: 10, maxScore: 25},
    { id: '3', studentId: '1', studentName: 'Juan Perez', examId: '2', examName: 'Prácticas del Lenguaje - 1er Trimestre', school: 'Escuela N° 123', grade: '3er Grado', course: 'A', status: 'Aprobado', score: 100, scores: {0: 10}, totalScore: 10, maxScore: 10 },
];

export async function getResults(): Promise<Result[]> {
    return Promise.resolve(initialResults);
}
