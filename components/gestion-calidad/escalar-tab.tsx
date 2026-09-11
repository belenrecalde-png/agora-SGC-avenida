import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RecordRelationship, SgcRecord } from "@/lib/db/queries";
import { crearRegistroEscaladoAction, vincularRegistroAction } from "@/lib/actions/gestion";

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

function statusTone(status: string): BadgeTone {
  if (status === "Cerrado" || status === "Cerrada" || status === "Eficaz") return "green";
  if (status === "Rechazado" || status === "No eficaz") return "red";
  if (status === "En análisis" || status === "En curso" || status === "Pendiente de verificación") return "violet";
  return "blue";
}

/**
 * Generaliza el patrón "crear/vincular" que ya tenía No Conformidad → Acción
 * Correctiva, para el resto de las escaladas que pidió el usuario:
 * Sugerencia → Oportunidad de Mejora, Queja/Reclamo → No Conformidad. La
 * mitad de "vincular una ya existente" reutiliza `vincularRegistroAction`
 * (la misma acción genérica de la pestaña Relaciones), no hace falta una
 * acción nueva para eso.
 */
export function EscalarTab({
  record,
  linkedRecords,
  targetTypeCode,
  targetTypeLabel,
  canEdit = true,
}: {
  record: SgcRecord;
  linkedRecords: RecordRelationship[];
  targetTypeCode: string;
  targetTypeLabel: string;
  canEdit?: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-avenida-black">{targetTypeLabel}</h2>
          <p className="text-sm text-muted">
            Creá una {targetTypeLabel.toLowerCase()} nueva a partir de este registro, o vinculá una que ya exista.
          </p>
        </div>

        {linkedRecords.length > 0 && (
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
            {linkedRecords.map((rel) => (
              <Link
                key={rel.id}
                href={`/gestion-calidad/registro/${rel.other.code}`}
                className="flex flex-wrap items-center justify-between gap-2 p-3 hover:bg-avenida-violet-light/10"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-avenida-violet">{rel.other.code}</span>
                  <span className="text-sm text-avenida-black">{rel.other.title}</span>
                </div>
                <Badge tone={statusTone(rel.other.status)}>{rel.other.status}</Badge>
              </Link>
            ))}
          </div>
        )}

        {canEdit && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <form action={crearRegistroEscaladoAction} className="flex flex-col gap-3 rounded-xl border border-border p-4">
              <p className="text-sm font-medium text-avenida-black">Crear una {targetTypeLabel.toLowerCase()} nueva</p>
              <input type="hidden" name="code" value={record.code} />
              <input type="hidden" name="targetTypeCode" value={targetTypeCode} />
              <Field label="Título">
                <input name="title" required placeholder="Ej.: Simplificar el alta de proveedores" className={inputClass} />
              </Field>
              <Field label="Descripción">
                <textarea name="description" required rows={3} className={inputClass} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Responsable">
                  <input name="responsible" required className={inputClass} />
                </Field>
                <Field label="Fecha objetivo">
                  <input type="date" name="dueDate" className={inputClass} />
                </Field>
              </div>
              <Field label="Prioridad">
                <select name="priority" defaultValue="Media" className={inputClass}>
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                </select>
              </Field>
              <div>
                <Button type="submit" variant="secondary" size="sm">
                  Crear {targetTypeLabel.toLowerCase()}
                </Button>
              </div>
            </form>

            <form action={vincularRegistroAction} className="flex flex-col gap-3 rounded-xl border border-border p-4">
              <p className="text-sm font-medium text-avenida-black">Vincular una {targetTypeLabel.toLowerCase()} ya existente</p>
              <input type="hidden" name="code" value={record.code} />
              <input type="hidden" name="label" value={`${targetTypeLabel} de ${record.code}`} />
              <Field label={`Código del registro ${targetTypeCode}`}>
                <input name="targetCode" required placeholder={`Ej.: ${targetTypeCode}-2026-003`} className={inputClass} />
              </Field>
              <div>
                <Button type="submit" variant="secondary" size="sm">
                  Vincular
                </Button>
              </div>
            </form>
          </div>
        )}
      </Card>
    </div>
  );
}
