import { Users } from "lucide-react";
import { GlossaryPage } from "@/components/layout/glossary-page";

export const metadata = {
  title: `Partes interesadas | Ágora`,
};

export default function Page() {
  return (
    <GlossaryPage
      icon={Users}
      title="Partes interesadas"
      description="Necesidades y expectativas de bancos, sellers, colaboradores, proveedores y demás partes interesadas, y su relación con riesgos y objetivos."
      sectionLabel="Planificación"
      conceptIds={["parte-interesada", "contexto-de-la-organizacion", "satisfaccion-del-cliente"]}
    />
  );
}
