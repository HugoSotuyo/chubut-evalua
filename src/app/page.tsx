import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { GraduationCap } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline">Iniciar Sesión</h1>
            <p className="text-balance text-muted-foreground">
              Ingresa tu DNI/email y contraseña para acceder al sistema
            </p>
          </div>
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="underline">
              Regístrate
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-secondary lg:flex lg:items-center lg:justify-center lg:flex-col lg:p-12">
        <div className="flex items-center gap-4 text-primary-foreground mb-4">
          <GraduationCap className="h-12 w-12" />
          <h1 className="text-4xl font-bold font-headline">
            Sistema Evaluador Educativo
          </h1>
        </div>
        <p className="text-xl text-primary-foreground/80 font-medium text-center mb-8">
          Provincia de Chubut
        </p>
        <Image
          src="https://picsum.photos/1200/800"
          alt="Image"
          width="1200"
          height="800"
          data-ai-hint="education students"
          className="h-auto w-full max-w-3xl rounded-lg object-cover shadow-2xl"
        />
        <p className="text-center text-primary-foreground/60 mt-8 text-sm">
          Una herramienta para potenciar la educación a través del análisis de datos.
        </p>
      </div>
    </div>
  );
}
