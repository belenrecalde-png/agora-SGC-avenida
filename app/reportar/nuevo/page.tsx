import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listAreas, listRecordTypes } from "@/lib/db/queries";
import { createReportAction } from "@/lib/actions/reports";
import { getCurrentUser } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Nuevo reporte | Ágora",
};

const FIELD_CLASS =
  "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-avenida-black placeholder:text-muted focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20";
const LABEL_CLASS = "text-sm font-medium text-avenida-black";

export default async function NuevoReportePage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; categoria?: string }>;
}) {
  const { tipo } = await searchParams;
  const types = listRecordTypes({ onlyActive: true });
  const areas = listAreas({ onlyActive: true });
  const defaultType = types.find((t) => t.code === tipo)?.code ?? types[0]?.code;
  const currentUser = await getCurrentUser();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-12">
      <Link
        href="/reportar"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-avenida-violet hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a categorías
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-avenida-black">Contanos qué pasó</h1>
        <p className="text-sm text-muted">
          No hace falta que tengas todo el análisis hecho — con esto alcanza para que Calidad lo
          tome y le haga seguimiento.
        </p>
      </div>

      <Card className="p-6">
        <form action={createReportAction} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="typeCode" className={LABEL_CLASS}>
              Tipo (orientativo)
            </label>
            <select id="typeCode" name="typeCode" defaultValue={defaultType} className={FIELD_CLASS} required>
              {types.map((type) => (
                <option key={type.id} value={type.code}>
                  {type.name} ({type.code})
                </option>
              ))}
            </select>
            <p className="text-xs text-muted">La clasificación final siempre la valida Calidad.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className={LABEL_CLASS}>
              Título
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={140}
              placeholder="Un resumen corto de la situación"
              className={FIELD_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className={LABEL_CLASS}>
              ¿Qué ocurrió?
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              placeholder="Contá con el mayor detalle posible qué pasó, cuándo lo notaste y a quién afectó."
              className={FIELD_CLASS}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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

            <div className="flex flex-col gap-1.5">
              <label htmlFor="processName" className={LABEL_CLASS}>
                Proceso relacionado (opcional)
              </label>
              <input
                id="processName"
                name="processName"
                type="text"
                placeholder="Ej: Onboarding de sellers"
                className={FIELD_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="eventDate" className={LABEL_CLASS}>
                Fecha del hecho
              </label>
              <input id="eventDate" name="eventDate" type="date" className={FIELD_CLASS} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reporterName" className={LABEL_CLASS}>
                Tu nombre
              </label>
              <input
                id="reporterName"
                name="reporterName"
                type="text"
                required
                defaultValue={currentUser?.name ?? ""}
                placeholder="Nombre y apellido"
                className={FIELD_CLASS}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="impact" className={LABEL_CLASS}>
              Impacto observado (opcional)
            </label>
            <input
              id="impact"
              name="impact"
              type="text"
              placeholder="Ej: 3 sellers no pudieron cobrar durante 2 horas"
              className={FIELD_CLASS}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="priority" className={LABEL_CLASS}>
                Prioridad percibida
              </label>
              <select id="priority" name="priority" defaultValue="Media" className={FIELD_CLASS}>
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
            </div>

            <div className="flex items-end gap-2 pb-2.5">
              <input id="urgent" name="urgent" type="checkbox" className="h-4 w-4 accent-avenida-violet" />
              <label htmlFor="urgent" className="text-sm text-avenida-black">
                Necesita atención urgente
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="evidenceNote" className={LABEL_CLASS}>
              Evidencia (opcional)
            </label>
            <input
              id="evidenceNote"
              name="evidenceNote"
              type="text"
              placeholder="Describí o pegá un link a una captura, mail o archivo"
              className={FIELD_CLASS}
            />
            <p className="text-xs text-muted">
              La carga de archivos adjuntos se habilita en una fase posterior — por ahora, dejá un
              link o una descripción de dónde encontrar la evidencia.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="comments" className={LABEL_CLASS}>
              Comentarios (opcional)
            </label>
            <textarea id="comments" name="comments" rows={3} className={FIELD_CLASS} />
          </div>

          <Button type="submit" className="w-fit">
            Enviar reporte
          </Button>
        </form>
      </Card>
    </div>
  );
}
