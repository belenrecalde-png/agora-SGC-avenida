import { BookOpen } from "lucide-react";
import { GlossaryPage } from "@/components/layout/glossary-page";

export const metadata = {
  title: `Instructivos | Ágora`,
};

export default function Page() {
  return (
    <GlossaryPage
      icon={BookOpen}
      title="Instructivos"
      description="Guías paso a paso para tareas del SGC, Plane y Calidad, cada una con un botón de acción directa al final."
      sectionLabel="Documentación"
      conceptIds={["procedimiento", "informacion-documentada"]}
    />
  );
}
