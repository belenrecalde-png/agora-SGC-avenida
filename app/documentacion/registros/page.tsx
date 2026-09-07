import { FileStack } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `Registros | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={FileStack}
      title="Registros"
      description="Evidencias de que algo ocurrió: formularios completados, actas, verificaciones y demás registros del sistema."
      phase="Fase 12"
      sectionLabel="Documentación"
    />
  );
}
