import "server-only";
import type { CreateObjectiveInput, SgcObjective } from "@/lib/db/queries";
import { OBJECTIVE_STATUS_FLOW } from "@/lib/db/queries";

/**
 * Mapeo entre las 24 columnas (A:X) de la planilla real de Objetivos de
 * Calidad del usuario y el modelo del portal. Confirmado leyendo la
 * planilla real (2026-09-11, después de que el primer intento de import
 * salió mal por asumir la estructura solo a partir de los nombres de
 * columna que había pasado el usuario en el chat, sin ver los datos):
 *
 *  - La fila 3 es el encabezado, no datos — los objetivos arrancan en la
 *    fila 4 (`FIRST_DATA_ROW`).
 *  - "Unidad Responsable de medición" es UNA sola columna (no dos como se
 *    asumió al principio) — en la práctica solo tiene el responsable, así
 *    que se mapea entera a `responsible`; `unit` queda sin fuente en el
 *    import (el usuario lo puede completar a mano en el portal).
 *  - Un objetivo puede ocupar más de una fila: una fila con N° vacío es
 *    continuación del objetivo de la fila anterior (otra "Meta" del mismo
 *    N°) — ver `groupSheetRows`, confirmado con el usuario que se junta
 *    todo en un solo objetivo del portal.
 *  - Ene..Dic son casillas VERDADERO/FALSO (no números) — seguimiento
 *    mensual tipo Gantt, confirmado con el usuario. Se guardan como 100
 *    (cumplido) / 0 (no cumplido) en `sgc_objective_results`, y se
 *    reconvierten a booleano al escribir de vuelta a la planilla.
 *
 *  A  N°                              -> sheet_no (arranca un objetivo nuevo)
 *  B  Objetivo de la Calidad          -> title
 *  C  Meta                            -> goal (se concatena si hay más de una fila)
 *  D  Indicador                       -> indicator_text (texto libre, no es
 *                                        el `indicator_id` del portal)
 *  E  Recursos                        -> resources
 *  F  Fecha de inicio                 -> start_date
 *  G  Fecha de cumplimiento           -> end_date
 *  H..S  Ene..Dic                     -> resultado mensual (100/0/sin dato)
 *  T  Frecuencia de medición          -> frequency
 *  U  Método de cálculo               -> method (se concatena si hay más de una fila)
 *  V  Unidad Responsable de medición  -> responsible
 *  W  Principio de la Política de Calidad -> policy_principle
 *  X  Estado                          -> status (mapeado contra
 *                                        OBJECTIVE_STATUS_FLOW, ver
 *                                        `mapSheetStatus`)
 */

export const FIRST_DATA_ROW = 4;

const MONTH_COLUMN_LETTERS = ["H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S"] as const;

export function monthColumnLetter(monthIndex1to12: number): string {
  return MONTH_COLUMN_LETTERS[monthIndex1to12 - 1];
}

function cellText(row: unknown[], index: number): string | null {
  const value = row[index];
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
}

function joinText(existing: string | null, extra: string | null): string | null {
  if (!extra) return existing;
  return existing ? `${existing}\n${extra}` : extra;
}

/**
 * Con `valueRenderOption=UNFORMATTED_VALUE`, una celda de fecha llega como
 * número de serie de Sheets (días desde 1899-12-30) — independiente del
 * locale, a diferencia de parsear un string formateado. Si en cambio llega
 * como texto (alguien la cargó como texto plano), se intenta ISO y
 * DD/MM/YYYY antes de rendirse.
 */
export function parseSheetDate(row: unknown[], index: number): string | null {
  const value = row[index];
  if (value === undefined || value === null || value === "") return null;

  if (typeof value === "number") {
    const ms = Math.round((value - 25569) * 86400 * 1000); // 25569 = días entre 1899-12-30 y 1970-01-01
    const date = new Date(ms);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 10);
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

/** Casilla VERDADERO/FALSO (booleano nativo de Sheets, o texto "TRUE"/"FALSE"/"VERDADERO"/"FALSO") -> booleano. `null` si está vacía o no se pudo interpretar. */
export function parseSheetBoolean(row: unknown[], index: number): boolean | null {
  const value = row[index];
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "boolean") return value;
  const text = String(value).trim().toUpperCase();
  if (text === "TRUE" || text === "VERDADERO") return true;
  if (text === "FALSE" || text === "FALSO") return false;
  return null;
}

export function mapSheetStatus(row: unknown[], index: number): { status: string; note: string | null } {
  const text = cellText(row, index);
  if (!text) return { status: "En curso", note: null };
  const match = OBJECTIVE_STATUS_FLOW.find((s) => s.toLowerCase() === text.toLowerCase());
  if (match) return { status: match, note: null };
  return { status: "En curso", note: `Estado original en la planilla: "${text}" (no coincide con ningún estado del portal).` };
}

/** Año a usar para los períodos "YYYY-MM" de los resultados mensuales de este objetivo — el de `start_date` si se pudo leer, si no el año actual. */
export function resolveYear(startDate: string | null): number {
  if (startDate) {
    const year = Number.parseInt(startDate.slice(0, 4), 10);
    if (!Number.isNaN(year)) return year;
  }
  return new Date().getFullYear();
}

type MonthlyValue = { month: number; period: string; value: number | null };

function buildMonthly(row: unknown[], year: number): MonthlyValue[] {
  return MONTH_COLUMN_LETTERS.map((_, i) => {
    const bool = parseSheetBoolean(row, 7 + i);
    const month = i + 1;
    return { month, period: `${year}-${String(month).padStart(2, "0")}`, value: bool === null ? null : bool ? 100 : 0 };
  });
}

/** OR lógico entre 2 resultados del mismo mes (2 "Meta" del mismo objetivo): cumplido le gana a no-cumplido/sin dato. */
function mergeMonthly(a: MonthlyValue[], b: MonthlyValue[]): MonthlyValue[] {
  return a.map((entry, i) => {
    const other = b[i];
    if (other.value === null) return entry;
    if (entry.value === null || other.value > entry.value) return other;
    return entry;
  });
}

export type ParsedObjectiveGroup = {
  primaryRow: number;
  rowSpan: number[];
  sheetNo: string | null;
  input: CreateObjectiveInput;
  status: string;
  statusNote: string | null;
  monthlyValues: MonthlyValue[];
};

/**
 * Agrupa las filas crudas de la planilla por objetivo — una fila con N°
 * (columna A) no vacío arranca un objetivo nuevo; una fila con N° vacío
 * pero con algún otro dato es una "Meta" adicional del objetivo anterior
 * (se suma a `goal`/`method`/`indicatorText`, y se combina el seguimiento
 * mensual con OR lógico). `rows[0]` corresponde a la fila `firstRowNumber`.
 */
export function groupSheetRows(rows: unknown[][], firstRowNumber: number): ParsedObjectiveGroup[] {
  const groups: ParsedObjectiveGroup[] = [];
  let current: ParsedObjectiveGroup | null = null;

  rows.forEach((row, i) => {
    const rowNumber = firstRowNumber + i;
    const no = cellText(row, 0);
    const hasAnyValue = row.some((cell) => cell !== undefined && cell !== null && String(cell).trim() !== "");

    if (no) {
      if (current) groups.push(current);
      const startDate = parseSheetDate(row, 5);
      const year = resolveYear(startDate);
      const { status, note } = mapSheetStatus(row, 23);
      current = {
        primaryRow: rowNumber,
        rowSpan: [rowNumber],
        sheetNo: no,
        input: {
          title: cellText(row, 1) ?? "(sin título en la planilla)",
          goal: cellText(row, 2),
          targetValue: null,
          indicatorId: null,
          indicatorText: cellText(row, 3),
          unit: null,
          resources: cellText(row, 4),
          responsible: cellText(row, 21),
          areaId: null,
          processName: null,
          startDate,
          endDate: parseSheetDate(row, 6),
          frequency: cellText(row, 19),
          method: cellText(row, 20),
          policyPrinciple: cellText(row, 22),
        },
        status,
        statusNote: note,
        monthlyValues: buildMonthly(row, year),
      };
      return;
    }

    if (current && hasAnyValue) {
      current.rowSpan.push(rowNumber);
      current.input.goal = joinText(current.input.goal, cellText(row, 2));
      current.input.indicatorText = joinText(current.input.indicatorText, cellText(row, 3));
      current.input.method = joinText(current.input.method, cellText(row, 20));
      const year = resolveYear(current.input.startDate);
      current.monthlyValues = mergeMonthly(current.monthlyValues, buildMonthly(row, year));
    }
    // fila totalmente vacía sin N°: se ignora, no abre ni continúa nada.
  });

  if (current) groups.push(current);
  return groups;
}

/**
 * Arma los 24 valores (A:X) para escribir una fila completa en la planilla a
 * partir de un objetivo del portal — usado al crear/editar un objetivo con
 * la sincronización activa. `monthlyByMonth` son los resultados mensuales ya
 * cargados para el año de `start_date` (ver `resolveYear`), indexados 1-12,
 * reconvertidos de 100/0/null a VERDADERO/FALSO/vacío para no romper el
 * formato de casilla que ya tienen esas columnas en la planilla.
 *
 * Nota: si el objetivo ocupa más de una fila en la planilla original (varias
 * "Meta"), esto solo escribe/actualiza la fila principal — las filas de
 * continuación no se tocan. Un objetivo creado nuevo desde el portal siempre
 * ocupa una sola fila.
 */
export function objectiveToSheetRow(
  objective: SgcObjective,
  monthlyByMonth: Map<number, number | null>,
): (string | number | boolean | null)[] {
  const months = MONTH_COLUMN_LETTERS.map((_, i) => {
    const value = monthlyByMonth.get(i + 1) ?? null;
    if (value === null) return null;
    return value >= 50;
  });
  return [
    objective.sheet_no,
    objective.title,
    objective.goal,
    objective.indicator_text,
    objective.resources,
    objective.start_date,
    objective.end_date,
    ...months,
    objective.frequency,
    objective.method,
    objective.responsible,
    objective.policy_principle,
    objective.status,
  ];
}
