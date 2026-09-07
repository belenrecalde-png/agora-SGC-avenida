import { MessageSquareWarning } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `Quejas | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={MessageSquareWarning}
      title="Quejas"
      description="Manifestaciones de insatisfacción sobre un servicio, proceso o atención, con posibilidad de vincularlas a una NC o AC."
      phase="Fase 3 y 7"
      sectionLabel="Gestión de Calidad"
    />
  );
}
