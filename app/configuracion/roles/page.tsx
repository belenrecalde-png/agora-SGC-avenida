import { KeyRound } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `Roles | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={KeyRound}
      title="Roles"
      description="Roles (Administrador SGC, Calidad, Responsable de Área, Colaborador, Consulta) y permisos granulares asociados."
      phase="Fase 3"
      sectionLabel="Configuración"
    />
  );
}
