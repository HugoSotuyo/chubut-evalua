
import type { User } from "./types";
import { findUserByEmail, getAllUsers } from "./userService";

export type UserRole = "Evaluador" | "Referente" | "Administrador" | "Director" | "Docente";


// This is a mock authentication file.
// In a real application, you would use a proper authentication library
// and fetch user data from your backend.

const MOCK_USER_SESSION_KEY = 'currentUser';

export async function getAuthUser(): Promise<User | null> {
  // This is a server-side function, so we can't use sessionStorage.
  // This is a placeholder for real server-side session management.
  // For now, let's pretend the evaluator is always logged in for build purposes.
  try {
    const users = await getAllUsers();
    // In a real app, you'd get the current user from a session cookie.
    // For this build, we will simulate a default user for static generation.
    // Let's find the evaluator user, or any user, to avoid build errors.
    const user = users.find(u => u.role === "Evaluador") || users[0] || null;
    return user;
  } catch (error) {
    console.error("Failed to get auth user for static build", error);
    return null;
  }
}
