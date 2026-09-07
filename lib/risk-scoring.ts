/**
 * Lógica pura de valoración de riesgos/oportunidades (probabilidad × impacto,
 * bandas de la matriz — Fase 8). Vive separada de `lib/db/queries.ts` a
 * propósito: ese archivo importa `./client` (que abre `node:sqlite`), así que
 * cualquier componente "use client" que importara una función desde ahí
 * arrastraría `node:sqlite` al bundle del navegador y rompía el build de
 * Turbopack ("the chunking context ... does not support external modules
 * (request: node:sqlite)" — pasó exactamente eso con
 * `components/riesgos/riesgos-explorer.tsx`). Este módulo no depende de la
 * base de datos, así que un componente cliente lo puede importar sin
 * arrastrar nada del servidor. `lib/db/queries.ts` reexporta todo esto para
 * que el resto del código (Server Components) lo siga importando desde ahí
 * sin cambios.
 */

export type RiskKind = "riesgo" | "oportunidad";

export type RiskBand = { label: string; tone: "violet" | "blue" | "gray" | "green" | "amber" | "red" };

/** probabilidad (1-3) × impacto (1-5) = score 1-15. `null` si falta alguno de los dos. */
export function getRiskScore(probability: number | null, impact: number | null): number | null {
  if (probability === null || impact === null) return null;
  return probability * impact;
}

/**
 * Bandas de la matriz sobre el score 1-15. Para "riesgo" es el semáforo
 * habitual (más score = peor = más rojo). Para "oportunidad" la escala está
 * invertida a propósito ("escala positiva diferenciada" de la spec): más
 * score = mejor = más verde, no más rojo.
 */
export function getRiskBand(kind: RiskKind, score: number | null): RiskBand {
  if (score === null) return { label: "Sin valorar", tone: "gray" };
  if (kind === "oportunidad") {
    if (score <= 3) return { label: "Baja", tone: "gray" };
    if (score <= 7) return { label: "Moderada", tone: "blue" };
    if (score <= 11) return { label: "Buena", tone: "violet" };
    return { label: "Alta", tone: "green" };
  }
  if (score <= 3) return { label: "Bajo", tone: "green" };
  if (score <= 7) return { label: "Medio", tone: "amber" };
  if (score <= 11) return { label: "Alto", tone: "red" };
  return { label: "Crítico", tone: "red" };
}
