import { Lightbulb } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `Oportunidades de Mejora | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={Lightbulb}
      title="Oportunidades de Mejora"
      description="Ideas para hacer más simple, rápido o eficiente un proceso, evaluadas con la matriz Impacto/Esfuerzo."
      phase="Fase 7"
      sectionLabel="Gestión de Calidad"
    />
  );
}
