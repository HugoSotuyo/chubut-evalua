
import EditarExamenForm from './edit-exam-form';

export async function generateStaticParams() {
  return [];
}

export default function EditarExamenPage({ params }: { params: { id: string } }) {
  return <EditarExamenForm examId={params.id} />;
}
