
import { Suspense } from "react";
import EditForm from "./edit-form";

// This function is required for static export with dynamic routes.
// It tells Next.js not to pre-render any specific exam pages at build time.
// They will be rendered on the client side.
export async function generateStaticParams() {
  return [];
}

export default function EditarExamenPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <EditForm params={params} />
    </Suspense>
  );
}
