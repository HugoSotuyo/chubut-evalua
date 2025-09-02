
// This is a mock authentication file.
// In a real application, you would use a proper authentication library
// and fetch user data from your backend.

export type UserRole = "Evaluador" | "Referente" | "Administrador" | "Director" | "Docente";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  school: string;
  grade?: string;
  course?: string;
}
