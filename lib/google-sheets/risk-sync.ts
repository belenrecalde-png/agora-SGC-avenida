import "server-only";
import { addActivityLog, createRisk, listRisks, setRiskSheetRow, updateRiskResidual, type SgcRisk } from "@/lib/db/queries";
import type { RiskKind } from "@/lib/risk-scoring";
import { appendSheetRow, getRisksSheetsConfig, isRisksSheetsConfigured, readSheetRows, updateSheetRow } from "@/lib/google-sheets/client";
import { FIRST_DATA_ROW, LAST_COLUMN, parseRiskRow, riskToSheetRow } from "@/lib/google-sheets/risk-mapping";

export type RiskImportSummary = {
  imported: number;
  skippedExisting: number;
};

/**
 * Importación desde las 2 pestañas ("Riesgos" y "Oportunidades", mismo
 * archivo) — idempotente por diseño, igual que `importObjectivesFromSheet`:
 * una fila ya importada tiene un riesgo/oportunidad con `sheet_row`
 * apuntándole. Los números de fila de las 2 pestañas son independientes
 * entre sí (cada una arranca en la fila 6), así que el chequeo de "ya
 * importado" se hace por separado para cada `kind`.
 */
export async function importRisksFromSheet(): Promise<RiskImportSummary> {
  const summary: RiskImportSummary = { imported: 0, skippedExisting: 0 };

  for (const kind of ["riesgo", "oportunidad"] as RiskKind[]) {
    const config = getRisksSheetsConfig(kind);
    const rows = await readSheetRows(config, FIRST_DATA_ROW, LAST_COLUMN);
    const alreadyImported = new Set(
      listRisks({ kind })
        .map((r) => r.sheet_row)
        .filter((row): row is number => row !== null),
    );

    rows.forEach((row, i) => {
      const rowNumber = FIRST_DATA_ROW + i;
      if (alreadyImported.has(rowNumber)) {
        summary.skippedExisting++;
        return;
      }

      const parsed = parseRiskRow(row);
      if (!parsed) return; // fila sin "Tipo de riesgo" — vacía, se saltea.

      const risk = createRisk(parsed.input);
      setRiskSheetRow(risk.id, rowNumber, parsed.sheetNo);
      if (parsed.probabilityResidual !== null || parsed.impactResidual !== null || parsed.verification !== null) {
        updateRiskResidual(risk.id, {
          probabilityResidual: parsed.probabilityResidual,
          impactResidual: parsed.impactResidual,
          verification: parsed.verification,
        });
      }
      summary.imported++;
    });
  }

  return summary;
}

/**
 * Empuja un riesgo/oportunidad del portal hacia su pestaña — agrega una fila
 * nueva si todavía no tiene `sheet_row`, o sobrescribe la que ya tenía.
 * Nunca lanza (atrapa el error y lo deja en el historial) para que un
 * problema de Sheets no bloquee el guardado real en el portal.
 */
export async function pushRiskToSheetSafe(risk: SgcRisk): Promise<void> {
  if (!isRisksSheetsConfigured()) return;
  try {
    const config = getRisksSheetsConfig(risk.kind);
    const values = riskToSheetRow(risk);

    if (risk.sheet_row) {
      await updateSheetRow(config, risk.sheet_row, LAST_COLUMN, values);
      return;
    }

    const actualRow = await appendSheetRow(config, LAST_COLUMN, values);
    setRiskSheetRow(risk.id, actualRow, risk.sheet_no);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    addActivityLog(risk.id, "No se pudo sincronizar con Sheets", message);
  }
}
