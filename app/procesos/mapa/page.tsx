import { Map } from "lucide-react";
import { GlossaryPage } from "@/components/layout/glossary-page";

export const metadata = {
  title: `Procesos | Ágora`,
};

export default function Page() {
  return (
    <GlossaryPage
      icon={Map}
      title="Procesos"
      description="Vista general de los procesos de Avenida+ agrupados por tipo (estratégicos, operativos, de apoyo) y su interacción, junto con la ficha completa de cada uno: objetivo, alcance, entradas/salidas, indicadores, riesgos, documentos y registros asociados — antes eran dos pantallas separadas (Mapa de procesos y Fichas de procesos), se unificaron porque explican lo mismo desde este portal: es gestión que lleva Calidad puertas adentro."
      sectionLabel="Procesos"
      conceptIds={["proceso", "procedimiento", "control-operacional", "indicador"]}
      documentRefs={[
        {
          code: "AV-CAL-DOC:0003",
          label: "Mapa de procesos de Avenida+",
          url: "https://docs.google.com/presentation/d/1Cv73pI5kZ-OhYr6iXuWrLyYeWLf86aaHYyJqFlUxze0/edit?usp=sharing",
        },
      ]}
    />
  );
}
