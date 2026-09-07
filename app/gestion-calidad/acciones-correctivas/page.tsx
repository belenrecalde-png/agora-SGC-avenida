import { Wrench } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `Acciones Correctivas | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={Wrench}
      title="Acciones Correctivas"
      description="Acciones para eliminar la causa raíz de una No Conformidad y evitar su recurrencia, con seguimiento de estado hasta el cierre verificado."
      phase="Fase 7"
      sectionLabel="Gestión de Calidad"
    />
  );
}
