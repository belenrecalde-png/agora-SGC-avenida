import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getWorkItem, getWorkItemUrl, isPlaneConfigured, resolveWorkItemStatus } from "@/lib/plane/client";
import { vincularTicketAction } from "@/lib/actions/plane-tickets";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Vincular ticket | Ágora",
};

const FIELD_CLASS =
  "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-avenida-black placeholder:text-muted focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20";

export default async function VincularTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; workItemId?: string }>;
}) {
  const { projectId, workItemId } = await searchParams;

  if (!projectId || !workItemId) {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-4 pb-12">
        <Card className="p-6 text-sm text-muted">
          Falta indicar qué ticket de Plane vincular. Volvé al listado e intentá de nuevo.
        </Card>
        <Link href="/gestion-calidad/tickets-plane" className="text-sm font-medium text-avenida-violet hover:underline">
          Volver a Tickets Plane
        </Link>
      </div>
    );
  }

  if (!isPlaneConfigured()) {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-4 pb-12">
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
      <div className="mx-auto flex max-w-xl flex-col gap-4 pb-12">
        <Card className="p-6 text-sm text-red-700">{message}</Card>
        <Link href="/gestion-calidad/tickets-plane" className="text-sm font-medium text-avenida-violet hover:underline">
          Volver a Tickets Plane
        </Link>
      </div>
    );
  }

  const status = await resolveWorkItemStatus(projectId, ticket).catch(() => null);
  const planeUrl = getWorkItemUrl(projectId, workItemId);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 pb-12">
      <Link
        href="/gestion-calidad/tickets-plane"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-avenida-violet hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Tickets Plane
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-avenida-black">Vincular ticket a un registro existente</h1>
        <p className="text-sm text-muted">
          &ldquo;{ticket.name}&rdquo;{ticket.sequence_id ? ` (#${ticket.sequence_id})` : ""}
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
        <form action={vincularTicketAction} className="flex flex-col gap-4">
          <input type="hidden" name="planeProjectId" value={projectId} />
          <input type="hidden" name="planeWorkItemId" value={workItemId} />
          <input type="hidden" name="planeSequenceId" value={ticket.sequence_id ?? ""} />
          <input type="hidden" name="planeStatus" value={status?.name ?? ""} />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="recordCode" className="text-sm font-medium text-avenida-black">
              Código del registro del SGC
            </label>
            <input
              id="recordCode"
              name="recordCode"
              type="text"
              required
              placeholder="Ej: NC-2026-014"
              className={FIELD_CLASS}
            />
            <p className="text-xs text-muted">
              Tiene que ser el código exacto de un registro ya cargado en{" "}
              <Link href="/gestion-calidad/registro" className="text-avenida-violet hover:underline">
                Registro SGC
              </Link>
              .
            </p>
          </div>

          <Button type="submit" className="w-fit">
            Vincular ticket
          </Button>
        </form>
      </Card>
    </div>
  );
}
