import { ThumbsUp } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `Satisfacción | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={ThumbsUp}
      title="Satisfacción"
      description="Seguimiento de la satisfacción del cliente y su relación con quejas, reclamos y acciones de mejora."
      phase="Fase 13"
      sectionLabel="Evaluación"
    />
  );
}
