import { CircleDot } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `Estados | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={CircleDot}
      title="Estados"
      description="Estados posibles de cada tipo de registro y sus transiciones permitidas."
      phase="Fase 3"
      sectionLabel="Configuración"
    />
  );
}
