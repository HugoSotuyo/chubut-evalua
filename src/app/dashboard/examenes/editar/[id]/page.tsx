import EditExamForm from "./edit-exam-form";

// This is required for static export with dynamic routes.
export function generateStaticParams() {
  // We don't want to pre-render any pages at build time.
  // They will be rendered on the client.
  return [];
}

export default function EditarExamenPage({ params }: { params: { id: string } }) {
    return <EditExamForm params={params} />;
}
