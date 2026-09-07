import { ScrollText } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `Apps Script | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={ScrollText}
      title="Apps Script"
      description="Configuración de la integración con Google Apps Script y Google Sheets para automatizaciones y envío de mails."
      phase="Fase 5"
      sectionLabel="Configuración"
    />
  );
}
