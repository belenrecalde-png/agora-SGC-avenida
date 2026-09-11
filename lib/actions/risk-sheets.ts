"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getRisksSheetsConfig, getSpreadsheetTitle } from "@/lib/google-sheets/client";
import { importRisksFromSheet } from "@/lib/google-sheets/risk-sync";

/** Mismo patrón que `lib/actions/objective-sheets.ts` — ver la nota ahí. */

export async function probarConexionRiesgosSheetsAction(): Promise<void> {
  let redirectUrl: string;
  try {
    const title = await getSpreadsheetTitle(getRisksSheetsConfig("riesgo"));
    redirectUrl = `/configuracion/riesgos-sheets?testOk=${encodeURIComponent(title)}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido al probar la conexión.";
    redirectUrl = `/configuracion/riesgos-sheets?testError=${encodeURIComponent(message)}`;
  }
  redirect(redirectUrl);
}

export async function importarRiesgosDesdeSheetsAction(): Promise<void> {
  let redirectUrl: string;
  try {
    const summary = await importRisksFromSheet();
    const parts = [
      `${summary.imported} riesgos/oportunidades importados`,
      `${summary.skippedExisting} ya estaban importados`,
    ];
    redirectUrl = `/configuracion/riesgos-sheets?importOk=${encodeURIComponent(parts.join(" · "))}`;
    revalidatePath("/planificacion/riesgos-y-oportunidades");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido al importar desde Sheets.";
    redirectUrl = `/configuracion/riesgos-sheets?importError=${encodeURIComponent(message)}`;
  }
  redirect(redirectUrl);
}
