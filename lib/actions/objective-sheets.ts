"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSheetsConfig, getSpreadsheetTitle } from "@/lib/google-sheets/client";
import { importObjectivesFromSheet } from "@/lib/google-sheets/sync";

/**
 * Acciones de Configuración → Objetivos en Sheets. Sin JS en el cliente
 * (formularios comunes), así que el resultado de cada acción viaja por query
 * param en el redirect — mismo patrón que `estadoError` en
 * `lib/actions/gestion.ts` — en vez de una tabla de logs aparte (acá alcanza,
 * es una sola planilla, no un mapeo por área como Plane).
 */

export async function probarConexionSheetsAction(): Promise<void> {
  let redirectUrl: string;
  try {
    const title = await getSpreadsheetTitle(getSheetsConfig());
    redirectUrl = `/configuracion/objetivos-sheets?testOk=${encodeURIComponent(title)}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido al probar la conexión.";
    redirectUrl = `/configuracion/objetivos-sheets?testError=${encodeURIComponent(message)}`;
  }
  redirect(redirectUrl);
}

export async function importarDesdeSheetsAction(): Promise<void> {
  let redirectUrl: string;
  try {
    const summary = await importObjectivesFromSheet();
    const parts = [
      `${summary.imported} objetivo${summary.imported === 1 ? "" : "s"} importado${summary.imported === 1 ? "" : "s"}`,
      `${summary.skippedExisting} ya estaba${summary.skippedExisting === 1 ? "" : "n"} importado${summary.skippedExisting === 1 ? "" : "s"}`,
    ];
    if (summary.skippedEmpty) parts.push(`${summary.skippedEmpty} fila${summary.skippedEmpty === 1 ? "" : "s"} vacía${summary.skippedEmpty === 1 ? "" : "s"} salteada${summary.skippedEmpty === 1 ? "" : "s"}`);
    if (summary.warnings.length) parts.push(`${summary.warnings.length} con avisos (ver Historial de cada objetivo)`);
    redirectUrl = `/configuracion/objetivos-sheets?importOk=${encodeURIComponent(parts.join(" · "))}`;
    revalidatePath("/planificacion/objetivos-de-calidad");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido al importar desde Sheets.";
    redirectUrl = `/configuracion/objetivos-sheets?importError=${encodeURIComponent(message)}`;
  }
  redirect(redirectUrl);
}
