import { FileText } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `Fichas de procesos | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={FileText}
      title="Fichas de procesos"
      description="Ficha completa de cada proceso: objetivo, alcance, entradas/salidas, indicadores, riesgos, documentos y registros asociados."
      phase="Fase 10"
      sectionLabel="Procesos"
    />
  );
}
