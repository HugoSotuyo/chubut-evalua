
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
}

const defaultUser: User = {
    id: "usr-006",
    name: "Evaluador Principal",
    email: "evaluador@chubut.edu.ar",
    role: "Evaluador",
    school: "N/A",
};

export const getMockUser = (): User => {
  if (typeof window !== 'undefined') {
    const storedUser = window.sessionStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Basic validation to ensure it's a user-like object
        if (parsedUser && parsedUser.id && parsedUser.name && parsedUser.role) {
          return parsedUser;
        }
      } catch (e) {
        console.error("Failed to parse user from sessionStorage", e);
        // Fallback to default user if parsing fails
        return defaultUser;
      }
    }
  }
  return defaultUser;
};


export const setMockUser = (user: User | null) => {
    if (typeof window !== 'undefined') {
        if (user) {
            window.sessionStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            window.sessionStorage.removeItem('currentUser');
        }
    }
}
