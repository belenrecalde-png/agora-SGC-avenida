import Link from "next/link";
import { Bell, CalendarClock, ClipboardList, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getMisAccionesAsignadas,
  getMisMovimientosRecientes,
  getMisReportes,
  getMisVencimientos,
} from "@/lib/mi-sgc-data";
import { requireUser } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mi SGC | Ágora",
};

function statusTone(status: string): "violet" | "green" | "gray" | "amber" | "red" {
  if (status === "Cerrado" || status === "Resuelto") return "green";
  if (status === "Rechazado") return "gray";
  if (status === "En análisis" || status === "En curso") return "violet";
  if (status === "Recibido") return "amber";
  return "gray";
}

export default async function MiSGCPage() {
  const user = await requireUser();
  const misReportes = getMisReportes(user);
  const misAcciones = getMisAccionesAsignadas(user);
  const misVencimientos = getMisVencimientos(user);
  const misMovimientos = getMisMovimientosRecientes(user);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-avenida-black">Mi SGC</h1>
        <p className="text-sm text-muted">
          Tu vista personal: lo que reportaste, lo que tenés asignado y lo que se vence pronto.
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
            {misReportes.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted">
                Todavía no reportaste nada.{" "}
                <Link href="/reportar/nuevo" className="text-avenida-violet hover:underline">
                  Reportar una situación
                </Link>
              </p>
            ) : (
              misReportes.map((item) => (
                <Link
                  key={item.code}
                  href={item.href}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 hover:bg-avenida-violet-light/10"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-avenida-black">{item.title}</p>
                    <p className="text-xs text-muted">
                      {item.code} · {item.date}
                    </p>
                  </div>
                  <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                </Link>
              ))
            )}
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
            {misAcciones.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted">
                No tenés ninguna acción asignada por ahora.
              </p>
            ) : (
              misAcciones.map((item) => (
                <Link
                  key={item.code}
                  href={item.href}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 hover:bg-avenida-violet-light/10"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-avenida-black">{item.title}</p>
                    <p className="text-xs text-muted">
                      {item.code}
                      {item.due ? ` · vence ${item.due}` : ""}
                    </p>
                  </div>
                  <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                </Link>
              ))
            )}
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
            {misVencimientos.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted">
                No tenés nada con vencimiento cargado por ahora.
              </p>
            ) : (
              misVencimientos.map((item) => (
                <Link
                  key={item.code}
                  href={item.href}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 hover:bg-avenida-violet-light/10"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-avenida-black">{item.label}</p>
                    <p className="text-xs text-muted">{item.code}</p>
                  </div>
                  <Badge tone={item.overdue ? "red" : "gray"}>{item.overdue ? "Vencido" : item.due}</Badge>
                </Link>
              ))
            )}
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
            {misMovimientos.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted">
                Todavía no hay movimientos para mostrar acá.
              </p>
            ) : (
              misMovimientos.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="block rounded-xl border border-border p-3 hover:bg-avenida-violet-light/10"
                >
                  <p className="text-sm text-avenida-black">{item.text}</p>
                  <p className="mt-1 text-xs text-muted">{item.time}</p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
