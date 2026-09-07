import { FileText } from "lucide-react";
import { GlossaryPage } from "@/components/layout/glossary-page";

export const metadata = {
  title: `Documentos del SGC | Ágora`,
};

export default function Page() {
  return (
    <GlossaryPage
      icon={FileText}
      title="Documentos del SGC"
      description="Biblioteca de políticas, procedimientos, formularios, manuales y registros, con estado (Borrador, Vigente, Obsoleto)."
      sectionLabel="Documentación"
      conceptIds={["informacion-documentada", "politica-de-calidad", "procedimiento"]}
    />
  );
}
