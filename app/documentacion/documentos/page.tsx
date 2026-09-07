import { FileText } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `Documentos del SGC | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={FileText}
      title="Documentos del SGC"
      description="Biblioteca de políticas, procedimientos, formularios, manuales y registros, con estado (Borrador, Vigente, Obsoleto)."
      phase="Fase 12"
      sectionLabel="Documentación"
    />
  );
}
