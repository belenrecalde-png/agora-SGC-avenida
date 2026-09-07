import { Compass } from "lucide-react";
import { GlossaryPage } from "@/components/layout/glossary-page";

export const metadata = {
  title: `Contexto | Ágora`,
};

export default function Page() {
  return (
    <GlossaryPage
      icon={Compass}
      title="Contexto"
      description="Cuestiones internas y externas de la organización: análisis FODA/CAME y evaluación de pertinencia del cambio climático para el SGC."
      sectionLabel="Planificación"
      conceptIds={["contexto-de-la-organizacion", "riesgo", "cambio"]}
    />
  );
}
