import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";
import type { RecordRelationship, SgcRecord } from "@/lib/db/queries";
import {
  crearAccionCorrectivaAction,
  guardarAnalisisAction,
  vincularAccionExistenteAction,
} from "@/lib/actions/gestion";

const ROOT_CAUSE_METHODS = [
  { value: "", label: "Sin definir" },
  { value: "5-porques", label: "5 Por Qué" },
  { value: "ishikawa", label: "Ishikawa (causa-efecto)" },
  { value: "otro", label: "Otro método" },
];

function statusTone(status: string): BadgeTone {
  if (status === "Cerrado" || status === "Cerrada" || status === "Eficaz") return "green";
  if (status === "Rechazado" || status === "No eficaz") return "red";
  if (status === "En análisis" || status === "En curso" || status === "Pendiente de verificación") return "violet";
  return "blue";
}

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

export function AnalisisTab({
  record,
  correctiveActions,
}: {
  record: SgcRecord;
  correctiveActions: RecordRelationship[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-avenida-black">Corrección inmediata y análisis de causa raíz</h2>
          <p className="text-sm text-muted">
            La corrección soluciona el síntoma ahora. La Acción Correctiva (más abajo) es lo que evita que vuelva a
            pasar, atacando la causa raíz.
          </p>
        </div>
        <form action={guardarAnalisisAction} className="flex flex-col gap-4">
          <input type="hidden" name="code" value={record.code} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Acción de corrección inmediata">
              <input
                name="correctionAction"
                defaultValue={record.correction_action ?? ""}
                placeholder="¿Qué se hizo para resolver el síntoma ahora?"
                className={inputClass}
              />
            </Field>
            <Field label="Responsable de la corrección">
              <input name="correctionResponsible" defaultValue={record.correction_responsible ?? ""} className={inputClass} />
            </Field>
            <Field label="Fecha de la corrección">
              <input type="date" name="correctionDate" defaultValue={record.correction_date ?? ""} className={inputClass} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Método de análisis">
              <select name="rootCauseMethod" defaultValue={record.root_cause_method ?? ""} className={inputClass}>
                {ROOT_CAUSE_METHODS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Causa raíz identificada">
              <input
                name="rootCause"
                defaultValue={record.root_cause ?? ""}
                placeholder="La causa de fondo, no el síntoma"
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Desarrollo del análisis">
            <textarea
              name="rootCauseAnalysis"
              defaultValue={record.root_cause_analysis ?? ""}
              rows={4}
              placeholder="Ej.: cadena de 5 Por Qué, o el detalle de las categorías del diagrama de Ishikawa"
              className={inputClass}
            />
          </Field>
          <div>
            <Button type="submit" size="sm">
              Guardar análisis
            </Button>
          </div>
        </form>
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-avenida-black">Acciones Correctivas</h2>
          <p className="text-sm text-muted">Elimina la causa raíz para que la No Conformidad no se repita.</p>
        </div>

        {correctiveActions.length > 0 && (
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
            {correctiveActions.map((rel) => (
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

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <form action={crearAccionCorrectivaAction} className="flex flex-col gap-3 rounded-xl border border-border p-4">
            <p className="text-sm font-medium text-avenida-black">Crear una Acción Correctiva nueva</p>
            <input type="hidden" name="code" value={record.code} />
            <Field label="Título">
              <input name="title" required placeholder="Ej.: Reforzar control de stock en el panel" className={inputClass} />
            </Field>
            <Field label="Acción a realizar">
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
                Crear Acción Correctiva
              </Button>
            </div>
          </form>

          <form action={vincularAccionExistenteAction} className="flex flex-col gap-3 rounded-xl border border-border p-4">
            <p className="text-sm font-medium text-avenida-black">Vincular una Acción Correctiva ya existente</p>
            <input type="hidden" name="code" value={record.code} />
            <Field label="Código del registro AC">
              <input name="targetCode" required placeholder="Ej.: AC-2026-003" className={inputClass} />
            </Field>
            <div>
              <Button type="submit" variant="secondary" size="sm">
                Vincular
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
