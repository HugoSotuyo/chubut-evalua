
import CargarResultadosForm from "./cargar-resultados-form";

// This is required for static export with dynamic routes.
export function generateStaticParams() {
  // We don't want to pre-render any pages at build time.
  // They will be rendered on the client.
  return [];
}

export default function CargarResultadosPage({ params }: { params: { studentId: string } }) {
  return <CargarResultadosForm params={params} />;
}
