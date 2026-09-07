import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRiskBand, getRiskScore, type Area, type SgcRisk } from "@/lib/db/queries";
import { guardarTratamientoAction } from "@/lib/actions/risks";

const inputClass =
  "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-avenida-black placeholder:text-muted focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      {children}
    </label>
  );
}

export function TratamientoTab({ risk, areas }: { risk: SgcRisk; areas: Area[] }) {
  const score = getRiskScore(risk.probability_initial, risk.impact_initial);
  const band = getRiskBand(risk.kind, score);

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-avenida-black">Identificación y valoración inicial</h2>
          <p className="text-sm text-muted">
            {risk.kind === "oportunidad"
              ? "Más probabilidad e impacto acá significa una oportunidad más valiosa."
              : "Probabilidad (1 a 3) e impacto (1 a 5) determinan la criticidad inicial en la matriz."}
          </p>
        </div>
        <form action={guardarTratamientoAction} className="flex flex-col gap-4">
          <input type="hidden" name="code" value={risk.code} />

          <Field label="Descripción">
            <textarea name="description" defaultValue={risk.description} required rows={3} className={inputClass} />
          </Field>
          <Field label="Detalle (opcional)">
            <textarea name="detail" defaultValue={risk.detail ?? ""} rows={3} className={inputClass} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Procedencia">
              <input
                name="source"
                defaultValue={risk.source ?? ""}
                placeholder="Ej.: Auditoría interna, reporte de colaborador"
                className={inputClass}
              />
            </Field>
            <Field label="Área">
              <select name="areaId" defaultValue={risk.area_id ?? ""} className={inputClass}>
                <option value="">Sin definir</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Proceso relacionado">
              <input name="processName" defaultValue={risk.process_name ?? ""} className={inputClass} />
            </Field>
            <Field label="Actividad">
              <input name="activity" defaultValue={risk.activity ?? ""} className={inputClass} />
            </Field>
          </div>

          <Field label="Control existente">
            <input
              name="existingControl"
              defaultValue={risk.existing_control ?? ""}
              placeholder="¿Hay algo ya en marcha que lo mitigue o lo favorezca?"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Probabilidad inicial (1-3)">
              <select name="probabilityInitial" defaultValue={risk.probability_initial ?? ""} className={inputClass}>
                <option value="">Sin definir</option>
                <option value="1">1 — Baja</option>
                <option value="2">2 — Media</option>
                <option value="3">3 — Alta</option>
              </select>
            </Field>
            <Field label="Impacto inicial (1-5)">
              <select name="impactInitial" defaultValue={risk.impact_initial ?? ""} className={inputClass}>
                <option value="">Sin definir</option>
                <option value="1">1 — Insignificante</option>
                <option value="2">2 — Menor</option>
                <option value="3">3 — Moderado</option>
                <option value="4">4 — Mayor</option>
                <option value="5">5 — Crítico</option>
              </select>
            </Field>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Valoración inicial</span>
            <Badge tone={band.tone}>{score !== null ? `${score} — ${band.label}` : band.label}</Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Plan de tratamiento / contingencia">
              <textarea name="treatmentPlan" defaultValue={risk.treatment_plan ?? ""} rows={3} className={inputClass} />
            </Field>
            <div className="flex flex-col gap-4">
              <Field label="Responsable">
                <input name="responsible" defaultValue={risk.responsible ?? ""} className={inputClass} />
              </Field>
              <Field label="Fecha objetivo">
                <input type="date" name="dueDate" defaultValue={risk.due_date ?? ""} className={inputClass} />
              </Field>
            </div>
          </div>

          <div>
            <Button type="submit" size="sm">
              Guardar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
