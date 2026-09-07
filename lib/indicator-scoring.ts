/**
 * Lógica pura de estado de tolerancia de un indicador (Fase 11). Separada de
 * `lib/db/queries.ts` por el mismo motivo que `lib/risk-scoring.ts` (Fase 8):
 * ese archivo importa `./client` (que abre `node:sqlite`), así que un
 * componente "use client" que importe una función de ahí arrastra
 * `node:sqlite` al bundle del navegador y rompe el build de Turbopack
 * ("the chunking context ... does not support external modules"). Este
 * módulo no depende de la base, así que `components/indicadores/indicadores-table.tsx`
 * (client) lo puede importar sin arrastrar nada del servidor.
 */

export type ToleranceStatus = { label: string; tone: "green" | "amber" | "red" | "gray" };

/** Estado computado (no almacenado): ¿el resultado actual está dentro de la tolerancia alrededor de la meta? */
export function getIndicatorToleranceStatus(indicator: {
  current_result: number | null;
  target_value: number | null;
  tolerance: number | null;
}): ToleranceStatus {
  if (indicator.current_result === null || indicator.target_value === null) {
    return { label: "Sin datos", tone: "gray" };
  }
  if (indicator.tolerance === null) {
    return indicator.current_result >= indicator.target_value
      ? { label: "En meta", tone: "green" }
      : { label: "Debajo de la meta", tone: "amber" };
  }
  const diff = Math.abs(indicator.current_result - indicator.target_value);
  return diff <= indicator.tolerance
    ? { label: "Dentro de tolerancia", tone: "green" }
    : { label: "Fuera de tolerancia", tone: "red" };
}
