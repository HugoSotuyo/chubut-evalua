import Image from "next/image";
import Link from "next/link";
import { RegisterForm } from "@/components/register-form";
import { GraduationCap } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[400px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline">Crear una cuenta</h1>
            <p className="text-balance text-muted-foreground">
              Completa el formulario para registrarte en la plataforma.
            </p>
          </div>
          <RegisterForm />
          <div className="mt-4 text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/" className="underline">
              Iniciar sesión
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
          data-ai-hint="classroom teaching"
          className="h-auto w-full max-w-3xl rounded-lg object-cover shadow-2xl"
        />
        <p className="text-center text-primary-foreground/60 mt-8 text-sm">
          Fomentando la excelencia académica en cada rincón de la provincia.
        </p>
      </div>
    </div>
  );
}
