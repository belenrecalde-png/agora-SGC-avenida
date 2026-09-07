import { MessageSquare } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `Sugerencias | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={MessageSquare}
      title="Sugerencias"
      description="Propuestas o recomendaciones de cualquier colaborador, con seguimiento de evaluación hasta su implementación."
      phase="Fase 3 y 7"
      sectionLabel="Gestión de Calidad"
    />
  );
}
