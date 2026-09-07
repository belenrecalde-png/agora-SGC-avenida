import { ShieldAlert } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `Acciones Preventivas | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={ShieldAlert}
      title="Acciones Preventivas"
      description="Acciones tomadas ante situaciones potenciales, antes de que el problema ocurra, relacionadas con riesgos, oportunidades y controles."
      phase="Fase 7"
      sectionLabel="Gestión de Calidad"
    />
  );
}
