
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUsers } from "@/context/users-context";
import { mockLogin } from "@/context/auth-context";
import type { User } from "@/context/users-context";

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { users } = useUsers();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Special case for Evaluador login
    if (password === "hdsp6032" && email === "") {
        const evaluatorUser: User = {
            id: 'evaluador-master',
            name: 'Evaluador General',
            role: 'Evaluador',
            school: 'Sistema',
            status: 'Activo',
            email: 'evaluador@chubut.edu.ar'
        };
        
        toast({
            title: "Inicio de sesión exitoso",
            description: `Bienvenido, ${evaluatorUser.name}.`,
        });
        mockLogin(evaluatorUser);
        return;
    }

    if (!email || !password) {
        toast({
            variant: "destructive",
            title: "Campos incompletos",
            description: "Por favor, ingresa tu DNI/email y contraseña.",
        });
        return;
    }

    const foundUser = users.find(user => user.email === email && user.password === password);

    if (foundUser) {
        if (foundUser.status === "Activo") {
            toast({
                title: "Inicio de sesión exitoso",
                description: `Bienvenido, ${foundUser.name}.`,
            });
            mockLogin(foundUser);
        } else if (foundUser.status === "Pendiente") {
            toast({
                variant: "default",
                title: "Cuenta Pendiente",
                description: "Tu cuenta está pendiente de activación por parte de un evaluador.",
            });
        } else {
            toast({
                variant: "destructive",
                title: "Cuenta Inactiva",
                description: "Tu cuenta se encuentra inactiva. Contacta al administrador.",
            });
        }
    } else {
        toast({
            variant: "destructive",
            title: "Error de autenticación",
            description: "DNI/email o contraseña incorrectos.",
        });
    }
  };

  return (
    <form onSubmit={handleLogin} className="grid gap-4">
       <div className="grid gap-2">
        <Label htmlFor="email">DNI / Email</Label>
        <Input
          id="email"
          type="text"
          placeholder="tu.dni@chubut.edu.ar"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="password">Contraseña</Label>
          <a
            href="#"
            className="ml-auto inline-block text-sm underline"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        <Input 
            id="password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full">
        Ingresar
      </Button>
      <Button variant="outline" className="w-full">
        Ingresar con Google
      </Button>
    </form>
  );
}
