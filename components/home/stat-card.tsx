import { ArrowDown, ArrowUp } from "lucide-react";
import type { ComponentType } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatCardData = {
  label: string;
  value: string;
  /** % vs. mes anterior. Omitir cuando no hay una comparación honesta que mostrar (Fase 14: no todas las métricas la tienen). */
  trend?: number;
  /** true = que el número baje es la buena noticia (ej. "NC abiertas"). Requerido solo si `trend` viene definido. */
  lowerIsBetter?: boolean;
  icon: ComponentType<{ className?: string }>;
  tone: "violet" | "blue" | "amber" | "green";
};

const TONE_CLASSES: Record<StatCardData["tone"], string> = {
  violet: "bg-avenida-violet-light text-avenida-violet",
  blue: "bg-avenida-blue-light text-avenida-blue",
  amber: "bg-amber-50 text-amber-600",
  green: "bg-emerald-50 text-emerald-600",
};

export function StatCard({ data }: { data: StatCardData }) {
  const Icon = data.icon;
  const hasTrend = data.trend !== undefined;
  const isPositiveTrend = hasTrend && data.trend! > 0;
  const isGoodNews = hasTrend && (data.trend === 0 || (data.trend! > 0) !== data.lowerIsBetter);

  return (
    <Card className="flex flex-col gap-3 p-4">
      <span
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-lg",
          TONE_CLASSES[data.tone],
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-2xl font-semibold text-avenida-black">{data.value}</p>
        <p className="text-xs text-muted">{data.label}</p>
      </div>
      {hasTrend && (
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            isGoodNews ? "text-emerald-600" : "text-red-500",
          )}
        >
          {isPositiveTrend ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          <span>{Math.abs(data.trend!)}%</span>
          <span className="font-normal text-muted">vs. mes anterior</span>
        </div>
      )}
    </Card>
  );
}
