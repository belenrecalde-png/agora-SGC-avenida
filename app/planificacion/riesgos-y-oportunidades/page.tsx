import { AlertOctagon } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `Riesgos y oportunidades | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={AlertOctagon}
      title="Riesgos y oportunidades"
      description="Identificación, valoración (probabilidad × impacto) y tratamiento de riesgos y oportunidades, con matriz de criticidad inicial y residual."
      phase="Fase 8"
      sectionLabel="Planificación"
    />
  );
}
