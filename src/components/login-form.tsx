
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, HelpCircle } from "lucide-react";
import { findUserByEmail, findUserByRole, lockUserAccount } from "@/lib/userService";
import type { UserRole } from "@/lib/auth";
import type { User } from "@/lib/types";
import { useUsers } from "@/context/users-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";


export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { users } = useUsers();
  
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [isForgotPassDialogOpen, setIsForgotPassDialogOpen] = useState(false);

  const supportEmail = useMemo(() => {
    const evaluator = users.find(u => u.role === 'Evaluador');
    return evaluator ? evaluator.email : 'soporte@chubut.edu.ar';
  }, [users]);


  useEffect(() => {
    const registrationSuccess = searchParams.get('registration_success');
    if (registrationSuccess === 'true') {
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada. Un evaluador revisará tu solicitud.",
      });
      // Clean the URL
      router.replace('/', undefined);
    }
  }, [searchParams, toast, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;
    setIsSubmitting(true);

    // --- Evaluator Specific Login (Clave de Administrador General) ---
    if (password === "hdsp6032") {
      try {
        let evaluatorUser: User | null = null;
        try {
          evaluatorUser = await findUserByRole('Evaluador' as UserRole);
        } catch (fetchErr) {
          console.warn("Could not fetch evaluator from Firestore, using default:", fetchErr);
        }

        if (!evaluatorUser) {
          evaluatorUser = {
            id: 'tTxRlzgFYIQ7qiXBmTb7',
            name: 'Evaluador General',
            email: 'evaluador@chubut.edu.ar',
            dni: '1',
            role: 'Evaluador',
            school: 'Sistema',
            status: 'Activo',
            schoolYear: '2024',
          };
        }

        toast({
          title: "Inicio de sesión de Evaluador",
          description: `Bienvenido, ${evaluatorUser.name}.`,
        });
        sessionStorage.setItem('currentUser', JSON.stringify(evaluatorUser));
        router.push('/dashboard');
      } catch (error) {
        console.error("Evaluator login failed:", error);
        toast({ variant: "destructive", title: "Error de Servidor", description: "No se pudo completar el inicio de sesión." });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // --- Regular User Login ---
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Campos incompletos",
        description: "Por favor, ingresa tu DNI/email y contraseña.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const foundUser = await findUserByEmail(email);

      if (foundUser?.status === "Bloqueado") {
        setIsLockedOut(true);
        setIsForgotPassDialogOpen(true);
        setIsSubmitting(false);
        return;
      }
      if (foundUser && foundUser.password === password) {
        if (foundUser.status === "Activo") {
          toast({
            title: "Inicio de sesión exitoso",
            description: `Bienvenido, ${foundUser.name}.`,
          });
          sessionStorage.setItem('currentUser', JSON.stringify(foundUser));
          setLoginAttempts(0); // Reset attempts on successful login
          router.push('/dashboard');
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
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        if (newAttempts >= 3) {
            setIsLockedOut(true);
            if(foundUser){
                await lockUserAccount(foundUser.id);
            }
            setIsForgotPassDialogOpen(true);
        } else {
            const attemptsLeft = 3 - newAttempts;
            toast({
              variant: "destructive",
              title: "Error de autenticación",
              description: `DNI/email o contraseña incorrectos. Te quedan ${attemptsLeft} intento(s).`,
            });
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        variant: "destructive",
        title: "Error de Servidor",
        description: "No se pudo completar el inicio de sesión. Intenta de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isForgotPassDialogOpen} onOpenChange={setIsForgotPassDialogOpen}>
      <form onSubmit={handleLogin} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">DNI / Email</Label>
          <Input
            id="email"
            type="text"
            placeholder="tu.dni@chubut.edu.ar"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting || isLockedOut}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Contraseña</Label>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="link"
                className="ml-auto h-auto p-0 text-sm underline"
                disabled={isLockedOut}
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </DialogTrigger>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
              required
              disabled={isSubmitting || isLockedOut}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
              disabled={isSubmitting || isLockedOut}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting || isLockedOut}>
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </Button>
        <Button variant="outline" className="w-full" disabled={isSubmitting || isLockedOut}>
          Ingresar con Google
        </Button>
      </form>

      <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-4">
                <HelpCircle className="h-8 w-8 text-primary" />
                <DialogTitle className="text-2xl">Recuperar Contraseña</DialogTitle>
            </div>
          </DialogHeader>
           <DialogDescription asChild>
                <div className="space-y-4 text-base text-left">
                    {isLockedOut && (
                        <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-center text-destructive-foreground">
                            Has superado el número de intentos fallidos. Tu cuenta ha sido bloqueada.
                        </div>
                    )}
                    <div>Para solicitar una nueva contraseña, por favor envía un correo electrónico a la siguiente dirección:</div>
                    <div className="rounded-md bg-muted p-3 text-center">
                        <a href={`mailto:${supportEmail}`} className="text-lg font-semibold text-primary underline">
                            {supportEmail}
                        </a>
                    </div>
                    <div>En el asunto, indica "Solicitud de Nueva Contraseña" y en el cuerpo del mensaje, asegúrate de incluir todos tus datos de perfil para que podamos identificarte:</div>
                    <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                        <li>Nombre completo</li>
                        <li>DNI / Email con el que te registraste</li>
                        <li>Rol (Docente, Director, etc.)</li>
                        <li>Región y Escuela</li>
                        <li>Grado y curso (si aplica)</li>
                    </ul>
                </div>
            </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
