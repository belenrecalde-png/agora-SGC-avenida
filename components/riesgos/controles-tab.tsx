import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { RiskControl, SgcRisk } from "@/lib/db/queries";
import { agregarControlAction } from "@/lib/actions/risks";

const inputClass =
  "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-avenida-black placeholder:text-muted focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function ControlesTab({ risk, controls }: { risk: SgcRisk; controls: RiskControl[] }) {
  return (
    <div className="flex flex-col gap-6">
      {risk.existing_control && (
        <Card className="flex flex-col gap-1 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Control existente (resumen)</p>
          <p className="text-sm text-avenida-black">{risk.existing_control}</p>
        </Card>
      )}

      {controls.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-8 text-center">
          <p className="text-sm text-muted">Todavía no se cargaron controles para este {risk.kind === "oportunidad" ? "aprovechamiento" : "riesgo"}.</p>
        </Card>
      ) : (
        <Card className="flex flex-col divide-y divide-border p-0">
          {controls.map((control) => (
            <div key={control.id} className="flex items-start gap-3 p-4">
              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-avenida-violet-light text-avenida-violet">
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm text-avenida-black">{control.description}</p>
                <p className="text-xs text-muted">
                  {control.responsible ? `${control.responsible} · ` : ""}
                  {control.effectiveness ? `Eficacia: ${control.effectiveness} · ` : ""}
                  {formatDateTime(control.created_at)}
                </p>
              </div>
            </div>
          ))}
        </Card>
      )}

      <Card className="flex flex-col gap-3 p-5">
        <p className="text-sm font-semibold text-avenida-black">Agregar control</p>
        <form action={agregarControlAction} className="flex flex-col gap-3">
          <input type="hidden" name="code" value={risk.code} />
          <textarea name="description" required rows={2} placeholder="Describí el control" className={inputClass} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input name="responsible" placeholder="Responsable (opcional)" className={inputClass} />
            <select name="effectiveness" defaultValue="" className={inputClass}>
              <option value="">Eficacia sin definir</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
          <div>
            <Button type="submit" variant="secondary" size="sm">
              Guardar control
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
