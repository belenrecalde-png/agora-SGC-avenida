import { LineChart } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `Indicadores | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={LineChart}
      title="Indicadores"
      description="Indicadores de desempeño con fórmula, meta, tolerancia y tendencia histórica por proceso."
      phase="Fase 11"
      sectionLabel="Evaluación"
    />
  );
}
