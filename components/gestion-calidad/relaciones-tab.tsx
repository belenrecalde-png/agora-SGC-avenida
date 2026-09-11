import Link from "next/link";
import { AlertOctagon, ArrowLeftRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRiskBand, getRiskScore, type RecordRiskLink, type RecordRelationship, type SgcRecord } from "@/lib/db/queries";
import { vincularRegistroAction } from "@/lib/actions/gestion";

const inputClass =
  "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-avenida-black placeholder:text-muted focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20";

function statusTone(status: string): BadgeTone {
  if (status === "Cerrado" || status === "Cerrada" || status === "Eficaz") return "green";
  if (status === "Rechazado" || status === "No eficaz") return "red";
  if (status === "En análisis" || status === "En curso" || status === "Pendiente de verificación") return "violet";
  return "blue";
}

export function RelacionesTab({
  record,
  relationships,
  riskLinks = [],
  canEdit = true,
}: {
  record: SgcRecord;
  relationships: RecordRelationship[];
  riskLinks?: RecordRiskLink[];
  canEdit?: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      {riskLinks.length > 0 && (
        <Card className="flex flex-col divide-y divide-border p-0">
          {riskLinks.map((link) => {
            const score = getRiskScore(link.risk.probability_initial, link.risk.impact_initial);
            const band = getRiskBand(link.risk.kind, score);
            return (
              <Link
                key={link.id}
                href={`/planificacion/riesgos-y-oportunidades/${link.risk.code}`}
                className="flex flex-wrap items-center justify-between gap-2 p-4 hover:bg-avenida-violet-light/10"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-avenida-violet-light text-avenida-violet">
                    <AlertOctagon className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-avenida-violet">{link.risk.code}</p>
                    <p className="text-sm text-avenida-black">{link.risk.description}</p>
                    {link.label && <p className="text-xs text-muted">{link.label}</p>}
                  </div>
                </div>
                <Badge tone={band.tone}>{score !== null ? `${score} — ${band.label}` : band.label}</Badge>
              </Link>
            );
          })}
        </Card>
      )}

      {relationships.length === 0 ? (
        riskLinks.length === 0 && (
          <Card className="flex flex-col items-center gap-2 p-8 text-center">
            <p className="text-sm text-muted">Este registro todavía no está vinculado a ningún otro.</p>
          </Card>
        )
      ) : (
        <Card className="flex flex-col divide-y divide-border p-0">
          {relationships.map((rel) => (
            <Link
              key={rel.id}
              href={`/gestion-calidad/registro/${rel.other.code}`}
              className="flex flex-wrap items-center justify-between gap-2 p-4 hover:bg-avenida-violet-light/10"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-avenida-violet-light text-avenida-violet">
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                </span>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-avenida-violet">{rel.other.code}</p>
                  <p className="text-sm text-avenida-black">{rel.other.title}</p>
                  {rel.label && <p className="text-xs text-muted">{rel.label}</p>}
                </div>
              </div>
              <Badge tone={statusTone(rel.other.status)}>{rel.other.status}</Badge>
            </Link>
          ))}
        </Card>
      )}

      {canEdit && (
        <Card className="flex flex-col gap-3 p-5">
          <p className="text-sm font-semibold text-avenida-black">Vincular a otro registro</p>
          <form action={vincularRegistroAction} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="code" value={record.code} />
            <label className="flex flex-1 min-w-[180px] flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Código del registro</span>
              <input name="targetCode" required placeholder="Ej.: NC-2026-014" className={inputClass} />
            </label>
            <label className="flex flex-1 min-w-[180px] flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Motivo del vínculo (opcional)</span>
              <input name="label" placeholder="Ej.: Originado en esta queja" className={inputClass} />
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
