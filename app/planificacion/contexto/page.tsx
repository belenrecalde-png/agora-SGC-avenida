import { Compass } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `Contexto | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={Compass}
      title="Contexto"
      description="Cuestiones internas y externas de la organización: análisis FODA/CAME y evaluación de pertinencia del cambio climático para el SGC."
      phase="Fase 9"
      sectionLabel="Planificación"
    />
  );
}
