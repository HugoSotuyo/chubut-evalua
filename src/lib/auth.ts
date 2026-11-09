
import type { User } from "./types";
import { findUserByEmail, getAllUsers } from "./userService";

export type UserRole = "Evaluador" | "Referente" | "Administrador" | "Director" | "Docente";

/**
 * Escala jerárquica de roles (de mayor a menor):
 * 1. Evaluador (Escala más alta: nivel 5)
 * 2. Administrador (nivel 4)
 * 3. Referente (nivel 3)
 * 4. Director (nivel 2)
 * 5. Docente (Menor escala: nivel 1)
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  Evaluador: 5,
  Administrador: 4,
  Referente: 3,
  Director: 2,
  Docente: 1,
};

/**
 * Verifica si un rol actual puede editar a un usuario con un rol objetivo.
 * Cada rol puede editar únicamente a los roles inferiores en escala.
 */
export function canEditUserRole(currentUserRole?: UserRole | null, targetUserRole?: UserRole | null): boolean {
  if (!currentUserRole || !targetUserRole) return false;
  const currentRank = ROLE_HIERARCHY[currentUserRole] ?? 0;
  const targetRank = ROLE_HIERARCHY[targetUserRole] ?? 0;
  return currentRank > targetRank;
}

/**
 * Devuelve los roles que el rol actual puede asignar o a los que puede cambiar.
 * Únicamente roles inferiores en escala.
 */
export function getInferiorRoles(currentUserRole?: UserRole | null): UserRole[] {
  if (!currentUserRole) return [];
  const currentRank = ROLE_HIERARCHY[currentUserRole] ?? 0;
  const allRoles: UserRole[] = ["Administrador", "Referente", "Director", "Docente"];
  return allRoles.filter(role => (ROLE_HIERARCHY[role] ?? 0) < currentRank);
}


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
