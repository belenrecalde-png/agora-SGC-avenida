import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { listAreas } from "@/lib/db/queries";
import { crearRiesgoAction } from "@/lib/actions/risks";
import { requireCreateAccess } from "@/lib/auth/access";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Registrar riesgo u oportunidad | Ágora",
};

const FIELD_CLASS =
  "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-avenida-black placeholder:text-muted focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20";
const LABEL_CLASS = "text-sm font-medium text-avenida-black";

export default async function NuevoRiesgoPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  await requireCreateAccess("/planificacion/riesgos-y-oportunidades");
  const { kind } = await searchParams;
  const areas = listAreas({ onlyActive: true });
  const defaultKind = kind === "oportunidad" ? "oportunidad" : "riesgo";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-12">
      <Link
        href="/planificacion/riesgos-y-oportunidades"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-avenida-violet hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Riesgos y oportunidades
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-avenida-black">Registrar riesgo u oportunidad</h1>
        <p className="text-sm text-muted">
          No hace falta tener todo resuelto — con esto alcanza para que Calidad lo tome y le haga
          seguimiento.
        </p>
      </div>

      <Card className="p-6">
        <form action={crearRiesgoAction} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="kind" className={LABEL_CLASS}>
              Tipo
            </label>
            <select id="kind" name="kind" defaultValue={defaultKind} className={FIELD_CLASS}>
              <option value="riesgo">Riesgo — algo que podría generar un problema</option>
              <option value="oportunidad">Oportunidad — algo que podría mejorar un resultado</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className={LABEL_CLASS}>
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={3}
              placeholder="¿Qué podría pasar (o qué se podría aprovechar)?"
              className={FIELD_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="detail" className={LABEL_CLASS}>
              Detalle (opcional)
            </label>
            <textarea id="detail" name="detail" rows={3} className={FIELD_CLASS} />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="source" className={LABEL_CLASS}>
                Procedencia
              </label>
              <input
                id="source"
                name="source"
                type="text"
                placeholder="Ej.: Auditoría interna, reporte de colaborador"
                className={FIELD_CLASS}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="areaId" className={LABEL_CLASS}>
                Área relacionada
              </label>
              <select id="areaId" name="areaId" defaultValue="" className={FIELD_CLASS}>
                <option value="">No estoy seguro</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="processName" className={LABEL_CLASS}>
                Proceso relacionado (opcional)
              </label>
              <input id="processName" name="processName" type="text" className={FIELD_CLASS} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="activity" className={LABEL_CLASS}>
                Actividad (opcional)
              </label>
              <input id="activity" name="activity" type="text" className={FIELD_CLASS} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="existingControl" className={LABEL_CLASS}>
              Control existente (opcional)
            </label>
            <input
              id="existingControl"
              name="existingControl"
              type="text"
              placeholder="¿Hay algo ya en marcha que lo mitigue o lo favorezca?"
              className={FIELD_CLASS}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="probabilityInitial" className={LABEL_CLASS}>
                Probabilidad inicial
              </label>
              <select id="probabilityInitial" name="probabilityInitial" defaultValue="" className={FIELD_CLASS}>
                <option value="">Sin definir</option>
                <option value="1">1 — Baja</option>
                <option value="2">2 — Media</option>
                <option value="3">3 — Alta</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="impactInitial" className={LABEL_CLASS}>
                Impacto inicial
              </label>
              <select id="impactInitial" name="impactInitial" defaultValue="" className={FIELD_CLASS}>
                <option value="">Sin definir</option>
                <option value="1">1 — Insignificante</option>
                <option value="2">2 — Menor</option>
                <option value="3">3 — Moderado</option>
                <option value="4">4 — Mayor</option>
                <option value="5">5 — Crítico</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-muted">
            La valoración (probabilidad × impacto) se calcula sola y se puede editar después desde el
            detalle.
          </p>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="treatmentPlan" className={LABEL_CLASS}>
              Plan de tratamiento / contingencia (opcional)
            </label>
            <textarea id="treatmentPlan" name="treatmentPlan" rows={3} className={FIELD_CLASS} />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="responsible" className={LABEL_CLASS}>
                Responsable (opcional)
              </label>
              <input id="responsible" name="responsible" type="text" className={FIELD_CLASS} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="dueDate" className={LABEL_CLASS}>
                Fecha objetivo (opcional)
              </label>
              <input id="dueDate" name="dueDate" type="date" className={FIELD_CLASS} />
            </div>
          </div>

          <SubmitButton className="w-fit" pendingText="Guardando…">
            Guardar
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
