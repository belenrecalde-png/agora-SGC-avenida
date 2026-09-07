import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OBJECTIVE_STATUS_FLOW, type Area, type SgcIndicator, type SgcObjective } from "@/lib/db/queries";
import { cambiarEstadoObjetivoAction, guardarObjetivoAction } from "@/lib/actions/objectives";

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

export function ResumenTab({
  objective,
  areas,
  indicators,
}: {
  objective: SgcObjective;
  areas: Area[];
  indicators: SgcIndicator[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4 p-5">
        <form action={guardarObjetivoAction} className="flex flex-col gap-4">
          <input type="hidden" name="code" value={objective.code} />

          <Field label="Objetivo">
            <textarea name="title" defaultValue={objective.title} required rows={2} className={inputClass} />
          </Field>
          <Field label="Meta">
            <textarea name="goal" defaultValue={objective.goal ?? ""} rows={2} className={inputClass} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Meta numérica (para el gráfico)">
              <input type="number" step="any" name="targetValue" defaultValue={objective.target_value ?? ""} className={inputClass} />
            </Field>
            <Field label="Unidad">
              <input name="unit" defaultValue={objective.unit ?? ""} placeholder="%, días, tickets..." className={inputClass} />
            </Field>
            <Field label="Indicador asociado (opcional)">
              <select name="indicatorId" defaultValue={objective.indicator_id ?? ""} className={inputClass}>
                <option value="">Sin definir</option>
                {indicators.map((indicator) => (
                  <option key={indicator.id} value={indicator.id}>
                    {indicator.code} — {indicator.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Área">
              <select name="areaId" defaultValue={objective.area_id ?? ""} className={inputClass}>
                <option value="">Sin definir</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Proceso relacionado">
              <input name="processName" defaultValue={objective.process_name ?? ""} className={inputClass} />
            </Field>
            <Field label="Responsable">
              <input name="responsible" defaultValue={objective.responsible ?? ""} className={inputClass} />
            </Field>
            <Field label="Recursos">
              <input name="resources" defaultValue={objective.resources ?? ""} className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <Field label="Fecha de inicio">
              <input type="date" name="startDate" defaultValue={objective.start_date ?? ""} className={inputClass} />
            </Field>
            <Field label="Fecha objetivo">
              <input type="date" name="endDate" defaultValue={objective.end_date ?? ""} className={inputClass} />
            </Field>
            <Field label="Frecuencia de seguimiento">
              <select name="frequency" defaultValue={objective.frequency ?? ""} className={inputClass}>
                <option value="">Sin definir</option>
                <option value="Mensual">Mensual</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Semestral">Semestral</option>
                <option value="Anual">Anual</option>
              </select>
            </Field>
            <Field label="Método de medición">
              <input name="method" defaultValue={objective.method ?? ""} className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Resultado actual">
              <input name="currentResult" defaultValue={objective.current_result ?? ""} className={inputClass} />
            </Field>
            <Field label="Cumplimiento (%)">
              <input type="number" step="any" min={0} max={100} name="compliancePercent" defaultValue={objective.compliance_percent ?? ""} className={inputClass} />
            </Field>
          </div>

          <Field label="Evidencia">
            <input name="evidence" defaultValue={objective.evidence ?? ""} placeholder="Descripción o link" className={inputClass} />
          </Field>
          <Field label="Observaciones">
            <textarea name="observations" defaultValue={objective.observations ?? ""} rows={2} className={inputClass} />
          </Field>

          <div>
            <Button type="submit" size="sm">
              Guardar
            </Button>
          </div>
        </form>
      </Card>

      <Card className="flex flex-wrap items-end gap-3 p-4">
        <form action={cambiarEstadoObjetivoAction} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="code" value={objective.code} />
          <Field label="Estado">
            <select name="status" defaultValue={objective.status} className={inputClass}>
              {OBJECTIVE_STATUS_FLOW.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </Field>
          <Button type="submit" variant="secondary" size="sm">
            Actualizar estado
          </Button>
        </form>
      </Card>
    </div>
  );
}
