import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listAreas, listRecordTypes } from "@/lib/db/queries";
import {
  getWorkItem,
  getWorkItemUrl,
  isPlaneConfigured,
  mapPlanePriorityToPortal,
  resolveWorkItemStatus,
  stripHtml,
} from "@/lib/plane/client";
import { tipificarTicketAction } from "@/lib/actions/plane-tickets";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tipificar ticket | Ágora",
};

const FIELD_CLASS =
  "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-avenida-black placeholder:text-muted focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20";
const LABEL_CLASS = "text-sm font-medium text-avenida-black";

export default async function TipificarTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; workItemId?: string }>;
}) {
  const { projectId, workItemId } = await searchParams;

  if (!projectId || !workItemId) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 pb-12">
        <Card className="p-6 text-sm text-muted">
          Falta indicar qué ticket de Plane tipificar. Volvé al listado e intentá de nuevo.
        </Card>
        <Link href="/gestion-calidad/tickets-plane" className="text-sm font-medium text-avenida-violet hover:underline">
          Volver a Tickets Plane
        </Link>
      </div>
    );
  }

  if (!isPlaneConfigured()) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 pb-12">
        <Card className="p-6 text-sm text-muted">Plane no está configurado en este entorno.</Card>
        <Link href="/gestion-calidad/tickets-plane" className="text-sm font-medium text-avenida-violet hover:underline">
          Volver a Tickets Plane
        </Link>
      </div>
    );
  }

  let ticket;
  try {
    ticket = await getWorkItem(projectId, workItemId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo traer el ticket de Plane.";
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 pb-12">
        <Card className="p-6 text-sm text-red-700">{message}</Card>
        <Link href="/gestion-calidad/tickets-plane" className="text-sm font-medium text-avenida-violet hover:underline">
          Volver a Tickets Plane
        </Link>
      </div>
    );
  }

  const status = await resolveWorkItemStatus(projectId, ticket).catch(() => null);
  const planeUrl = getWorkItemUrl(projectId, workItemId);
  const descriptionText = stripHtml(ticket.description_html);
  const defaultPriority = mapPlanePriorityToPortal(ticket.priority);

  const types = listRecordTypes({ onlyActive: true });
  const areas = listAreas({ onlyActive: true });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-12">
      <Link
        href="/gestion-calidad/tickets-plane"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-avenida-violet hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Tickets Plane
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-avenida-black">Tipificar ticket de Plane</h1>
        <p className="text-sm text-muted">
          Se crea un registro nuevo del SGC ya vinculado a este ticket
          {ticket.sequence_id ? ` (#${ticket.sequence_id})` : ""}
          {status?.name ? ` — estado actual en Plane: ${status.name}` : ""}.
        </p>
        {planeUrl && (
          <a
            href={planeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-avenida-violet hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver ticket original en Plane
          </a>
        )}
      </div>

      <Card className="p-6">
        <form action={tipificarTicketAction} className="flex flex-col gap-5">
          <input type="hidden" name="planeProjectId" value={projectId} />
          <input type="hidden" name="planeWorkItemId" value={workItemId} />
          <input type="hidden" name="planeSequenceId" value={ticket.sequence_id ?? ""} />
          <input type="hidden" name="planeStatus" value={status?.name ?? ""} />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="typeCode" className={LABEL_CLASS}>
              Clasificación SGC
            </label>
            <select id="typeCode" name="typeCode" defaultValue={types[0]?.code} className={FIELD_CLASS} required>
              {types.map((type) => (
                <option key={type.id} value={type.code}>
                  {type.name} ({type.code})
                </option>
              ))}
            </select>
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
              defaultValue={ticket.name}
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
              defaultValue={descriptionText}
              placeholder="El ticket de Plane no traía descripción — completala acá."
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
              <p className="text-xs text-muted">Plane no trae este dato — se define acá, al tipificar.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="processName" className={LABEL_CLASS}>
                Proceso relacionado (opcional)
              </label>
              <input id="processName" name="processName" type="text" className={FIELD_CLASS} />
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
                Responsable / quién lo tipifica
              </label>
              <input
                id="reporterName"
                name="reporterName"
                type="text"
                required
                placeholder="Nombre y apellido"
                className={FIELD_CLASS}
              />
              <p className="text-xs text-muted">Plane tampoco trae este dato de forma confiable.</p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="impact" className={LABEL_CLASS}>
              Impacto observado (opcional)
            </label>
            <input id="impact" name="impact" type="text" className={FIELD_CLASS} />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="priority" className={LABEL_CLASS}>
                Prioridad
              </label>
              <select id="priority" name="priority" defaultValue={defaultPriority} className={FIELD_CLASS}>
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
              <p className="text-xs text-muted">Prellenada desde la prioridad del ticket en Plane.</p>
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
            <input id="evidenceNote" name="evidenceNote" type="text" className={FIELD_CLASS} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="comments" className={LABEL_CLASS}>
              Comentarios (opcional)
            </label>
            <textarea id="comments" name="comments" rows={3} className={FIELD_CLASS} />
          </div>

          <Button type="submit" className="w-fit">
            Crear registro y vincular
          </Button>
        </form>
      </Card>
    </div>
  );
}
