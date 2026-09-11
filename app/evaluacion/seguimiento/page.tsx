import Link from "next/link";
import { TrendingUp, AlertTriangle, Repeat, PieChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart } from "@/components/ui/bar-chart";
import { SeguimientoTable } from "@/components/evaluacion/seguimiento-table";
import { listAreas } from "@/lib/db/queries";
import { requireGestionAccess } from "@/lib/auth/access";
import { getCumplimientoPorArea, getReincidencias, getSeguimientoItems } from "@/lib/seguimiento-data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Seguimiento | Ágora`,
};

export default async function SeguimientoPage() {
  const user = await requireGestionAccess();
  const areas = listAreas();
  const items = getSeguimientoItems(user);
  const reincidencias = getReincidencias(user);
  const cumplimiento = getCumplimientoPorArea(user);

  const vencidos = items.filter((i) => i.overdue).length;
  const proximos = items.filter((i) => !i.overdue && i.daysOverdue >= -7).length;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-12">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
          <TrendingUp className="h-6 w-6" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Evaluación</p>
          <h1 className="text-2xl font-semibold text-avenida-black">Seguimiento</h1>
        </div>
      </div>

      <p className="text-sm text-avenida-black">
        Vista detallada y filtrable de vencimientos, reincidencias y cumplimiento por área — el Home ya
        muestra un resumen de esto mismo; acá está todo, sin recortar, con filtros.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Card className="flex flex-1 flex-col gap-3 p-4">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div>
            <p className="text-2xl font-semibold text-avenida-black">{vencidos}</p>
            <p className="text-xs text-muted">Vencidos</p>
          </div>
        </Card>
        <Card className="flex flex-1 flex-col gap-3 p-4">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <TrendingUp className="h-4 w-4" />
          </span>
          <div>
            <p className="text-2xl font-semibold text-avenida-black">{proximos}</p>
            <p className="text-xs text-muted">Vencen en 7 días</p>
          </div>
        </Card>
        <Card className="flex flex-1 flex-col gap-3 p-4">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-avenida-violet-light text-avenida-violet">
            <Repeat className="h-4 w-4" />
          </span>
          <div>
            <p className="text-2xl font-semibold text-avenida-black">{reincidencias.length}</p>
            <p className="text-xs text-muted">Procesos con NC reincidentes</p>
          </div>
        </Card>
      </div>

      <SeguimientoTable items={items} areas={areas} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-2">
            <Repeat className="h-4 w-4 text-avenida-violet" />
            <h2 className="text-sm font-semibold text-avenida-black">Reincidencias</h2>
          </div>
          <p className="text-xs text-muted">
            Procesos con más de una No Conformidad registrada — señal de que la causa raíz todavía no se
            resolvió del todo.
          </p>
          {reincidencias.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted">
              Ningún proceso con NC repetidas por ahora.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {reincidencias.map((item) => (
                <div key={item.processName} className="flex flex-col gap-1.5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-avenida-black">{item.processName}</p>
                    <Badge tone="red">{item.count} NC</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.codes.map((c) => (
                      <Link key={c.code} href={c.href} className="text-xs font-medium text-avenida-violet hover:underline">
                        {c.code}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-2">
            <PieChart className="h-4 w-4 text-avenida-violet" />
            <h2 className="text-sm font-semibold text-avenida-black">Cumplimiento por área</h2>
          </div>
          <p className="text-xs text-muted">% de registros cerrados sobre el total, por área.</p>
          <BarChart data={cumplimiento.map((c) => ({ label: c.areaName, value: c.pctCerrado }))} />
          {cumplimiento.length > 0 && (
            <div className="flex flex-col gap-1 text-xs text-muted">
              {cumplimiento.map((c) => (
                <p key={c.areaName}>
                  {c.areaName}: {c.cerrados}/{c.total} cerrados
                  {c.vencidos > 0 ? ` · ${c.vencidos} vencido${c.vencidos === 1 ? "" : "s"}` : ""}
                </p>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
