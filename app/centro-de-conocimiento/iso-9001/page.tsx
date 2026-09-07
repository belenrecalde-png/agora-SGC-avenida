import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ISO_MAP } from "@/lib/iso-map-data";

export const metadata = {
  title: `ISO 9001 | Ágora`,
};

export default function Iso9001Page() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-12">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Centro de Conocimiento</p>
          <h1 className="text-2xl font-semibold text-avenida-black">Entendiendo nuestro SGC</h1>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-avenida-black">
          El mapa de la norma ISO 9001, explicado en lenguaje simple y aplicado a cómo trabajamos en Avenida+ — sin
          citar el texto de la norma.
        </p>
        <Badge tone="amber" className="w-fit">
          Borrador — contenido a revisar por el equipo de Calidad
        </Badge>
      </div>

      <div className="flex flex-col gap-4">
        {ISO_MAP.map((block) => {
          const Icon = block.icon;
          return (
            <Card key={block.id} className="flex flex-col gap-4 p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-avenida-blue-light text-avenida-blue">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="text-base font-semibold text-avenida-black">{block.label}</h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">¿Qué significa?</p>
                  <p className="text-sm text-avenida-black">{block.whatItMeans}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">¿Cómo lo hacemos en Avenida+?</p>
                  <p className="text-sm text-avenida-black">{block.howWeDoItAtAvenida}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">¿Qué documentos lo respaldan?</p>
                  <p className="text-sm text-avenida-black">{block.supportingDocuments}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">¿Quién interviene?</p>
                  <p className="text-sm text-avenida-black">{block.whoIsInvolved}</p>
                </div>
              </div>

              <div className="rounded-xl bg-avenida-violet-light/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-avenida-violet">
                  ¿Qué puedo hacer desde el portal?
                </p>
                <p className="mt-1 text-sm text-avenida-black">{block.whatICanDoFromThePortal}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
