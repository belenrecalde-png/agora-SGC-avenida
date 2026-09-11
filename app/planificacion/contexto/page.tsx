import { Compass } from "lucide-react";
import { GlossaryPage } from "@/components/layout/glossary-page";

export const metadata = {
  title: `Contexto y partes interesadas | Ágora`,
};

export default function Page() {
  return (
    <GlossaryPage
      icon={Compass}
      title="Contexto y partes interesadas"
      description="Cuestiones internas y externas de la organización (análisis FODA/CAME, cambio climático) y las necesidades y expectativas de bancos, sellers, colaboradores, proveedores y demás partes interesadas — antes eran dos pantallas separadas, se unificaron acá porque explican lo mismo desde este portal: es gestión que lleva Calidad puertas adentro."
      sectionLabel="Planificación"
      conceptIds={["contexto-de-la-organizacion", "parte-interesada", "riesgo", "cambio", "satisfaccion-del-cliente"]}
    />
  );
}
