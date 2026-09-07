import { Plug } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listAreas, listPlaneProjectMappings, listPlaneSyncLogs } from "@/lib/db/queries";
import { getPlaneConfigStatus } from "@/lib/plane/client";
import {
  deletePlaneMappingAction,
  syncNowAction,
  testPlaneConnectionAction,
  togglePlaneMappingAction,
  upsertPlaneMappingAction,
} from "@/lib/actions/plane";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Plane | Ágora`,
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function statusTone(status: string): BadgeTone {
  if (status === "success") return "green";
  if (status === "error") return "red";
  return "gray";
}

function statusLabel(status: string): string {
  if (status === "success") return "OK";
  if (status === "error") return "Error";
  return "Salteado";
}

export default function PlanePage() {
  const areas = listAreas();
  const mappings = listPlaneProjectMappings();
  const configStatus = getPlaneConfigStatus();
  const recentAttempts = listPlaneSyncLogs(8);

  const mappingByArea = new Map(mappings.map((m) => [m.area_id, m]));
  const unmappedAreas = areas.filter((area) => !mappingByArea.has(area.id));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-12">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
          <Plug className="h-6 w-6" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Configuración</p>
          <h1 className="text-2xl font-semibold text-avenida-black">Plane</h1>
        </div>
      </div>

      <p className="text-sm text-avenida-black">
        Cada reporte nuevo que tenga un área con proyecto de Plane mapeado crea automáticamente un
        work item ahí. Las credenciales de Plane nunca se cargan en esta pantalla ni en el código —
        se configuran como variables de entorno en el servidor donde se despliegue el portal (ver{" "}
        <code className="rounded bg-avenida-gray/40 px-1 py-0.5 text-xs">.env.example</code> y el
        README).
      </p>

      <Card className="flex flex-col gap-3 p-5">
        <p className="text-sm font-semibold text-avenida-black">Estado de la configuración</p>
        <div className="flex flex-col gap-2 text-sm">
          {[
            { label: "PLANE_BASE_URL", ok: configStatus.baseUrl },
            { label: "PLANE_WORKSPACE_SLUG", ok: configStatus.workspaceSlug },
            { label: "PLANE_API_KEY", ok: configStatus.apiKey },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <code className="text-xs text-avenida-black">{row.label}</code>
              <Badge tone={row.ok ? "green" : "gray"}>{row.ok ? "Configurada" : "Falta configurar"}</Badge>
            </div>
          ))}
        </div>
        {!configStatus.configured && (
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
            Plane todavía no está configurado en este entorno — los reportes se siguen creando
            normalmente en el portal, pero no se crea ningún work item hasta que se carguen las tres
            variables de entorno.
          </p>
        )}
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-avenida-black">Mapeo de áreas → proyectos de Plane</p>
          <form action={syncNowAction}>
            <Button type="submit" variant="secondary" size="sm">
              Sincronizar ahora
            </Button>
          </form>
        </div>
        <p className="text-xs text-muted">
          El ID de proyecto es el UUID real del proyecto en tu instancia de Plane (se ve en la URL del
          proyecto). Cargalo vos — el portal no lo puede adivinar ni tiene acceso a tu instancia.
        </p>

        {mappings.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted">
            Todavía no hay ningún área mapeada a un proyecto de Plane.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {mappings.map((mapping) => {
              const area = areas.find((a) => a.id === mapping.area_id);
              return (
                <div key={mapping.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-avenida-black">{area?.name ?? mapping.area_id}</p>
                    <p className="text-xs text-muted">
                      {mapping.plane_project_name ? `${mapping.plane_project_name} — ` : ""}
                      <code>{mapping.plane_project_id}</code>
                    </p>
                    {!mapping.active && <Badge tone="gray">Mapeo desactivado</Badge>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <form action={testPlaneConnectionAction}>
                      <input type="hidden" name="planeProjectId" value={mapping.plane_project_id} />
                      <Button type="submit" variant="secondary" size="sm">
                        Probar conexión
                      </Button>
                    </form>
                    <form action={togglePlaneMappingAction}>
                      <input type="hidden" name="id" value={mapping.id} />
                      <Button type="submit" variant="secondary" size="sm">
                        {mapping.active ? "Desactivar" : "Activar"}
                      </Button>
                    </form>
                    <form action={deletePlaneMappingAction}>
                      <input type="hidden" name="id" value={mapping.id} />
                      <Button type="submit" variant="ghost" size="sm">
                        Eliminar
                      </Button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-3 p-5">
        <p className="text-sm font-semibold text-avenida-black">Mapear un área</p>
        <form action={upsertPlaneMappingAction} className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              name="areaId"
              required
              defaultValue=""
              className="h-10 flex-1 rounded-xl border border-border bg-white px-3 text-sm text-avenida-black focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20"
            >
              <option value="" disabled>
                Elegir área
              </option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                  {mappingByArea.has(area.id) ? " (ya mapeada — se actualiza)" : ""}
                </option>
              ))}
            </select>
          </div>
          <input
            name="planeProjectId"
            type="text"
            required
            placeholder="ID de proyecto de Plane (UUID)"
            className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-avenida-black placeholder:text-muted focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20"
          />
          <input
            name="planeProjectName"
            type="text"
            placeholder="Nombre del proyecto en Plane (opcional, solo para mostrar acá)"
            className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-avenida-black placeholder:text-muted focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20"
          />
          <Button type="submit" className="self-start">
            Guardar mapeo
          </Button>
        </form>
        {unmappedAreas.length > 0 && (
          <p className="text-xs text-muted">
            Áreas sin mapear todavía: {unmappedAreas.map((a) => a.name).join(", ")}.
          </p>
        )}
      </Card>

      <Card className="flex flex-col gap-3 p-5">
        <p className="text-sm font-semibold text-avenida-black">Últimos intentos</p>
        {recentAttempts.length === 0 ? (
          <p className="text-sm text-muted">Todavía no hay ningún intento de conexión o sincronización registrado.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {recentAttempts.map((log) => (
              <div key={log.id} className="flex flex-col gap-1 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-avenida-black">{log.event}</span>
                  <Badge tone={statusTone(log.status)}>{statusLabel(log.status)}</Badge>
                </div>
                <p className="text-xs text-muted">
                  {formatDateTime(log.created_at)}
                  {log.record_code ? ` · ${log.record_code}` : ""}
                </p>
                {log.detail && <p className="text-xs text-avenida-black">{log.detail}</p>}
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted">
          Ver el historial completo en{" "}
          <a href="/configuracion/logs" className="text-avenida-violet hover:underline">
            Configuración → Logs
          </a>
          .
        </p>
      </Card>
    </div>
  );
}
