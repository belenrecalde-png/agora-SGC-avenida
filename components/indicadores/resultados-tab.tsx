import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendChart } from "@/components/ui/trend-chart";
import type { IndicatorResult, SgcIndicator } from "@/lib/db/queries";
import { agregarResultadoIndicadorAction } from "@/lib/actions/indicators";

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

export function ResultadosTab({
  indicator,
  results,
  canEdit = true,
}: {
  indicator: SgcIndicator;
  results: IndicatorResult[];
  canEdit?: boolean;
}) {
  const points = results.map((r) => ({
    period: r.period,
    actual: r.value,
    target: indicator.target_value,
  }));

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4 p-5">
        <h2 className="text-sm font-semibold text-avenida-black">Tendencia</h2>
        <TrendChart points={points} unit={indicator.unit ?? undefined} />
      </Card>

      {results.length > 0 && (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-avenida-violet-light/20 text-left text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Período</th>
                  <th className="px-4 py-3 font-medium">Resultado</th>
                  <th className="px-4 py-3 font-medium">Notas</th>
                </tr>
              </thead>
              <tbody>
                {[...results].reverse().map((result) => (
                  <tr key={result.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-avenida-black">{result.period}</td>
                    <td className="px-4 py-3 text-avenida-black">{result.value ?? "—"}</td>
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
          <form action={agregarResultadoIndicadorAction} className="flex flex-col gap-3">
            <input type="hidden" name="code" value={indicator.code} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Período">
                <input name="period" required placeholder="Ej.: 2026-01" className={inputClass} />
              </Field>
              <Field label="Valor">
                <input type="number" step="any" name="value" className={inputClass} />
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
      )}
    </div>
  );
}
