import CargarResultadosForm from './cargar-resultados-form';

export async function generateStaticParams() {
  // Devolvemos un array vacío para indicar que las páginas se generarán
  // dinámicamente en el cliente y no durante la compilación estática.
  return [];
}

export default function CargarResultadosPage({ params }: { params: { studentId: string } }) {
  return <CargarResultadosForm studentId={params.studentId} />;
}
