import { Users } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `Partes interesadas | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={Users}
      title="Partes interesadas"
      description="Necesidades y expectativas de bancos, sellers, colaboradores, proveedores y demás partes interesadas, y su relación con riesgos y objetivos."
      phase="Fase 9"
      sectionLabel="Planificación"
    />
  );
}
