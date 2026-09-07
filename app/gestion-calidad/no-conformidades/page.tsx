import { AlertTriangle } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `No Conformidades | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={AlertTriangle}
      title="No Conformidades"
      description="Gestión de incumplimientos de requisitos: corrección inmediata, análisis de causa raíz (5 Por Qué, Ishikawa), Acción Correctiva asociada y verificación de eficacia."
      phase="Fase 7"
      sectionLabel="Gestión de Calidad"
    />
  );
}
