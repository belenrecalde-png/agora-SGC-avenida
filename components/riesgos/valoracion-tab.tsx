import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  OPPORTUNITY_STATUS_FLOW,
  RISK_STATUS_FLOW,
  getRiskBand,
  getRiskScore,
  type SgcRisk,
} from "@/lib/db/queries";
import { cambiarEstadoRiesgoAction, guardarValoracionResidualAction } from "@/lib/actions/risks";

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

export function ValoracionTab({
  risk,
  estadoError,
  canEdit = true,
}: {
  risk: SgcRisk;
  estadoError?: string;
  canEdit?: boolean;
}) {
  const initialScore = getRiskScore(risk.probability_initial, risk.impact_initial);
  const initialBand = getRiskBand(risk.kind, initialScore);
  const residualScore = getRiskScore(risk.probability_residual, risk.impact_residual);
  const residualBand = getRiskBand(risk.kind, residualScore);
  const readyToClose = residualScore !== null || Boolean(risk.verification && risk.verification.trim());
  const statusFlow = risk.kind === "oportunidad" ? OPPORTUNITY_STATUS_FLOW : RISK_STATUS_FLOW;

  return (
    <div className="flex flex-col gap-6">
      {estadoError && (
        <Card className="flex items-start gap-2 border-red-200 bg-red-50 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{estadoError}</p>
        </Card>
      )}

      <Card className="flex flex-wrap items-center gap-6 p-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Valoración inicial</span>
          <Badge tone={initialBand.tone}>{initialScore !== null ? `${initialScore} — ${initialBand.label}` : initialBand.label}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Valoración residual</span>
          <Badge tone={residualBand.tone}>{residualScore !== null ? `${residualScore} — ${residualBand.label}` : residualBand.label}</Badge>
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-avenida-black">Verificación y valoración residual</h2>
          <p className="text-sm text-muted">
            Después del tratamiento y los controles, ¿cómo queda la probabilidad y el impacto? Confirma si el
            tratamiento realmente funcionó — no alcanza con que esté &ldquo;en curso&rdquo;.
          </p>
        </div>
        <form action={guardarValoracionResidualAction} className="flex flex-col gap-4">
          <input type="hidden" name="code" value={risk.code} />
          <fieldset disabled={!canEdit} className="contents">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Probabilidad residual (1-3)">
              <select name="probabilityResidual" defaultValue={risk.probability_residual ?? ""} className={inputClass}>
                <option value="">Sin definir</option>
                <option value="1">1 — Baja</option>
                <option value="2">2 — Media</option>
                <option value="3">3 — Alta</option>
              </select>
            </Field>
            <Field label="Impacto residual (1-5)">
              <select name="impactResidual" defaultValue={risk.impact_residual ?? ""} className={inputClass}>
                <option value="">Sin definir</option>
                <option value="1">1 — Insignificante</option>
                <option value="2">2 — Menor</option>
                <option value="3">3 — Moderado</option>
                <option value="4">4 — Mayor</option>
                <option value="5">5 — Crítico</option>
              </select>
            </Field>
          </div>
          <Field label="Verificación">
            <textarea name="verification" defaultValue={risk.verification ?? ""} rows={3} className={inputClass} />
          </Field>
          </fieldset>
          {canEdit ? (
            <div>
              <Button type="submit" size="sm">
                Guardar valoración residual
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted">Solo lectura — tu rol no permite editar este ítem.</p>
          )}
        </form>
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-avenida-black">Estado</h2>
          {readyToClose ? (
            <p className="flex items-center gap-1.5 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Ya hay verificación/valoración residual registrada — se puede pasar a un estado de cierre.
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-sm text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              No se puede cerrar todavía: falta la verificación y la valoración residual.
            </p>
          )}
        </div>
        {canEdit && (
          <form action={cambiarEstadoRiesgoAction} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="code" value={risk.code} />
            <Field label="Nuevo estado">
              <select name="status" defaultValue={risk.status} className={inputClass}>
                {statusFlow.map((status) => (
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
        )}
        {risk.closed_at && (
          <p className="text-xs text-muted">
            Cerrado el {new Date(risk.closed_at).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}.
          </p>
        )}
      </Card>
    </div>
  );
}
