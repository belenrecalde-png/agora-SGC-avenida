import { ShieldCheck } from "lucide-react";
import { GlossaryPage } from "@/components/layout/glossary-page";

export const metadata = {
  title: `Auditorías | Ágora`,
};

export default function Page() {
  return (
    <GlossaryPage
      icon={ShieldCheck}
      title="Auditorías"
      description="Programa de auditorías internas, externas, de cliente y de proveedor, con hallazgos que pueden generar NC, OM u observaciones."
      sectionLabel="Evaluación"
      conceptIds={["auditoria", "auditoria-interna", "hallazgo"]}
    />
  );
}
