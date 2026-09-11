import Link from "next/link";
import { CircleX, ListChecks, Ticket } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TicketsPlaneTable } from "@/components/gestion-calidad/tickets-plane-table";
import { listTicketsPlaneRows } from "@/lib/plane/tickets";
import { hasFullAreaAccess, requireTicketsPlaneAccess } from "@/lib/auth/access";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tickets Plane | Ágora",
};

export default async function TicketsPlanePage() {
  const user = await requireTicketsPlaneAccess();
  const onlyAreaId = hasFullAreaAccess(user.role) ? undefined : user.area_id;
  const { configured, projects, rows, projectErrors } = await listTicketsPlaneRows(onlyAreaId);

  const pendientes = rows.filter((r) => r.classification === "pending").length;
  const tipificados = rows.filter((r) => r.classification === "linked").length;
  const noAplican = rows.filter((r) => r.classification === "dismissed").length;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
            <Ticket className="h-6 w-6" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Gestión de Calidad</p>
            <h1 className="text-2xl font-semibold text-avenida-black">Tickets Plane</h1>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-avenida-black">
          Work items de Plane pendientes de tipificar, ya vinculados a un registro del SGC, o marcados
          como &ldquo;no aplica&rdquo;.
        </p>
        {!configured ? (
          <Badge tone="gray" className="w-fit">
            Plane no está configurado en este entorno — ver{" "}
            <Link href="/configuracion/plane" className="underline">
              Configuración → Plane
            </Link>
            .
          </Badge>
        ) : projects.length === 0 ? (
          <Badge tone="gray" className="w-fit">
            Todavía no hay ningún proyecto de Plane mapeado — ver{" "}
            <Link href="/configuracion/plane" className="underline">
              Configuración → Plane
            </Link>
            .
          </Badge>
        ) : (
          <Badge tone="gray" className="w-fit">
            {rows.length} {rows.length === 1 ? "ticket" : "tickets"} · {pendientes} pendientes de tipificar ·{" "}
            {projects.map((p) => p.name).join(", ")}
          </Badge>
        )}
        {configured && projects.some((p) => p.importLabel) && (
          <p className="text-xs text-muted">
            Filtrado por etiqueta:{" "}
            {projects
              .filter((p) => p.importLabel)
              .map((p) => `${p.name} → "${p.importLabel}"`)
              .join(" · ")}
            . Los proyectos sin etiqueta muestran todos sus tickets. Se puede ajustar en{" "}
            <Link href="/configuracion/plane" className="text-avenida-violet hover:underline">
              Configuración → Plane
            </Link>
            .
          </p>
        )}
      </div>

      {projectErrors.length > 0 && (
        <Card className="flex flex-col gap-1.5 border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">No se pudo traer tickets de algunos proyectos</p>
          {projectErrors.map((error) => (
            <p key={error.projectId} className="text-xs text-red-700">
              {error.projectName}: {error.message}
            </p>
          ))}
        </Card>
      )}

      {configured && projects.length > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row">
          <Card className="flex flex-1 flex-col gap-3 p-4">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-avenida-violet-light text-avenida-violet">
              <Ticket className="h-4 w-4" />
            </span>
            <div>
              <p className="text-2xl font-semibold text-avenida-black">{pendientes}</p>
              <p className="text-xs text-muted">Pendientes de tipificar</p>
            </div>
          </Card>
          <Card className="flex flex-1 flex-col gap-3 p-4">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-avenida-blue-light text-avenida-blue">
              <ListChecks className="h-4 w-4" />
            </span>
            <div>
              <p className="text-2xl font-semibold text-avenida-black">{tipificados}</p>
              <p className="text-xs text-muted">Tipificados o vinculados</p>
            </div>
          </Card>
          <Card className="flex flex-1 flex-col gap-3 p-4">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-avenida-gray/40 text-avenida-black">
              <CircleX className="h-4 w-4" />
            </span>
            <div>
              <p className="text-2xl font-semibold text-avenida-black">{noAplican}</p>
              <p className="text-xs text-muted">No aplican al SGC</p>
            </div>
          </Card>
        </div>
      )}

      <TicketsPlaneTable rows={rows} projects={projects} />
    </div>
  );
}
