// This is a mock authentication file.
// In a real application, you would use a proper authentication library
// and fetch user data from your backend.

export type UserRole = "Evaluador" | "Referente" | "Administrador" | "Director" | "Docente";

export interface User {
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export const getMockUser = (): User => {
  // You can change the role here to test different user views
  return {
    name: "Evaluador Principal",
    email: "evaluador@chubut.edu.ar",
    role: "Evaluador",
    avatar: "https://i.pravatar.cc/150?u=evaluador@chubut.edu.ar",
  };
};
