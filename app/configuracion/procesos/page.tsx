import { Workflow } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `Procesos | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={Workflow}
      title="Procesos"
      description="Alta y edición de los procesos del mapa de procesos y sus responsables."
      phase="Fase 10"
      sectionLabel="Configuración"
    />
  );
}
