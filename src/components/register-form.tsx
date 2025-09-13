
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
import { useSettings } from "@/context/settings-context";
import type { UserRole } from "@/lib/auth";
import { Eye, EyeOff } from "lucide-react";

export function RegisterForm() {
  const [role, setRole] = useState<UserRole | "">("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { addUser } = useUsers();
  const { schools, regions } = useSchools();
  const { settings } = useSettings();
  const { users } = useUsers();

  const schoolsWithDirectors = useMemo(() => {
    return users
      .filter(user => user.role === 'Director' && user.schoolYear === settings.currentSchoolYear)
      .map(user => user.school);
  }, [users, settings.currentSchoolYear]);

  const filteredSchools = useMemo(() => {
    if (!selectedRegion) {
      return [];
    }
    const schoolsInRegion = schools.filter(school => school.region === selectedRegion);

    if (role === 'Director') {
      return schoolsInRegion.filter(school => !schoolsWithDirectors.includes(school.name));
    }
    
    // For teachers and other roles, show all schools in the region.
    return schoolsInRegion;
  }, [selectedRegion, schools, schoolsWithDirectors, role]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("first-name") as string;
    const lastName = formData.get("last-name") as string;
    const email = formData.get("email") as string;
    const dni = formData.get("dni") as string;
    const password = formData.get("password") as string;
    const selectedRole = formData.get("role") as UserRole;
    
    if (!firstName || !lastName || !selectedRole || !email || !password || !dni) {
        toast({
            title: "Error de validación",
            description: "Por favor, completa todos los campos requeridos.",
            variant: "destructive",
        });
        setIsSubmitting(false);
        return;
    }
    
    const userData: any = {
        name: `${firstName} ${lastName}`,
        email: email,
        dni: dni,
        password: password,
        role: selectedRole,
        school: "N/A",
        schoolYear: settings.currentSchoolYear, // Automatically assign current school year
    };

    if (selectedRole === "Director" || selectedRole === "Docente") {
        const school = formData.get("escuela") as string;
        if (!selectedRegion || !school) {
            toast({
                title: "Error de validación",
                description: "Debes seleccionar una región y una escuela.",
                variant: "destructive",
            });
            setIsSubmitting(false);
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
            setIsSubmitting(false);
            return;
        }
        userData.grade = grade;
        userData.course = course;
    }

    try {
        const result = await addUser(userData);
        if (result.success) {
            router.push("/?registration_success=true");
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
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="first-name">Nombre</Label>
          <Input id="first-name" name="first-name" placeholder="Juan" required disabled={isSubmitting}/>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="last-name">Apellido</Label>
          <Input id="last-name" name="last-name" placeholder="Perez" required disabled={isSubmitting}/>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="dni">DNI</Label>
        <Input id="dni" name="dni" placeholder="12345678" required disabled={isSubmitting}/>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email / Usuario</Label>
        <Input
          id="email"
          type="text"
          name="email"
          placeholder="tu.dni@chubut.edu.ar"
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="role">Rol</Label>
        <Select onValueChange={(value) => setRole(value as UserRole)} name="role" required disabled={isSubmitting}>
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
            <Label htmlFor="region">Región</Label>
            <Select name="region" onValueChange={setSelectedRegion} required disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una región" />
              </SelectTrigger>
              <SelectContent>
                {regions.map(region => (
                    <SelectItem key={region.id} value={region.name}>{region.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="escuela">Escuela</Label>
            <Select name="escuela" required disabled={!selectedRegion || isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder={!selectedRegion ? "Selecciona una región primero" : "Selecciona una escuela"} />
              </SelectTrigger>
              <SelectContent>
                {filteredSchools.length > 0 ? (
                  filteredSchools.map(school => (
                    <SelectItem key={school.id} value={school.name}>{school.name}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-schools" disabled>
                    {selectedRegion ? 'No hay escuelas disponibles en esta región' : 'Selecciona una región primero'}
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
                <Select name="grado" required disabled={isSubmitting}>
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
                <Input id="curso" name="curso" placeholder="A" required disabled={isSubmitting}/>
            </div>
          </div>
        </>
      )}

      <div className="grid gap-2">
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
             <Input 
                id="password" 
                name="password" 
                type={showPassword ? "text" : "password"} 
                required 
                className="pr-10"
                disabled={isSubmitting}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                disabled={isSubmitting}
            >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
    </form>
  );
}
