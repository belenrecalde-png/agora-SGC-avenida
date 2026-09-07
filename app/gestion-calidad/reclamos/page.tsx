import { FileWarning } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `Reclamos | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={FileWarning}
      title="Reclamos"
      description="Solicitudes formales de resolución ante un incumplimiento, con fecha compromiso y respuesta, vinculables a NC o AC."
      phase="Fase 3 y 7"
      sectionLabel="Gestión de Calidad"
    />
  );
}
