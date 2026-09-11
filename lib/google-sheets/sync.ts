import "server-only";
import {
  addActivityLog,
  addObjectiveResult,
  appendObjectiveObservation,
  createObjective,
  listObjectiveResults,
  listObjectives,
  setObjectiveSheetRow,
  updateObjectiveStatus,
  type SgcObjective,
} from "@/lib/db/queries";
import {
  appendSheetRow,
  getSheetsConfig,
  isSheetsConfigured,
  readSheetRows,
  updateSheetCell,
  updateSheetRow,
} from "@/lib/google-sheets/client";
import { FIRST_DATA_ROW, groupSheetRows, monthColumnLetter, objectiveToSheetRow, resolveYear } from "@/lib/google-sheets/objective-mapping";

const LAST_COLUMN = "X";

export type ImportSummary = {
  imported: number;
  skippedExisting: number;
  skippedEmpty: number;
  warnings: string[];
};

/**
 * Importación (una vez, repetible): trae los objetivos que ya estaban
 * cargados en la planilla del usuario y todavía no tienen equivalente en el
 * portal. Idempotente por diseño — una fila ya importada tiene un objetivo
 * con `sheet_row` apuntándole, así que correrla de nuevo solo trae las filas
 * nuevas que se hayan agregado directo en la planilla desde la corrida
 * anterior.
 */
export async function importObjectivesFromSheet(): Promise<ImportSummary> {
  const config = getSheetsConfig();
  const rows = await readSheetRows(config, FIRST_DATA_ROW, LAST_COLUMN);
  const groups = groupSheetRows(rows, FIRST_DATA_ROW);
  const alreadyImported = new Set(
    listObjectives()
      .map((o) => o.sheet_row)
      .filter((row): row is number => row !== null),
  );

  const summary: ImportSummary = { imported: 0, skippedExisting: 0, skippedEmpty: 0, warnings: [] };

  for (const group of groups) {
    if (alreadyImported.has(group.primaryRow)) {
      summary.skippedExisting++;
      continue;
    }

    const objective = createObjective(group.input);
    setObjectiveSheetRow(objective.id, group.primaryRow, group.sheetNo);
    if (group.status !== "En curso") updateObjectiveStatus(objective.id, group.status);
    if (group.statusNote) {
      appendObjectiveObservation(objective.id, group.statusNote);
      summary.warnings.push(`Fila ${group.primaryRow} (${objective.code}): ${group.statusNote}`);
    }
    for (const monthly of group.monthlyValues.filter((m) => m.value !== null)) {
      addObjectiveResult(objective.id, { period: monthly.period, actualValue: monthly.value, targetValue: null, notes: null });
    }
    summary.imported++;
  }

  return summary;
}

/**
 * Empuja un objetivo del portal hacia la planilla — agrega una fila nueva si
 * todavía no tiene `sheet_row`, o sobrescribe la que ya tenía asignada.
 * Pensada para llamarse después de crear/editar un objetivo; nunca lanza
 * (ver `pushObjectiveToSheetSafe`) para que un problema de Sheets no bloquee
 * el guardado real en el portal.
 */
export async function pushObjectiveToSheet(objective: SgcObjective): Promise<void> {
  if (!isSheetsConfigured()) return;
  const config = getSheetsConfig();

  const year = resolveYear(objective.start_date);
  const results = listObjectiveResults(objective.id);
  const monthlyByMonth = new Map<number, number | null>();
  for (const result of results) {
    if (!result.period.startsWith(`${year}-`)) continue;
    const month = Number.parseInt(result.period.slice(5, 7), 10);
    if (month >= 1 && month <= 12) monthlyByMonth.set(month, result.actual_value);
  }

  const values = objectiveToSheetRow(objective, monthlyByMonth);

  if (objective.sheet_row) {
    await updateSheetRow(config, objective.sheet_row, LAST_COLUMN, values);
    return;
  }

  const actualRow = await appendSheetRow(config, LAST_COLUMN, values);
  setObjectiveSheetRow(objective.id, actualRow, objective.sheet_no);
}

/** Versión "silenciosa" de `pushObjectiveToSheet` — atrapa cualquier error y lo deja en el historial del objetivo en vez de tirar la acción entera. */
export async function pushObjectiveToSheetSafe(objective: SgcObjective): Promise<void> {
  if (!isSheetsConfigured()) return;
  try {
    await pushObjectiveToSheet(objective);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    addActivityLog(objective.id, "No se pudo sincronizar con Sheets", message);
  }
}

/** Escribe un único resultado mensual en su celda, sin reescribir toda la fila — usado al agregar un resultado de período. */
export async function pushMonthlyResultToSheetSafe(
  objective: SgcObjective,
  period: string,
  value: number | null,
): Promise<void> {
  if (!isSheetsConfigured() || !objective.sheet_row) return;
  const year = resolveYear(objective.start_date);
  if (!period.startsWith(`${year}-`)) return; // resultado de otro año — no tiene columna en esta fila.
  const month = Number.parseInt(period.slice(5, 7), 10);
  if (month < 1 || month > 12) return;

  try {
    await updateSheetCell(getSheetsConfig(), objective.sheet_row, monthColumnLetter(month), value === null ? null : value >= 50);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    addActivityLog(objective.id, "No se pudo sincronizar con Sheets", message);
  }
}
