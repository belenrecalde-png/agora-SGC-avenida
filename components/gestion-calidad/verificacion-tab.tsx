import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RecordRelationship, SgcRecord } from "@/lib/db/queries";
import { AC_STATUS_FLOW } from "@/lib/db/queries";
import { cambiarEstadoAction, guardarVerificacionAction } from "@/lib/actions/gestion";

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

export function VerificacionTab({
  record,
  source,
  estadoError,
}: {
  record: SgcRecord;
  source: RecordRelationship | undefined;
  estadoError?: string;
}) {
  const readyToClose = record.effective === true;

  return (
    <div className="flex flex-col gap-6">
      {estadoError && (
        <Card className="flex items-start gap-2 border-red-200 bg-red-50 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{estadoError}</p>
        </Card>
      )}
      {source && (
        <Card className="flex items-center justify-between gap-3 p-4">
          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Origen</p>
            <p className="text-sm text-avenida-black">
              Acción Correctiva de{" "}
              <Link href={`/gestion-calidad/registro/${source.other.code}`} className="font-medium text-avenida-violet hover:underline">
                {source.other.code}
              </Link>
              {" "}— {source.other.title}
            </p>
          </div>
        </Card>
      )}

      <Card className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-avenida-black">Verificación de eficacia</h2>
          <p className="text-sm text-muted">
            Confirma si la acción realmente eliminó la causa raíz — no alcanza con que esté &ldquo;implementada&rdquo;.
          </p>
        </div>
        <form action={guardarVerificacionAction} className="flex flex-col gap-4">
          <input type="hidden" name="code" value={record.code} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Fecha prevista de verificación">
              <input type="date" name="dueDate" defaultValue={record.effectiveness_due_date ?? ""} className={inputClass} />
            </Field>
            <Field label="Responsable de verificar">
              <input name="responsible" defaultValue={record.effectiveness_responsible ?? ""} className={inputClass} />
            </Field>
          </div>
          <Field label="Resultado de la verificación">
            <textarea name="result" defaultValue={record.effectiveness_result ?? ""} rows={3} className={inputClass} />
          </Field>
          <Field label="Evidencia de la verificación">
            <input name="evidence" defaultValue={record.effectiveness_evidence ?? ""} placeholder="Descripción o link" className={inputClass} />
          </Field>
          <Field label="¿Fue eficaz?">
            <select name="effective" defaultValue={record.effective === null ? "" : record.effective ? "si" : "no"} className={inputClass}>
              <option value="">Todavía sin definir</option>
              <option value="si">Sí, eficaz</option>
              <option value="no">No, no eficaz</option>
            </select>
          </Field>
          <div>
            <Button type="submit" size="sm">
              Guardar verificación
            </Button>
          </div>
        </form>
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-avenida-black">Estado y cierre</h2>
          {readyToClose ? (
            <p className="flex items-center gap-1.5 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              La verificación dio &ldquo;eficaz&rdquo; — ya se puede cerrar esta Acción Correctiva.
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-sm text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              No se puede cerrar todavía: falta una verificación de eficacia con resultado &ldquo;eficaz&rdquo;.
            </p>
          )}
        </div>
        <form action={cambiarEstadoAction} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="code" value={record.code} />
          <input type="hidden" name="tab" value="verificacion" />
          <Field label="Nuevo estado">
            <select name="status" defaultValue={record.status} className={inputClass}>
              {AC_STATUS_FLOW.map((status) => (
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
        {record.closed_at && (
          <p className="text-xs text-muted">
            Cerrada el {new Date(record.closed_at).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}.
          </p>
        )}
      </Card>

      <Card className="flex items-center gap-2 p-4">
        <Badge tone={readyToClose ? "green" : "amber"}>{record.status}</Badge>
        <p className="text-sm text-muted">Estado actual del registro.</p>
      </Card>
    </div>
  );
}
