import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RiskRecordLink, SgcRisk } from "@/lib/db/queries";
import { vincularRegistroRiesgoAction } from "@/lib/actions/risks";

const inputClass =
  "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-avenida-black placeholder:text-muted focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20";

function statusTone(status: string): BadgeTone {
  if (status === "Cerrado" || status === "Cerrada" || status === "Eficaz") return "green";
  if (status === "Rechazado" || status === "No eficaz") return "red";
  if (status === "En análisis" || status === "En curso" || status === "Pendiente de verificación") return "violet";
  return "blue";
}

export function RiesgoRelacionesTab({
  risk,
  links,
  canEdit = true,
}: {
  risk: SgcRisk;
  links: RiskRecordLink[];
  canEdit?: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      {links.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-8 text-center">
          <p className="text-sm text-muted">Todavía no está vinculado a ningún registro del SGC.</p>
        </Card>
      ) : (
        <Card className="flex flex-col divide-y divide-border p-0">
          {links.map((link) => (
            <Link
              key={link.id}
              href={`/gestion-calidad/registro/${link.record.code}`}
              className="flex flex-wrap items-center justify-between gap-2 p-4 hover:bg-avenida-violet-light/10"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-avenida-violet-light text-avenida-violet">
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                </span>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-avenida-violet">{link.record.code}</p>
                  <p className="text-sm text-avenida-black">{link.record.title}</p>
                  {link.label && <p className="text-xs text-muted">{link.label}</p>}
                </div>
              </div>
              <Badge tone={statusTone(link.record.status)}>{link.record.status}</Badge>
            </Link>
          ))}
        </Card>
      )}

      {canEdit && (
        <Card className="flex flex-col gap-3 p-5">
          <p className="text-sm font-semibold text-avenida-black">Vincular a un registro del SGC</p>
          <form action={vincularRegistroRiesgoAction} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="code" value={risk.code} />
            <label className="flex flex-1 min-w-[180px] flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Código del registro</span>
              <input name="targetCode" required placeholder="Ej.: NC-2026-014" className={inputClass} />
            </label>
            <label className="flex flex-1 min-w-[180px] flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Motivo del vínculo (opcional)</span>
              <input name="label" placeholder="Ej.: Este riesgo se materializó acá" className={inputClass} />
            </label>
            <Button type="submit" variant="secondary" size="sm">
              Vincular
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
