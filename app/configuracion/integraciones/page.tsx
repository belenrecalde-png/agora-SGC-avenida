import { Boxes } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = {
  title: `Integraciones | Ágora`,
};

export default function Page() {
  return (
    <PlaceholderPage
      icon={Boxes}
      title="Integraciones"
      description="Panel general de integraciones activas del portal (Plane, Apps Script y las que se sumen a futuro)."
      phase="Fase 4"
      sectionLabel="Configuración"
    />
  );
}
