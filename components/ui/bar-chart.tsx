"use client";

/**
 * Barras horizontales para comparar magnitudes por categoría (Fase 14:
 * "por tipo", "por área"). Un solo hue (la categoría ya está en la
 * etiqueta/eje, no hace falta una paleta categórica nueva — mismo criterio
 * que `TrendChart`), etiqueta directa del valor, orden descendente.
 */
export type BarDatum = { label: string; value: number };

export function BarChart({ data }: { data: BarDatum[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[160px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted">
        Todavía no hay datos para mostrar.
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex flex-col gap-3">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate text-xs font-medium text-avenida-black" title={d.label}>
            {d.label}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-avenida-violet-light/40">
            <div
              className="h-full rounded-full bg-avenida-violet"
              style={{ width: `${Math.max((d.value / max) * 100, 4)}%` }}
            />
          </div>
          <span className="w-6 shrink-0 text-right text-xs font-semibold text-avenida-black">{d.value}</span>
        </div>
      ))}
    </div>
  );
}
