
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

let currentUser: User = {
    name: "Evaluador Principal",
    email: "evaluador@chubut.edu.ar",
    role: "Evaluador",
    avatar: "https://i.pravatar.cc/150?u=evaluador@chubut.edu.ar",
};

export const getMockUser = (): User => {
  // You can change the role here to test different user views
  if (typeof window !== 'undefined') {
    const storedUser = window.sessionStorage.getItem('currentUser');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
  }
  return currentUser;
};


export const setMockUser = (user: User | null) => {
    if (user) {
        currentUser = user;
        if (typeof window !== 'undefined') {
            window.sessionStorage.setItem('currentUser', JSON.stringify(user));
        }
    } else {
         currentUser = {
            name: "Evaluador Principal",
            email: "evaluador@chubut.edu.ar",
            role: "Evaluador",
            avatar: "https://i.pravatar.cc/150?u=evaluador@chubut.edu.ar",
        };
        if (typeof window !== 'undefined') {
            window.sessionStorage.removeItem('currentUser');
        }
    }
}
