import { FolderOpen, Sheet } from "lucide-react";
import { GlossaryPage } from "@/components/layout/glossary-page";

export const metadata = {
  title: `Información documentada | Ágora`,
};

export default function Page() {
  return (
    <GlossaryPage
      icon={FolderOpen}
      title="Información documentada"
      description="Políticas, procedimientos, instructivos, formularios, registros y documentos de origen externo del SGC — antes eran cuatro pantallas separadas (Documentos del SGC, Instructivos, Registros y Documentos externos), se unificaron porque describen lo mismo desde este portal: es información documentada, gestión que lleva Calidad puertas adentro. Se rige por el procedimiento AV-CAL-PRO:0001, y el registro de todo (documentos internos, externos, registros y control de cambios) vive en la planilla AV-CAL-FOR:0001 — ambos en el repositorio SGC de Avenida+, del área de Calidad."
      sectionLabel="Documentación"
      conceptIds={[
        "informacion-documentada",
        "politica-de-calidad",
        "procedimiento",
        "evidencia",
        "trazabilidad",
        "proveedor-externo",
      ]}
      documentRefs={[
        {
          code: "AV-CAL-PRO:0001",
          label: "Procedimiento de información documentada",
          url: "https://docs.google.com/document/d/1ZXP3Oj6chzdAoQrCzcAepqbzS6YyOFzF/edit?usp=sharing&ouid=113379592521668155429&rtpof=true&sd=true",
        },
        {
          code: "AV-CAL-FOR:0001",
          label: "Información_Documentada A+",
          url: "https://docs.google.com/spreadsheets/d/1f9O-NJUnVcucExCMMf6l-gbc2blTjhN3LXwFW0gRV6Y/edit?usp=sharing",
          icon: Sheet,
          note: "Planilla de registro: documentos internos, externos, registros y control de cambios.",
        },
      ]}
    />
  );
}
