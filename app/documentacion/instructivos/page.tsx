import { BookOpen } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `Instructivos | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={BookOpen}
      title="Instructivos"
      description="Guías paso a paso para tareas del SGC, Plane y Calidad, cada una con un botón de acción directa al final."
      phase="Fase 12"
      sectionLabel="Documentación"
    />
  );
}
