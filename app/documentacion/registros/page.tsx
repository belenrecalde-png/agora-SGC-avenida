import { FileStack } from "lucide-react";
import { GlossaryPage } from "@/components/layout/glossary-page";

export const metadata = {
  title: `Registros | Ágora`,
};

export default function Page() {
  return (
    <GlossaryPage
      icon={FileStack}
      title="Registros"
      description="Evidencias de que algo ocurrió: formularios completados, actas, verificaciones y demás registros del sistema."
      sectionLabel="Documentación"
      conceptIds={["evidencia", "trazabilidad", "informacion-documentada"]}
    />
  );
}
