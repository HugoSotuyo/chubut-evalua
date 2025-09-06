
import type { Student } from "@/context/students-context";

const initialStudents: Student[] = [
    { id: '1', name: 'Juan Perez', dni: '40123456', grade: '3er Grado', course: 'A', school: 'Escuela N° 123' },
    { id: '2', name: 'Maria Lopez', dni: '41987654', grade: '3er Grado', course: 'A', school: 'Escuela N° 123' },
    { id: '3', name: 'Pedro Gonzalez', dni: '42345678', grade: '5to Grado', course: 'B', school: 'Escuela N° 456' },
];

export async function getStudents(): Promise<Student[]> {
    return Promise.resolve(initialStudents);
}
