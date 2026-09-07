import { ShieldCheck } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `Auditorías | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={ShieldCheck}
      title="Auditorías"
      description="Programa de auditorías internas, externas, de cliente y de proveedor, con hallazgos que pueden generar NC, OM u observaciones."
      phase="Fase 13"
      sectionLabel="Evaluación"
    />
  );
}
