import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listAreas } from "@/lib/db/queries";
import { crearIndicadorAction } from "@/lib/actions/indicators";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Nuevo indicador | Ágora",
};

const FIELD_CLASS =
  "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-avenida-black placeholder:text-muted focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20";
const LABEL_CLASS = "text-sm font-medium text-avenida-black";

export default function NuevoIndicadorPage() {
  const areas = listAreas({ onlyActive: true });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-12">
      <Link
        href="/evaluacion/indicadores"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-avenida-violet hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Indicadores
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-avenida-black">Nuevo indicador</h1>
        <p className="text-sm text-muted">Completá lo que sepas — el resto se puede editar después.</p>
      </div>

      <Card className="p-6">
        <form action={crearIndicadorAction} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className={LABEL_CLASS}>
              Nombre
            </label>
            <input id="name" name="name" type="text" required className={FIELD_CLASS} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className={LABEL_CLASS}>
              Descripción
            </label>
            <textarea id="description" name="description" rows={2} className={FIELD_CLASS} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="formula" className={LABEL_CLASS}>
              Fórmula
            </label>
            <input
              id="formula"
              name="formula"
              type="text"
              placeholder="Ej.: (tickets resueltos / tickets totales) × 100"
              className={FIELD_CLASS}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="source" className={LABEL_CLASS}>
                Fuente
              </label>
              <input id="source" name="source" type="text" className={FIELD_CLASS} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="unit" className={LABEL_CLASS}>
                Unidad
              </label>
              <input id="unit" name="unit" type="text" placeholder="%, días, tickets..." className={FIELD_CLASS} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="frequency" className={LABEL_CLASS}>
                Frecuencia
              </label>
              <select id="frequency" name="frequency" defaultValue="" className={FIELD_CLASS}>
                <option value="">Sin definir</option>
                <option value="Mensual">Mensual</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Semestral">Semestral</option>
                <option value="Anual">Anual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="targetValue" className={LABEL_CLASS}>
                Meta
              </label>
              <input id="targetValue" name="targetValue" type="number" step="any" className={FIELD_CLASS} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="tolerance" className={LABEL_CLASS}>
                Tolerancia (± sobre la meta)
              </label>
              <input id="tolerance" name="tolerance" type="number" step="any" className={FIELD_CLASS} />
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

          <div className="flex flex-col gap-1.5">
            <label htmlFor="processName" className={LABEL_CLASS}>
              Proceso relacionado (opcional)
            </label>
            <input id="processName" name="processName" type="text" className={FIELD_CLASS} />
          </div>

          <Button type="submit" className="w-fit">
            Guardar
          </Button>
        </form>
      </Card>
    </div>
  );
}
