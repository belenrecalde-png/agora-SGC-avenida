import Link from "next/link";
import { ArrowRight, Circle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AttentionItem } from "@/lib/dashboard-data";

/**
 * Reemplaza "Mis pendientes" (Fase 1). Ahora sí hay autenticación real
 * (ver `lib/auth/`), pero los registros/riesgos no tienen un campo
 * "asignado a" — solo "reportado por" (texto libre) — así que todavía no
 * hay una forma honesta de filtrar por usuario. Muestra vencimientos de los
 * próximos 7 días para todo el portal en vez de inventar una asignación.
 */
function shortDue(daysOverdue: number | null): string {
  if (daysOverdue === null) return "";
  if (daysOverdue === 0) return "Vence hoy";
  const remaining = Math.abs(daysOverdue);
  return `En ${remaining} día${remaining === 1 ? "" : "s"}`;
}

export function PendingChecklist({ items }: { items: AttentionItem[] }) {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <CardHeader className="flex-row items-center justify-between p-0">
        <CardTitle className="text-base">Vencimientos próximos</CardTitle>
        <Link
          href="/gestion-calidad/registro"
          className="flex items-center gap-1 text-xs font-medium text-avenida-violet hover:underline"
        >
          Ver todos <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      {items.length === 0 ? (
        <p className="text-sm text-muted">Nada vence en los próximos 7 días.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <Link key={item.code} href={item.href} className="flex items-start gap-3">
              <Circle className="mt-1 h-3.5 w-3.5 shrink-0 text-border" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-avenida-black">{item.title}</p>
                <p className="flex flex-wrap items-center gap-x-1 text-xs text-muted">
                  <span className="truncate">
                    {item.code} · {item.type}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 font-medium",
                      item.daysOverdue === 0 ? "text-red-500" : "text-avenida-violet",
                    )}
                  >
                    · {shortDue(item.daysOverdue)}
                  </span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
