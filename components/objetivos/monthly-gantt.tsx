import { Check, X, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ObjectiveResult } from "@/lib/db/queries";

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

type MonthStatus = "cumplido" | "no-cumplido" | "sin-dato";

function statusFor(value: number | null): MonthStatus {
  if (value === null) return "sin-dato";
  return value >= 50 ? "cumplido" : "no-cumplido";
}

const STATUS_STYLES: Record<MonthStatus, { bg: string; icon: typeof Check; iconColor: string }> = {
  cumplido: { bg: "bg-emerald-50 border-emerald-200", icon: Check, iconColor: "text-emerald-600" },
  "no-cumplido": { bg: "bg-red-50 border-red-200", icon: X, iconColor: "text-red-600" },
  "sin-dato": { bg: "bg-avenida-gray/20 border-border", icon: Minus, iconColor: "text-muted" },
};

/**
 * Seguimiento mensual tipo Gantt — a pedido del usuario, para los objetivos
 * que vienen de la planilla de Sheets (Ene..Dic son casillas cumplido/no
 * cumplido, no un valor numérico continuo). Convive con `TrendChart` en
 * `ResultadosTab`, no lo reemplaza: esta vista es para leer de un vistazo
 * qué meses están al día, la de tendencia sigue sirviendo para objetivos con
 * resultados numéricos reales.
 */
export function MonthlyGantt({ year, results }: { year: number; results: ObjectiveResult[] }) {
  const byMonth = new Map<number, number | null>();
  for (const result of results) {
    if (!result.period.startsWith(`${year}-`)) continue;
    const month = Number.parseInt(result.period.slice(5, 7), 10);
    if (month >= 1 && month <= 12) byMonth.set(month, result.actual_value);
  }

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-avenida-black">Seguimiento {year}</h3>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Check className="h-3 w-3 text-emerald-600" /> Cumplido
          </span>
          <span className="flex items-center gap-1">
            <X className="h-3 w-3 text-red-600" /> No cumplido
          </span>
          <span className="flex items-center gap-1">
            <Minus className="h-3 w-3 text-muted" /> Sin dato
          </span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
        {MONTH_LABELS.map((label, i) => {
          const month = i + 1;
          const status = statusFor(byMonth.get(month) ?? null);
          const style = STATUS_STYLES[status];
          const Icon = style.icon;
          return (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <span className="text-xs font-medium text-muted">{label}</span>
              <div
                className={cn("flex h-9 w-full items-center justify-center rounded-lg border", style.bg)}
                title={`${label} ${year}: ${status === "cumplido" ? "Cumplido" : status === "no-cumplido" ? "No cumplido" : "Sin dato"}`}
              >
                <Icon className={cn("h-4 w-4", style.iconColor)} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
