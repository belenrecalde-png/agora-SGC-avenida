import { FileText } from "lucide-react";
import { GlossaryPage } from "@/components/layout/glossary-page";

export const metadata = {
  title: `Fichas de procesos | Ágora`,
};

export default function Page() {
  return (
    <GlossaryPage
      icon={FileText}
      title="Fichas de procesos"
      description="Ficha completa de cada proceso: objetivo, alcance, entradas/salidas, indicadores, riesgos, documentos y registros asociados."
      sectionLabel="Procesos"
      conceptIds={["proceso", "procedimiento", "indicador"]}
    />
  );
}
