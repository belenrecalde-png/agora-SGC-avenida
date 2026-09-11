import Link from "next/link";
import { Boxes, Plug, ScrollText, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listAreas, listPlaneProjectMappings, listPlaneSyncLogs } from "@/lib/db/queries";
import { getPlaneConfigStatus } from "@/lib/plane/client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Integraciones | Ágora`,
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function IntegracionesPage() {
  const configStatus = getPlaneConfigStatus();
  const mappings = listPlaneProjectMappings();
  const activeMappings = mappings.filter((m) => m.active);
  const areas = listAreas();
  const lastLog = listPlaneSyncLogs(1)[0];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-12">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
          <Boxes className="h-6 w-6" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Configuración</p>
          <h1 className="text-2xl font-semibold text-avenida-black">Integraciones</h1>
        </div>
      </div>

      <p className="text-sm text-avenida-black">
        Las integraciones activas del portal, en un solo lugar. Cada una tiene su propia pantalla de
        configuración con el detalle completo.
      </p>

      <Card className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-avenida-blue-light text-avenida-blue">
              <Plug className="h-4 w-4" />
            </span>
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-avenida-black">Plane</p>
              <p className="text-xs text-muted">Crea un work item en Plane por cada reporte nuevo de un área mapeada.</p>
            </div>
          </div>
          <Badge tone={configStatus.configured ? "green" : "gray"}>
            {configStatus.configured ? "Configurada" : "Falta configurar"}
          </Badge>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border p-3">
            <p className="text-xs text-muted">Áreas mapeadas</p>
            <p className="text-sm font-medium text-avenida-black">
              {activeMappings.length} de {areas.length}
            </p>
          </div>
          <div className="rounded-xl border border-border p-3 sm:col-span-2">
            <p className="text-xs text-muted">Última actividad registrada</p>
            <p className="text-sm font-medium text-avenida-black">
              {lastLog ? `${formatDateTime(lastLog.created_at)} · ${lastLog.event}` : "Todavía no hay ninguna."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/configuracion/plane" className="inline-flex items-center gap-1 text-sm font-medium text-avenida-violet hover:underline">
            Ver configuración de Plane <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link href="/configuracion/logs" className="inline-flex items-center gap-1 text-sm font-medium text-avenida-violet hover:underline">
            Ver historial completo <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-avenida-blue-light text-avenida-blue">
              <ScrollText className="h-4 w-4" />
            </span>
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-avenida-black">Apps Script (Registro de Gestión en Sheets)</p>
              <p className="text-xs text-muted">
                Sincroniza el Registro de Gestión en Google Sheets del área con Plane, del lado de Sheets.
              </p>
            </div>
          </div>
          <Badge tone="blue">Independiente del portal</Badge>
        </div>
        <p className="text-sm text-avenida-black">
          Corre por afuera de Ágora, dentro del proyecto de Apps Script vinculado a esa planilla —
          el portal no tiene forma de leer su estado ni su historial de corridas en tiempo real, así
          que esta tarjeta no muestra números. Ese historial vive en el propio proyecto de Apps
          Script del usuario. Es una integración separada de la de Plane de acá arriba: una sincroniza
          los reportes cargados en el portal, la otra sincroniza la planilla de Sheets — no se cruzan
          entre sí todavía.
        </p>
        <Link href="/configuracion/apps-script" className="inline-flex w-fit items-center gap-1 text-sm font-medium text-avenida-violet hover:underline">
          Ver Configuración → Apps Script <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Card>
    </div>
  );
}
