
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { RegisterForm } from "@/components/register-form";
import { GraduationCap } from "lucide-react";
import imageData from "@/lib/placeholder-images.json";

type ImageData = {
  fileName: string;
  width: number;
  height: number;
  hint: string;
};

const buildImageUrl = (fileName: string) => {
    const bucketName = "chubut-evala.appspot.com";
    const token = "e1a8e1b0-1b1e-4b4b-8c1e-1b1e1b1e1b1e";
    return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/login-backgrounds%2F${fileName}?alt=media&token=${token}`;
}

export default function RegisterPage() {
  const [randomImage, setRandomImage] = useState<ImageData | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    const selectedImage = imageData[Math.floor(Math.random() * imageData.length)];
    setRandomImage(selectedImage);
    setImageUrl(buildImageUrl(selectedImage.fileName));
  }, []);

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
          Fomentando la excelencia académica en cada rincón de la provincia.
        </p>
      </div>
    </div>
  );
}
