import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { listAreas, listIndicators } from "@/lib/db/queries";
import { crearObjetivoAction } from "@/lib/actions/objectives";
import { requireCreateAccess } from "@/lib/auth/access";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Nuevo objetivo | Ágora",
};

const FIELD_CLASS =
  "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-avenida-black placeholder:text-muted focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20";
const LABEL_CLASS = "text-sm font-medium text-avenida-black";

export default async function NuevoObjetivoPage() {
  await requireCreateAccess("/planificacion/objetivos-de-calidad");
  const areas = listAreas({ onlyActive: true });
  const indicators = listIndicators();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-12">
      <Link
        href="/planificacion/objetivos-de-calidad"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-avenida-violet hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Objetivos de Calidad
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-avenida-black">Nuevo objetivo de Calidad</h1>
        <p className="text-sm text-muted">Completá lo que sepas — el resto se puede editar después.</p>
      </div>

      <Card className="p-6">
        <form action={crearObjetivoAction} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className={LABEL_CLASS}>
              Objetivo
            </label>
            <textarea id="title" name="title" required rows={2} className={FIELD_CLASS} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="goal" className={LABEL_CLASS}>
              Meta
            </label>
            <textarea id="goal" name="goal" rows={2} className={FIELD_CLASS} />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="targetValue" className={LABEL_CLASS}>
                Meta numérica (opcional)
              </label>
              <input id="targetValue" name="targetValue" type="number" step="any" className={FIELD_CLASS} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="unit" className={LABEL_CLASS}>
                Unidad
              </label>
              <input id="unit" name="unit" type="text" placeholder="%, días, tickets..." className={FIELD_CLASS} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="indicatorId" className={LABEL_CLASS}>
                Indicador asociado (opcional)
              </label>
              <select id="indicatorId" name="indicatorId" defaultValue="" className={FIELD_CLASS}>
                <option value="">Sin definir</option>
                {indicators.map((indicator) => (
                  <option key={indicator.id} value={indicator.id}>
                    {indicator.code} — {indicator.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="indicatorText" className={LABEL_CLASS}>
                Indicador (texto libre, opcional)
              </label>
              <input
                id="indicatorText"
                name="indicatorText"
                type="text"
                placeholder="Si no coincide con ningún indicador cargado en el portal"
                className={FIELD_CLASS}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="policyPrinciple" className={LABEL_CLASS}>
                Principio de la Política de Calidad (opcional)
              </label>
              <input id="policyPrinciple" name="policyPrinciple" type="text" className={FIELD_CLASS} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="areaId" className={LABEL_CLASS}>
                Área
              </label>
              <select id="areaId" name="areaId" defaultValue="" className={FIELD_CLASS}>
                <option value="">Sin definir</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="responsible" className={LABEL_CLASS}>
                Responsable
              </label>
              <input id="responsible" name="responsible" type="text" className={FIELD_CLASS} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="startDate" className={LABEL_CLASS}>
                Fecha de inicio
              </label>
              <input id="startDate" name="startDate" type="date" className={FIELD_CLASS} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="endDate" className={LABEL_CLASS}>
                Fecha objetivo
              </label>
              <input id="endDate" name="endDate" type="date" className={FIELD_CLASS} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="frequency" className={LABEL_CLASS}>
                Frecuencia de seguimiento
              </label>
              <select id="frequency" name="frequency" defaultValue="" className={FIELD_CLASS}>
                <option value="">Sin definir</option>
                <option value="Mensual">Mensual</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Semestral">Semestral</option>
                <option value="Anual">Anual</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="method" className={LABEL_CLASS}>
                Método de medición
              </label>
              <input id="method" name="method" type="text" className={FIELD_CLASS} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="resources" className={LABEL_CLASS}>
              Recursos (opcional)
            </label>
            <input id="resources" name="resources" type="text" className={FIELD_CLASS} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="processName" className={LABEL_CLASS}>
              Proceso relacionado (opcional)
            </label>
            <input id="processName" name="processName" type="text" className={FIELD_CLASS} />
          </div>

          <SubmitButton className="w-fit" pendingText="Guardando…">
            Guardar
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
