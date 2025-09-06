
import { Suspense } from "react";
import EditForm from "./edit-form";
import { getExamById } from "@/data/exams";
import { getAuthUser } from "@/lib/auth";

// This function is required for static export with dynamic routes.
// It tells Next.js not to pre-render any specific exam pages at build time.
// They will be rendered on the client side if not found here.
export async function generateStaticParams() {
  return [];
}

export default async function EditarExamenPage({ params }: { params: { id: string } }) {
  const examToEdit = await getExamById(params.id);
  const user = await getAuthUser();

  if (!examToEdit || !user) {
    return <div>Examen no encontrado o usuario no autenticado.</div>;
  }
  
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <EditForm exam={examToEdit} user={user} />
    </Suspense>
  );
}
