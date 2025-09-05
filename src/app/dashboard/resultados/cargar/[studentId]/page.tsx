
import CargarResultadosForm from './cargar-resultados-form';

// This function is required by Next.js for static exports of dynamic routes.
// We return an empty array because the actual rendering is dynamic on the client side.
export async function generateStaticParams() {
  return [];
}

export default function CargarResultadosPage({ params }: { params: { studentId: string } }) {
  return <CargarResultadosForm studentId={params.studentId} />;
}
