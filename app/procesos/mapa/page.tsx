import { Map } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `Mapa de procesos | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={Map}
      title="Mapa de procesos"
      description="Vista general de los procesos de Avenida+ agrupados por tipo (estratégicos, operativos, de apoyo) y su interacción."
      phase="Fase 10"
      sectionLabel="Procesos"
    />
  );
}
