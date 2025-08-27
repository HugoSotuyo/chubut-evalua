"use client";

import { useState } from "react";
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

export function RegisterForm() {
  const [role, setRole] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Registro exitoso",
      description: "Tu cuenta ha sido creada. Un administrador revisará tu solicitud.",
    });
    router.push("/");
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="first-name">Nombre</Label>
          <Input id="first-name" placeholder="Juan" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="last-name">Apellido</Label>
          <Input id="last-name" placeholder="Perez" required />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="dni">DNI</Label>
        <Input id="dni" placeholder="12345678" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="tu.email@ejemplo.com"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="role">Rol</Label>
        <Select onValueChange={setRole} required>
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

      {role === "Director" && (
        <>
          <div className="grid gap-2">
            <Label htmlFor="distrito">Distrito</Label>
            <Select required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un distrito" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Distrito I</SelectItem>
                <SelectItem value="2">Distrito II</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="escuela-director">Escuela</Label>
            <Select required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una escuela" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="101">Escuela N° 101</SelectItem>
                <SelectItem value="102">Escuela N° 102</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {role === "Docente" && (
        <>
          <div className="grid gap-2">
            <Label htmlFor="distrito-docente">Distrito</Label>
            <Select required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un distrito" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Distrito I</SelectItem>
                <SelectItem value="2">Distrito II</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="escuela-docente">Escuela</Label>
            <Select required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una escuela" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="101">Escuela N° 101</SelectItem>
                <SelectItem value="102">Escuela N° 102</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="grado">Grado</Label>
                <Select required>
                <SelectTrigger>
                    <SelectValue placeholder="Grado" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="1">1er Grado</SelectItem>
                    <SelectItem value="2">2do Grado</SelectItem>
                    <SelectItem value="3">3er Grado</SelectItem>
                </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="curso">Curso</Label>
                <Select required>
                <SelectTrigger>
                    <SelectValue placeholder="Curso" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="a">"A"</SelectItem>
                    <SelectItem value="b">"B"</SelectItem>
                    <SelectItem value="c">"C"</SelectItem>
                </SelectContent>
                </Select>
            </div>
          </div>
        </>
      )}

      <div className="grid gap-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" type="password" required />
      </div>
      <Button type="submit" className="w-full">
        Crear cuenta
      </Button>
    </form>
  );
}
