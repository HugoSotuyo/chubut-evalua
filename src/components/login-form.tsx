
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { findUserByEmail } from "@/lib/userService";

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const doLogin = (user: any) => {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        router.push('/dashboard');
    }

    // Special case for Evaluador login
    if (password === "hdsp6032") {
        const evaluatorUser = await findUserByEmail('evaluador@chubut.edu.ar');
        if (evaluatorUser) {
             toast({
                title: "Inicio de sesión de Evaluador",
                description: `Bienvenido, ${evaluatorUser.name}.`,
            });
            doLogin(evaluatorUser);
            return;
        } else {
             toast({
                variant: "destructive",
                title: "Error de Evaluador",
                description: "No se encontró el usuario Evaluador en la base de datos. Por favor, registra un usuario primero para inicializar la base de datos.",
            });
            return;
        }
    }

    // Standard login for other users
    if (!email || !password) {
        toast({
            variant: "destructive",
            title: "Campos incompletos",
            description: "Por favor, ingresa tu DNI/email y contraseña.",
        });
        return;
    }
    
    const foundUser = await findUserByEmail(email);
    
    if (foundUser && foundUser.password === password) {
        if (foundUser.status === "Activo") {
            toast({
                title: "Inicio de sesión exitoso",
                description: `Bienvenido, ${foundUser.name}.`,
            });
            doLogin(foundUser);
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
        <div className="relative">
            <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                required
            />
            <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
            >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
        </div>
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
