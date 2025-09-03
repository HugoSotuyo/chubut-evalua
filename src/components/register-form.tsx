
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUsers } from "@/context/users-context";
import { useSchools } from "@/context/schools-context";
import type { UserRole } from "@/lib/auth";
import type { User } from "@/context/users-context";
import { addUser, getAllUsers, seedInitialUsers } from "@/lib/userService";


export function RegisterForm() {
  const [role, setRole] = useState<UserRole | "">("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const { users } = useUsers();
  const { schools, districts } = useSchools();

  const schoolsWithDirectors = useMemo(() => {
    return users
      .filter(user => user.role === 'Director')
      .map(user => user.school);
  }, [users]);

  const filteredSchools = useMemo(() => {
    if (!selectedDistrict) {
      return [];
    }
    const schoolsInDistrict = schools.filter(school => school.district === selectedDistrict);

    if (role === 'Director') {
      return schoolsInDistrict.filter(school => !schoolsWithDirectors.includes(school.name));
    }
    
    // For teachers and other roles, show all schools in the district.
    return schoolsInDistrict;
  }, [selectedDistrict, schools, schoolsWithDirectors, role]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("first-name") as string;
    const lastName = formData.get("last-name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const selectedRole = formData.get("role") as UserRole;
    
    if (!firstName || !lastName || !selectedRole || !email || !password) {
        toast({
            title: "Error de validación",
            description: "Por favor, completa todos los campos requeridos.",
            variant: "destructive",
        });
        return;
    }
    
    const userData: any = {
        name: `${firstName} ${lastName}`,
        email: email,
        password: password,
        role: selectedRole,
        school: "N/A",
        status: "Pendiente"
    };

    if (selectedRole === "Director" || selectedRole === "Docente") {
        const school = formData.get("escuela") as string;
        if (!selectedDistrict || !school) {
            toast({
                title: "Error de validación",
                description: "Debes seleccionar un distrito y una escuela.",
                variant: "destructive",
            });
            return;
        }
        userData.school = school;
    }
    
    if (selectedRole === "Docente") {
        const grade = formData.get("grado") as string;
        const course = formData.get("curso") as string;
        if (!grade || !course) {
             toast({
                title: "Error de validación",
                description: "Debes seleccionar un grado y un curso.",
                variant: "destructive",
            });
            return;
        }
        userData.grade = grade;
        userData.course = course;
    }

    try {
        // --- Seeding Logic ---
        const existingUsers = await getAllUsers();
        if (existingUsers.length === 0) {
            console.log("Database is empty, seeding initial users...");
            await seedInitialUsers();
            console.log("Seeding complete.");
        }
        // --- End Seeding Logic ---

        const result = await addUser(userData);
        if (result.success) {
            toast({
            title: "Registro exitoso",
            description: "Tu cuenta ha sido creada. Un evaluador revisará tu solicitud.",
            });
            router.push("/");
        } else {
            toast({
                title: "Error en el registro",
                description: result.message,
                variant: "destructive",
            });
        }
    } catch (error) {
        toast({
            title: "Error de Servidor",
            description: "No se pudo completar el registro. Inténtalo de nuevo.",
            variant: "destructive"
        });
        console.error("Registration failed:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="first-name">Nombre</Label>
          <Input id="first-name" name="first-name" placeholder="Juan" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="last-name">Apellido</Label>
          <Input id="last-name" name="last-name" placeholder="Perez" required />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="dni">DNI</Label>
        <Input id="dni" name="dni" placeholder="12345678" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email / Usuario</Label>
        <Input
          id="email"
          type="text"
          name="email"
          placeholder="tu.dni@chubut.edu.ar"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="role">Rol</Label>
        <Select onValueChange={(value) => setRole(value as UserRole)} name="role" required>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona tu rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Referente">Referente</SelectItem>
            <SelectItem value="Administrador">Administrador</SelectItem>
            <SelectItem value="Director">Director</SelectItem>
            <SelectItem value="Docente">Docente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(role === "Director" || role === "Docente") && (
        <>
          <div className="grid gap-2">
            <Label htmlFor="distrito">Distrito</Label>
            <Select name="distrito" onValueChange={setSelectedDistrict} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un distrito" />
              </SelectTrigger>
              <SelectContent>
                {districts.map(district => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="escuela">Escuela</Label>
            <Select name="escuela" required disabled={!selectedDistrict}>
              <SelectTrigger>
                <SelectValue placeholder={!selectedDistrict ? "Selecciona un distrito primero" : "Selecciona una escuela"} />
              </SelectTrigger>
              <SelectContent>
                {filteredSchools.length > 0 ? (
                  filteredSchools.map(school => (
                    <SelectItem key={school.id} value={school.name}>{school.name}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-schools" disabled>
                    {selectedDistrict ? 'No hay escuelas disponibles en este distrito' : 'Selecciona un distrito primero'}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {role === "Docente" && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="grado">Grado</Label>
                <Select name="grado" required>
                <SelectTrigger>
                    <SelectValue placeholder="Grado" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="1er Grado">1er Grado</SelectItem>
                    <SelectItem value="2do Grado">2do Grado</SelectItem>
                    <SelectItem value="3er Grado">3er Grado</SelectItem>
                    <SelectItem value="4to Grado">4to Grado</SelectItem>
                    <SelectItem value="5to Grado">5to Grado</SelectItem>
                    <SelectItem value="6to Grado">6to Grado</SelectItem>
                </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="curso">Curso</Label>
                <Input id="curso" name="curso" placeholder="A" required />
            </div>
          </div>
        </>
      )}

      <div className="grid gap-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      <Button type="submit" className="w-full">
        Crear cuenta
      </Button>
    </form>
  );
}
