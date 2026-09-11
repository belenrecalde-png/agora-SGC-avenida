import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getIndicatorToleranceStatus, type Area, type SgcIndicator } from "@/lib/db/queries";
import { guardarIndicadorAction } from "@/lib/actions/indicators";

const inputClass =
  "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-avenida-black placeholder:text-muted focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20 disabled:cursor-not-allowed disabled:bg-avenida-gray/20 disabled:text-muted";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      {children}
    </label>
  );
}

export function ResumenTab({
  indicator,
  areas,
  canEdit = true,
}: {
  indicator: SgcIndicator;
  areas: Area[];
  canEdit?: boolean;
}) {
  const status = getIndicatorToleranceStatus(indicator);

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex items-center gap-3 p-4">
        <Badge tone={status.tone}>{status.label}</Badge>
        <p className="text-sm text-muted">
          Resultado actual: {indicator.current_result ?? "sin dato"}
          {indicator.current_period ? ` (${indicator.current_period})` : ""} · Meta: {indicator.target_value ?? "sin definir"}
          {indicator.tolerance !== null ? ` ± ${indicator.tolerance}` : ""}
          {indicator.unit ? ` ${indicator.unit}` : ""}
        </p>
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <form action={guardarIndicadorAction} className="flex flex-col gap-4">
          <input type="hidden" name="code" value={indicator.code} />
          <fieldset disabled={!canEdit} className="contents">

          <Field label="Nombre">
            <input name="name" defaultValue={indicator.name} required className={inputClass} />
          </Field>
          <Field label="Descripción">
            <textarea name="description" defaultValue={indicator.description ?? ""} rows={2} className={inputClass} />
          </Field>
          <Field label="Fórmula">
            <input name="formula" defaultValue={indicator.formula ?? ""} placeholder="Ej.: (tickets resueltos / tickets totales) × 100" className={inputClass} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Fuente">
              <input name="source" defaultValue={indicator.source ?? ""} className={inputClass} />
            </Field>
            <Field label="Unidad">
              <input name="unit" defaultValue={indicator.unit ?? ""} placeholder="%, días, tickets..." className={inputClass} />
            </Field>
            <Field label="Frecuencia">
              <select name="frequency" defaultValue={indicator.frequency ?? ""} className={inputClass}>
                <option value="">Sin definir</option>
                <option value="Mensual">Mensual</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Semestral">Semestral</option>
                <option value="Anual">Anual</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Meta">
              <input type="number" step="any" name="targetValue" defaultValue={indicator.target_value ?? ""} className={inputClass} />
            </Field>
            <Field label="Tolerancia (± sobre la meta)">
              <input type="number" step="any" name="tolerance" defaultValue={indicator.tolerance ?? ""} className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Área">
              <select name="areaId" defaultValue={indicator.area_id ?? ""} className={inputClass}>
                <option value="">Sin definir</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Proceso relacionado">
              <input name="processName" defaultValue={indicator.process_name ?? ""} className={inputClass} />
            </Field>
            <Field label="Responsable">
              <input name="responsible" defaultValue={indicator.responsible ?? ""} className={inputClass} />
            </Field>
          </div>

          </fieldset>
          {canEdit ? (
            <div>
              <Button type="submit" size="sm">
                Guardar
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted">Solo lectura — tu rol no permite editar este ítem.</p>
          )}
        </form>
      </Card>
    </div>
  );
}
