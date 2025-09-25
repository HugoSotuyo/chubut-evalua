
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { LoginForm } from "@/components/login-form";
import { GraduationCap } from "lucide-react";
import { SuspenseWrapper } from "@/components/suspense-wrapper";
import imageData from "@/lib/placeholder-images.json";
import { buildImageUrl } from "@/lib/utils";

type ImageData = {
  fileName: string;
  width: number;
  height: number;
  hint: string;
};

export default function LoginPage() {
  const [randomImage, setRandomImage] = useState<ImageData | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    const selectedImage = imageData[Math.floor(Math.random() * imageData.length)];
    setRandomImage(selectedImage);
    setImageUrl(buildImageUrl(selectedImage.fileName));
  }, []);

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
          <SuspenseWrapper>
            <LoginForm />
          </SuspenseWrapper>
          <div className="mt-4 text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="underline">
              Regístrate
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-secondary lg:flex lg:items-center lg:justify-center lg:flex-col lg:p-12">
        <div className="flex items-center gap-4 text-secondary-foreground mb-4">
          <GraduationCap className="h-12 w-12" />
          <h1 className="text-4xl font-bold font-headline">
            Chubut evalúa
          </h1>
        </div>
        <p className="text-xl text-secondary-foreground/80 font-medium text-center mb-8">
          Provincia de Chubut
        </p>
        {randomImage && imageUrl && (
          <Image
            src={imageUrl}
            alt="Imagen de la provincia de Chubut"
            width={randomImage.width}
            height={randomImage.height}
            data-ai-hint={randomImage.hint}
            className="h-auto w-full max-w-3xl rounded-lg object-cover shadow-2xl"
            priority
          />
        )}
        <p className="text-center text-secondary-foreground/60 mt-8 text-sm">
          Una herramienta para potenciar la educación a través del análisis de datos.
        </p>
      </div>
    </div>
  );
}
