"use client";

import { useMemo, useState } from "react";

/**
 * Gráfico "Meta vs Real" compartido entre Objetivos de Calidad e Indicadores
 * (Fase 11). Diseñado siguiendo la skill de dataviz cargada en esta sesión:
 * un solo eje (nunca dual-axis), una línea sólida para "Real" (un solo hue,
 * `--color-avenida-violet`, ya en uso en todo el portal — no hace falta
 * correr el validador de paleta porque no se introduce una paleta
 * categórica nueva), una línea de referencia punteada en gris para "Meta",
 * leyenda siempre presente (2 series), y hover con crosshair + tooltip.
 */
export type TrendPoint = { period: string; actual: number | null; target: number | null };

const WIDTH = 640;
const HEIGHT = 240;
const PADDING = { top: 16, right: 16, bottom: 28, left: 44 };
const INNER_WIDTH = WIDTH - PADDING.left - PADDING.right;
const INNER_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;

function buildSegments(points: { x: number; y: number | null }[]): string[] {
  const segments: string[] = [];
  let current: string[] = [];
  for (const point of points) {
    if (point.y === null) {
      if (current.length > 1) segments.push(current.join(" "));
      current = [];
      continue;
    }
    current.push(`${current.length === 0 ? "M" : "L"}${point.x},${point.y}`);
  }
  if (current.length > 1) segments.push(current.join(" "));
  return segments;
}

export function TrendChart({
  points,
  unit,
  actualLabel = "Real",
  targetLabel = "Meta",
}: {
  points: TrendPoint[];
  unit?: string;
  /** Etiqueta de la línea sólida — default "Real" (Objetivos/Indicadores). */
  actualLabel?: string;
  /** Etiqueta de la línea de referencia punteada — default "Meta". */
  targetLabel?: string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { xScale, yScale, min, max, hasData } = useMemo(() => {
    const values = points.flatMap((p) => [p.actual, p.target]).filter((v): v is number => v !== null);
    const dataMin = values.length ? Math.min(0, ...values) : 0;
    const dataMax = values.length ? Math.max(...values, dataMin + 1) : 1;
    const range = dataMax - dataMin || 1;
    const xScale = (i: number) =>
      PADDING.left + (points.length <= 1 ? INNER_WIDTH / 2 : (i / (points.length - 1)) * INNER_WIDTH);
    const yScale = (v: number) => PADDING.top + INNER_HEIGHT - ((v - dataMin) / range) * INNER_HEIGHT;
    return { xScale, yScale, min: dataMin, max: dataMax, hasData: values.length > 0 };
  }, [points]);

  if (!hasData) {
    return (
      <div className="flex h-[240px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted">
        Todavía no hay resultados cargados.
      </div>
    );
  }

  const actualPoints = points.map((p, i) => ({ x: xScale(i), y: p.actual === null ? null : yScale(p.actual) }));
  const targetPoints = points.map((p, i) => ({ x: xScale(i), y: p.target === null ? null : yScale(p.target) }));
  const actualSegments = buildSegments(actualPoints);
  const targetSegments = buildSegments(targetPoints);

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;
  const hoverX = hoverIndex !== null ? xScale(hoverIndex) : null;

  function handleMove(event: React.MouseEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = ((event.clientX - rect.left) / rect.width) * WIDTH;
    let closest = 0;
    let closestDistance = Infinity;
    points.forEach((_, i) => {
      const distance = Math.abs(xScale(i) - relativeX);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = i;
      }
    });
    setHoverIndex(closest);
  }

  const midValue = (min + max) / 2;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded-full bg-avenida-violet" />
          {actualLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-0 w-4 border-t-2 border-dashed"
            style={{ borderColor: "var(--color-border)" }}
          />
          {targetLabel}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {[min, midValue, max].map((value, i) => (
          <g key={i}>
            <line
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={yScale(value)}
              y2={yScale(value)}
              stroke="var(--color-border)"
              strokeWidth={1}
              opacity={0.5}
            />
            <text x={4} y={yScale(value) + 3} className="fill-muted text-[10px]">
              {Math.round(value * 100) / 100}
              {unit ? ` ${unit}` : ""}
            </text>
          </g>
        ))}

        {targetSegments.map((d, i) => (
          <path key={`target-${i}`} d={d} fill="none" stroke="var(--color-border)" strokeWidth={2} strokeDasharray="4 4" />
        ))}
        {actualSegments.map((d, i) => (
          <path key={`actual-${i}`} d={d} fill="none" stroke="var(--color-avenida-violet)" strokeWidth={2} strokeLinecap="round" />
        ))}
        {actualPoints.map(
          (p, i) =>
            p.y !== null && (
              <circle key={i} cx={p.x} cy={p.y} r={4} fill="var(--color-avenida-violet)" stroke="white" strokeWidth={1.5} />
            ),
        )}

        {points.map((p, i) => (
          <text
            key={p.period}
            x={xScale(i)}
            y={HEIGHT - 8}
            textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}
            className="fill-muted text-[10px]"
          >
            {p.period}
          </text>
        ))}

        {hoverX !== null && (
          <line x1={hoverX} x2={hoverX} y1={PADDING.top} y2={HEIGHT - PADDING.bottom} stroke="var(--color-avenida-violet)" strokeWidth={1} opacity={0.4} />
        )}
      </svg>
      {hovered && (
        <div className="flex w-fit flex-col gap-0.5 rounded-lg border border-border bg-white px-3 py-2 text-xs shadow-sm">
          <span className="font-semibold text-avenida-black">{hovered.period}</span>
          <span className="text-avenida-violet">
            {actualLabel}: {hovered.actual === null ? "sin dato" : `${hovered.actual}${unit ? ` ${unit}` : ""}`}
          </span>
          <span className="text-muted">
            {targetLabel}: {hovered.target === null ? "sin dato" : `${hovered.target}${unit ? ` ${unit}` : ""}`}
          </span>
        </div>
      )}
    </div>
  );
}
