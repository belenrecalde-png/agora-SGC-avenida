import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendChart } from "@/components/ui/trend-chart";
import type { ObjectiveResult, SgcObjective } from "@/lib/db/queries";
import { agregarResultadoObjetivoAction } from "@/lib/actions/objectives";

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

export function ResultadosTab({ objective, results }: { objective: SgcObjective; results: ObjectiveResult[] }) {
  const points = results.map((r) => ({
    period: r.period,
    actual: r.actual_value,
    target: r.target_value ?? objective.target_value,
  }));

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4 p-5">
        <h2 className="text-sm font-semibold text-avenida-black">Meta vs Real</h2>
        <TrendChart points={points} unit={objective.unit ?? undefined} />
      </Card>

      {results.length > 0 && (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-avenida-violet-light/20 text-left text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Período</th>
                  <th className="px-4 py-3 font-medium">Real</th>
                  <th className="px-4 py-3 font-medium">Meta</th>
                  <th className="px-4 py-3 font-medium">Notas</th>
                </tr>
              </thead>
              <tbody>
                {[...results].reverse().map((result) => (
                  <tr key={result.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-avenida-black">{result.period}</td>
                    <td className="px-4 py-3 text-avenida-black">{result.actual_value ?? "—"}</td>
                    <td className="px-4 py-3 text-muted">{result.target_value ?? objective.target_value ?? "—"}</td>
                    <td className="px-4 py-3 text-muted">{result.notes ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card className="flex flex-col gap-3 p-5">
        <p className="text-sm font-semibold text-avenida-black">Agregar resultado de un período</p>
        <form action={agregarResultadoObjetivoAction} className="flex flex-col gap-3">
          <input type="hidden" name="code" value={objective.code} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Período">
              <input name="period" required placeholder="Ej.: 2026-01" className={inputClass} />
            </Field>
            <Field label="Valor real">
              <input type="number" step="any" name="actualValue" className={inputClass} />
            </Field>
            <Field label="Meta de ese período (opcional)">
              <input type="number" step="any" name="targetValue" placeholder={objective.target_value?.toString() ?? ""} className={inputClass} />
            </Field>
          </div>
          <Field label="Notas (opcional)">
            <input name="notes" className={inputClass} />
          </Field>
          <div>
            <Button type="submit" variant="secondary" size="sm">
              Guardar resultado
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
