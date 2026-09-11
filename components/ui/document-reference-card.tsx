import type { ComponentType } from "react";
import { ExternalLink, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type DocumentRef = {
  code: string;
  label: string;
  url: string;
  icon?: ComponentType<{ className?: string }>;
  note?: string;
};

/**
 * Tarjeta de "documento oficial de respaldo" — código de documentación del
 * SGC (ej. AV-CAL-DOC:0003) + link al archivo real (Google Docs/Sheets/Slides
 * que mantiene Calidad puertas adentro, en el repositorio SGC de Avenida+).
 * No reemplaza la gestión documental formal (fuera de alcance del portal,
 * ver `GlossaryPage`) — es solo un atajo directo al archivo vigente para
 * quien está viendo la pantalla.
 */
export function DocumentReferenceCard({ code, label, url, icon: Icon = FileText, note }: DocumentRef) {
  return (
    <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-avenida-blue-light text-avenida-blue">
          <Icon className="h-4 w-4" />
        </span>
        <div className="flex flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="blue">{code}</Badge>
            <p className="text-sm font-medium text-avenida-black">{label}</p>
          </div>
          <p className="text-xs text-muted">{note ?? "Documento oficial — lo mantiene Calidad puertas adentro."}</p>
        </div>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-avenida-violet/30 px-3 py-1.5 text-xs font-medium text-avenida-violet hover:bg-avenida-violet-light/40"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Abrir documento
      </a>
    </Card>
  );
}
