import Link from "next/link";
import { ThumbsUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { TrendChart } from "@/components/ui/trend-chart";
import { listAreas, listRecordTypes, listRecords, listSatisfactionResults } from "@/lib/db/queries";
import { filterByAreaAccess, isReadOnlyRole, requireGestionAccess } from "@/lib/auth/access";
import { addSatisfactionResultAction } from "@/lib/actions/satisfaction";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Satisfacción | Ágora`,
};

const FIELD_CLASS =
  "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-avenida-black placeholder:text-muted focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20 disabled:cursor-not-allowed disabled:bg-avenida-gray/20 disabled:text-muted";

function statusTone(status: string): BadgeTone {
  if (status === "Cerrado") return "green";
  if (status === "Rechazado") return "gray";
  if (status === "En análisis" || status === "En curso") return "violet";
  return "blue";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function SatisfaccionPage() {
  const user = await requireGestionAccess();
  const canEdit = !isReadOnlyRole(user.role);

  const results = filterByAreaAccess(listSatisfactionResults(), user);
  const areas = listAreas();
  const areaById = new Map(areas.map((a) => [a.id, a]));

  const types = listRecordTypes();
  const typeById = new Map(types.map((t) => [t.id, t]));
  const qrTypeIds = new Set(types.filter((t) => t.code === "Q" || t.code === "R").map((t) => t.id));
  const relatedRecords = filterByAreaAccess(listRecords(), user)
    .filter((r) => qrTypeIds.has(r.type_id))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 8);

  const points = results.map((r) => ({ period: r.period, actual: r.score, target: null }));
  const latest = results[results.length - 1];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-12">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
          <ThumbsUp className="h-6 w-6" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Evaluación</p>
          <h1 className="text-2xl font-semibold text-avenida-black">Satisfacción</h1>
        </div>
      </div>

      <p className="text-sm text-avenida-black">
        Seguimiento de la satisfacción del cliente a lo largo del tiempo, en relación con las Quejas y
        Reclamos ya cargados en el Registro SGC.
      </p>

      <Card className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-avenida-black">Evolución</h2>
          {latest && (
            <Badge tone="violet">
              Último: {latest.score}
              {latest.unit ? ` ${latest.unit}` : ""} ({latest.period})
            </Badge>
          )}
        </div>
        <TrendChart points={points} unit={latest?.unit ?? undefined} actualLabel="Satisfacción" targetLabel="Meta" />
      </Card>

      {results.length > 0 && (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-avenida-violet-light/20 text-left text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Período</th>
                  <th className="px-4 py-3 font-medium">Puntaje</th>
                  <th className="px-4 py-3 font-medium">Área</th>
                  <th className="px-4 py-3 font-medium">Encuestados</th>
                  <th className="px-4 py-3 font-medium">Notas</th>
                </tr>
              </thead>
              <tbody>
                {[...results].reverse().map((result) => (
                  <tr key={result.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-avenida-black">{result.period}</td>
                    <td className="px-4 py-3 text-avenida-black">
                      {result.score}
                      {result.unit ? ` ${result.unit}` : ""}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {result.area_id ? (areaById.get(result.area_id)?.name ?? "Sin definir") : "Toda la empresa"}
                    </td>
                    <td className="px-4 py-3 text-muted">{result.respondents ?? "—"}</td>
                    <td className="px-4 py-3 text-muted">{result.notes ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {canEdit && (
        <Card className="flex flex-col gap-3 p-5">
          <p className="text-sm font-semibold text-avenida-black">Agregar resultado de un período</p>
          <form action={addSatisfactionResultAction} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="period" className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Período
                </label>
                <input id="period" name="period" required placeholder="Ej.: 2026-Q3" className={FIELD_CLASS} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="score" className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Puntaje
                </label>
                <input id="score" name="score" type="number" step="any" required className={FIELD_CLASS} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="unit" className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Unidad (opcional)
                </label>
                <input id="unit" name="unit" placeholder="%, NPS, /10..." className={FIELD_CLASS} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {user.role !== "responsable_area" && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="areaId" className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Área (opcional)
                  </label>
                  <select id="areaId" name="areaId" defaultValue="" className={FIELD_CLASS}>
                    <option value="">Toda la empresa</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="respondents" className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Encuestados (opcional)
                </label>
                <input id="respondents" name="respondents" type="number" className={FIELD_CLASS} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wide text-muted">
                Notas (opcional)
              </label>
              <input id="notes" name="notes" className={FIELD_CLASS} />
            </div>
            <div>
              <SubmitButton size="sm" pendingText="Guardando…">
                Guardar resultado
              </SubmitButton>
            </div>
          </form>
        </Card>
      )}

      <Card className="flex flex-col gap-3 p-5">
        <p className="text-sm font-semibold text-avenida-black">Quejas y reclamos recientes</p>
        {relatedRecords.length === 0 ? (
          <p className="text-sm text-muted">No hay quejas ni reclamos cargados todavía.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {relatedRecords.map((record) => {
              const type = typeById.get(record.type_id);
              return (
                <Link
                  key={record.id}
                  href={`/gestion-calidad/registro/${record.code}`}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 hover:bg-avenida-violet-light/10"
                >
                  <div className="flex items-center gap-3">
                    {type && <Badge tone={type.color as BadgeTone}>{type.code}</Badge>}
                    <div>
                      <p className="text-sm font-medium text-avenida-violet">{record.code}</p>
                      <p className="text-sm text-avenida-black">{record.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={statusTone(record.status)}>{record.status}</Badge>
                    <span className="text-xs text-muted">{formatDate(record.created_at)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
