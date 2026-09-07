import { ExternalLink } from "lucide-react";
import { GlossaryPage } from "@/components/layout/glossary-page";

export const metadata = {
  title: `Documentos externos | Ágora`,
};

export default function Page() {
  return (
    <GlossaryPage
      icon={ExternalLink}
      title="Documentos externos"
      description="Normativas, contratos y documentación de origen externo necesaria para el funcionamiento del SGC."
      sectionLabel="Documentación"
      conceptIds={["informacion-documentada", "proveedor-externo"]}
    />
  );
}
