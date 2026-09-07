import { Award } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `Objetivos de Calidad | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={Award}
      title="Objetivos de Calidad"
      description="Objetivos con meta, indicador asociado, responsable y frecuencia de seguimiento, con vista de cumplimiento mensual."
      phase="Fase 11"
      sectionLabel="Planificación"
    />
  );
}
