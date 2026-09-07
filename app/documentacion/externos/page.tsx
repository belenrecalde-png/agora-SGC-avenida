import { ExternalLink } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `Documentos externos | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={ExternalLink}
      title="Documentos externos"
      description="Normativas, contratos y documentación de origen externo necesaria para el funcionamiento del SGC."
      phase="Fase 12"
      sectionLabel="Documentación"
    />
  );
}
