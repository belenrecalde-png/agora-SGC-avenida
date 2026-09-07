import { ScrollText } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { listPlaneSyncLogs } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Logs | Ágora`,
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

function directionLabel(direction: string): string {
  return direction === "plane_to_portal" ? "Plane → Portal" : "Portal → Plane";
}

export default function LogsPage() {
  const logs = listPlaneSyncLogs(200);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-12">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
          <ScrollText className="h-6 w-6" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Configuración</p>
          <h1 className="text-2xl font-semibold text-avenida-black">Logs</h1>
        </div>
      </div>

      <p className="text-sm text-avenida-black">
        Historial de todo lo que el portal intentó hacer contra Plane: creación de work items al
        enviar un reporte, pruebas de conexión, y corridas de &quot;Sincronizar ahora&quot; desde{" "}
        <Link href="/configuracion/plane" className="text-avenida-violet hover:underline">
          Configuración → Plane
        </Link>
        . No incluye la sincronización hacia el Registro de Gestión en Apps Script — ese historial
        vive en el propio proyecto de Apps Script del usuario.
      </p>

      {logs.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-8 text-center">
          <p className="text-sm text-muted">Todavía no hay ninguna entrada en el log de Plane.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-avenida-violet-light/20 text-left text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Dirección</th>
                  <th className="px-4 py-3 font-medium">Evento</th>
                  <th className="px-4 py-3 font-medium">Registro</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border last:border-0 align-top hover:bg-avenida-violet-light/10">
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDateTime(log.created_at)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{directionLabel(log.direction)}</td>
                    <td className="px-4 py-3 text-avenida-black">{log.event}</td>
                    <td className="px-4 py-3">
                      {log.record_code ? (
                        <Link href={`/gestion-calidad/registro/${log.record_code}`} className="font-medium text-avenida-violet hover:underline">
                          {log.record_code}
                        </Link>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(log.status)}>{statusLabel(log.status)}</Badge>
                    </td>
                    <td className="max-w-[320px] px-4 py-3 text-muted">{log.detail ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
