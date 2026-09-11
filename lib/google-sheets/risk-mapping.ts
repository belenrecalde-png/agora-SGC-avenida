import "server-only";
import type { CreateRiskInput, SgcRisk } from "@/lib/db/queries";
import type { RiskKind } from "@/lib/risk-scoring";

/**
 * Mapeo entre las 19 columnas (A:S) de la planilla real de Riesgos y
 * Oportunidades del usuario (2 pestañas, mismo layout: "Riesgos" y
 * "Oportunidades" — confirmado leyendo la planilla real, 2026-09-11) y el
 * modelo del portal.
 *
 * A diferencia de Objetivos, acá no hubo sorpresas de estructura: cada fila
 * es un riesgo/oportunidad completo (sin filas de continuación — se
 * confirmó recorriendo toda la planilla, 0 filas con "Código" vacío), y no
 * hay columna de "Estado" que reconciliar contra `RISK_STATUS_FLOW` — el
 * portal ya asigna el estado inicial ("Identificado"/"Identificada") solo,
 * en `createRisk`. Los datos arrancan en la fila 6 (fila 5 es el
 * encabezado, filas 1-4 son título/metadatos de la planilla).
 *
 *  A  Tipo de riesgo                    -> kind ("RI" -> "riesgo", "OP" -> "oportunidad")
 *  B  Código                            -> sheet_no (solo referencia; el portal genera su propio código con generateSgcCode("RISK"))
 *  C  Procedencia                       -> source
 *  D  Proceso / Actividad / Tarea       -> process_name (una sola columna combinada — `activity` queda sin fuente, igual que `unit` en Objetivos)
 *  E  Descripción del riesgo            -> description (obligatorio)
 *  F  Detalle del riesgo                -> detail
 *  G  Control existente                 -> existing_control
 *  H  Prob. (P) inicial                 -> probability_initial
 *  I  Impacto (I) inicial               -> impact_initial
 *  J  Valoración inicial                -> (no se importa — el portal la calcula solo con getRiskScore/getRiskBand)
 *  K  Control propuesto / Plan de acción y contingencia / Acciones -> treatment_plan
 *  L  Verificación de la implementación -> se concatena al final de treatment_plan (no hay campo propio en el portal para esto)
 *  M  Responsable                       -> responsible
 *  N  Fecha de verificación             -> due_date
 *  O  Prob. (P) residual                -> probability_residual
 *  P  Impacto (I) residual              -> impact_residual
 *  Q  Revaluación                       -> (no se importa — el portal la calcula sola)
 *  R  Sí / No                           -> (no se importa — sin equivalente claro en el portal, valores vistos siempre "Pendiente")
 *  S  Evidencia objetiva                -> verification
 */

export const FIRST_DATA_ROW = 6;
export const LAST_COLUMN = "S";

function cellText(row: unknown[], index: number): string | null {
  const value = row[index];
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
}

function cellNumber(row: unknown[], index: number): number | null {
  const value = row[index];
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number") return value;
  const parsed = Number.parseFloat(String(value).trim().replace(",", "."));
  return Number.isNaN(parsed) ? null : parsed;
}

/** Igual que `parseSheetDate` de `objective-mapping.ts` (número de serie de Sheets o texto ISO/DD-MM-YYYY) — duplicado a propósito, sin un módulo compartido nuevo solo para esto: son 2 líneas y cada mapeo ya vive en su propio archivo autocontenido. */
function parseDate(row: unknown[], index: number): string | null {
  const value = row[index];
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number") {
    const ms = Math.round((value - 25569) * 86400 * 1000);
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
  }
  const text = String(value).trim();
  if (!text) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const dmy = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return null;
}

export type ParsedRiskRow = {
  sheetNo: string | null;
  kind: RiskKind;
  input: CreateRiskInput;
  probabilityResidual: number | null;
  impactResidual: number | null;
  verification: string | null;
};

/** `null` si la fila no tiene "Tipo de riesgo" (columna A) — fila vacía o de otra sección, se saltea al importar. */
export function parseRiskRow(row: unknown[]): ParsedRiskRow | null {
  const tipo = cellText(row, 0);
  if (!tipo) return null;
  const kind: RiskKind = tipo.trim().toUpperCase() === "OP" ? "oportunidad" : "riesgo";

  const treatmentPlan = [cellText(row, 10), cellText(row, 11) ? `Verificación de la implementación: ${cellText(row, 11)}` : null]
    .filter((v): v is string => v !== null)
    .join("\n") || null;

  return {
    sheetNo: cellText(row, 1),
    kind,
    input: {
      kind,
      source: cellText(row, 2),
      areaId: null,
      processName: cellText(row, 3),
      activity: null,
      description: cellText(row, 4) ?? "(sin descripción en la planilla)",
      detail: cellText(row, 5),
      existingControl: cellText(row, 6),
      probabilityInitial: cellNumber(row, 7),
      impactInitial: cellNumber(row, 8),
      treatmentPlan,
      responsible: cellText(row, 12),
      dueDate: parseDate(row, 13),
    },
    probabilityResidual: cellNumber(row, 14),
    impactResidual: cellNumber(row, 15),
    verification: cellText(row, 18),
  };
}

/** Arma los 19 valores (A:S) para escribir una fila completa en la planilla a partir de un riesgo/oportunidad del portal. */
export function riskToSheetRow(risk: SgcRisk): (string | number | null)[] {
  return [
    risk.kind === "oportunidad" ? "OP" : "RI",
    risk.sheet_no,
    risk.source,
    risk.process_name,
    risk.description,
    risk.detail,
    risk.existing_control,
    risk.probability_initial,
    risk.impact_initial,
    null, // Valoración inicial — se deja que la fórmula/formato propio de la planilla la calcule, si la tiene.
    risk.treatment_plan,
    null, // Verificación de la implementación — ya va concatenada dentro de treatment_plan al importar, no hay vuelta 1 a 1 limpia al escribir.
    risk.responsible,
    risk.due_date,
    risk.probability_residual,
    risk.impact_residual,
    null, // Revaluación — ídem Valoración inicial.
    null, // Sí / No — sin equivalente en el portal.
    risk.verification,
  ];
}
