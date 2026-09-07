import { Bell, CalendarClock, ClipboardList, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MIS_REPORTES,
  MIS_ACCIONES,
  VENCIMIENTOS,
  NOTIFICACIONES,
} from "@/lib/mock-mi-sgc";

export const metadata = {
  title: "Mi SGC | Ágora",
};

function statusTone(status: string): "violet" | "green" | "gray" | "amber" {
  if (status === "Cerrado" || status === "Implementada") return "green";
  if (status === "En evaluación" || status === "En curso") return "violet";
  if (status === "Pendiente") return "amber";
  return "gray";
}

export default function MiSGCPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-avenida-black">Mi SGC</h1>
        <p className="text-sm text-muted">
          Tu vista personal: lo que reportaste, lo que tenés asignado y lo que se vence pronto.
        </p>
        <p className="text-xs text-muted">
          Datos de ejemplo — se conectan a tus registros reales en la Fase 3.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-avenida-violet" />
              <CardTitle>Mis reportes</CardTitle>
            </div>
            <CardDescription>Situaciones que reportaste desde el portal.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {MIS_REPORTES.map((item) => (
              <div
                key={item.code}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-avenida-black">{item.title}</p>
                  <p className="text-xs text-muted">
                    {item.code} · {item.date}
                  </p>
                </div>
                <Badge tone={statusTone(item.status)}>{item.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-avenida-violet" />
              <CardTitle>Mis acciones asignadas</CardTitle>
            </div>
            <CardDescription>Acciones correctivas y preventivas a tu cargo.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {MIS_ACCIONES.map((item) => (
              <div
                key={item.code}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-avenida-black">{item.title}</p>
                  <p className="text-xs text-muted">
                    {item.code} · vence {item.due}
                  </p>
                </div>
                <Badge tone={statusTone(item.status)}>{item.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-avenida-violet" />
              <CardTitle>Próximos vencimientos</CardTitle>
            </div>
            <CardDescription>Ordenados por urgencia.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {VENCIMIENTOS.map((item) => (
              <div
                key={item.code}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-avenida-black">{item.label}</p>
                  <p className="text-xs text-muted">{item.code}</p>
                </div>
                <Badge tone={item.overdue ? "red" : "gray"}>
                  {item.overdue ? "Vencido" : item.due}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-avenida-violet" />
              <CardTitle>Últimos movimientos</CardTitle>
            </div>
            <CardDescription>Notificaciones recientes relacionadas a vos.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {NOTIFICACIONES.map((item, index) => (
              <div key={index} className="rounded-xl border border-border p-3">
                <p className="text-sm text-avenida-black">{item.text}</p>
                <p className="mt-1 text-xs text-muted">{item.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
