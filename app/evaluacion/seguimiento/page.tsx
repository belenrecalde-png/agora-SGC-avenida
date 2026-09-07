import { TrendingUp } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `Seguimiento | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={TrendingUp}
      title="Seguimiento"
      description="Tablero de seguimiento transversal: vencimientos, reincidencias y cumplimiento por área a lo largo del tiempo."
      phase="Fase 14"
      sectionLabel="Evaluación"
    />
  );
}
