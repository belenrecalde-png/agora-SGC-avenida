import { UserCog } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `Usuarios | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={UserCog}
      title="Usuarios"
      description="Alta, edición y desactivación de usuarios del portal y su área/rol asignado."
      phase="Fase 3"
      sectionLabel="Configuración"
    />
  );
}
