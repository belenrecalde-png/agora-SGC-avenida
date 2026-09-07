import { Map } from "lucide-react";
import { GlossaryPage } from "@/components/layout/glossary-page";

export const metadata = {
  title: `Mapa de procesos | Ágora`,
};

export default function Page() {
  return (
    <GlossaryPage
      icon={Map}
      title="Mapa de procesos"
      description="Vista general de los procesos de Avenida+ agrupados por tipo (estratégicos, operativos, de apoyo) y su interacción."
      sectionLabel="Procesos"
      conceptIds={["proceso", "procedimiento", "control-operacional"]}
    />
  );
}
