import "server-only";
import { SignJWT, importPKCS8 } from "jose";
import type { RiskKind } from "@/lib/risk-scoring";

/**
 * Cliente de Google Sheets (cuenta de servicio) — sincroniza datos reales del
 * usuario con sus planillas (Objetivos de Calidad, Riesgos y Oportunidades).
 * Mismo criterio que `lib/plane/client.ts`: sin SDK de terceros (nada de
 * `googleapis`), autenticación hecha a mano con `jose` (ya es dependencia del
 * proyecto, usada para verificar el login de Google en `lib/auth/google.ts`
 * — acá se usa para firmar en vez de verificar) contra el endpoint estándar
 * OAuth2 de cuentas de servicio (RFC 7523, "JWT Bearer Token").
 *
 * El núcleo (auth + fetch) es genérico sobre `SheetsConfig` (una credencial,
 * pero cualquier planilla/pestaña) — cada integración (Objetivos, Riesgos)
 * lee su propia config desde sus propias variables de entorno y llama a las
 * mismas funciones de bajo nivel. Nunca contiene credenciales reales — todo
 * sale de variables de entorno. Si falta alguna, la función `get*Config()`
 * correspondiente devuelve `null` y esa integración sigue "apagada, no
 * rota" — mismo criterio que Plane.
 */

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

export type SheetsConfig = {
  clientEmail: string;
  privateKey: string;
  spreadsheetId: string;
  sheetName: string;
};

export class SheetsApiError extends Error {
  status: number | null;
  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "SheetsApiError";
    this.status = status;
  }
}

export class SheetsNotConfiguredError extends Error {
  constructor(detail: string) {
    super(detail);
    this.name = "SheetsNotConfiguredError";
  }
}

/**
 * El valor de `GOOGLE_SHEETS_PRIVATE_KEY` en `.env.local` suele guardar los
 * saltos de línea como `\n` literal (dos caracteres) en vez de un salto de
 * línea real, porque una clave PEM multilínea no entra en una sola línea de
 * `.env`. Se destranscribe acá, no se le pide al usuario que lo arme bien a
 * mano. Ambas integraciones comparten la misma cuenta de servicio.
 */
function readServiceAccountCredentials(): { clientEmail: string; privateKey: string } | null {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL?.trim();
  const privateKeyRaw = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.trim();
  if (!clientEmail || !privateKeyRaw) return null;
  return { clientEmail, privateKey: privateKeyRaw.replace(/\\n/g, "\n") };
}

export function getSheetsConfig(): SheetsConfig | null {
  const creds = readServiceAccountCredentials();
  const spreadsheetId = process.env.GOOGLE_SHEETS_OBJECTIVES_SPREADSHEET_ID?.trim();
  const sheetName = process.env.GOOGLE_SHEETS_OBJECTIVES_SHEET_NAME?.trim() || "Hoja Objetivos de Calidad";
  if (!creds || !spreadsheetId) return null;
  return { ...creds, spreadsheetId, sheetName };
}

export function isSheetsConfigured(): boolean {
  return getSheetsConfig() !== null;
}

export function getSheetsConfigStatus(): {
  clientEmail: boolean;
  privateKey: boolean;
  spreadsheetId: boolean;
  configured: boolean;
} {
  const clientEmail = Boolean(process.env.GOOGLE_SHEETS_CLIENT_EMAIL?.trim());
  const privateKey = Boolean(process.env.GOOGLE_SHEETS_PRIVATE_KEY?.trim());
  const spreadsheetId = Boolean(process.env.GOOGLE_SHEETS_OBJECTIVES_SPREADSHEET_ID?.trim());
  return { clientEmail, privateKey, spreadsheetId, configured: clientEmail && privateKey && spreadsheetId };
}

/** Config de la planilla de Riesgos y Oportunidades — misma cuenta de servicio, pestaña distinta según `kind` (mismo archivo, 2 pestañas). */
export function getRisksSheetsConfig(kind: RiskKind): SheetsConfig | null {
  const creds = readServiceAccountCredentials();
  const spreadsheetId = process.env.GOOGLE_SHEETS_RISKS_SPREADSHEET_ID?.trim();
  if (!creds || !spreadsheetId) return null;
  const sheetName =
    kind === "oportunidad"
      ? process.env.GOOGLE_SHEETS_OPPORTUNITIES_SHEET_NAME?.trim() || "Oportunidades"
      : process.env.GOOGLE_SHEETS_RISKS_SHEET_NAME?.trim() || "Riesgos";
  return { ...creds, spreadsheetId, sheetName };
}

export function isRisksSheetsConfigured(): boolean {
  return getRisksSheetsConfig("riesgo") !== null;
}

export function getRisksSheetsConfigStatus(): {
  clientEmail: boolean;
  privateKey: boolean;
  spreadsheetId: boolean;
  configured: boolean;
} {
  const clientEmail = Boolean(process.env.GOOGLE_SHEETS_CLIENT_EMAIL?.trim());
  const privateKey = Boolean(process.env.GOOGLE_SHEETS_PRIVATE_KEY?.trim());
  const spreadsheetId = Boolean(process.env.GOOGLE_SHEETS_RISKS_SPREADSHEET_ID?.trim());
  return { clientEmail, privateKey, spreadsheetId, configured: clientEmail && privateKey && spreadsheetId };
}

function requireConfig(config: SheetsConfig | null): SheetsConfig {
  if (!config) {
    throw new SheetsNotConfiguredError(
      "Esta planilla no está configurada en este entorno — faltan una o más variables de entorno de Google Sheets.",
    );
  }
  return config;
}

// Token de acceso cacheado en memoria de proceso — se reusa mientras no esté
// por vencer, para no firmar y pedir un token nuevo en cada request (mismo
// espíritu que `statesCache`/`labelsCache` en el cliente de Plane). Las dos
// integraciones comparten la misma cuenta de servicio, así que comparten
// también el token — no hace falta cachear por spreadsheet.
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(config: SheetsConfig): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) return cachedToken.token;

  let key: Awaited<ReturnType<typeof importPKCS8>>;
  try {
    key = await importPKCS8(config.privateKey, "RS256");
  } catch {
    throw new SheetsApiError(
      "No se pudo leer GOOGLE_SHEETS_PRIVATE_KEY — revisar que sea la clave privada completa del JSON de la cuenta de servicio, con los \\n de los saltos de línea.",
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const assertion = await new SignJWT({ scope: SHEETS_SCOPE })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(config.clientEmail)
    .setSubject(config.clientEmail)
    .setAudience(TOKEN_ENDPOINT)
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new SheetsApiError(
      `Google rechazó la autenticación de la cuenta de servicio (HTTP ${response.status}): ${text.slice(0, 300)}`,
      response.status,
    );
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

function translateErrorMessage(status: number, bodyText: string): string {
  if (status === 401) return "Google rechazó las credenciales (401) — revisar GOOGLE_SHEETS_CLIENT_EMAIL / GOOGLE_SHEETS_PRIVATE_KEY.";
  if (status === 403) {
    return "Google devolvió 403 — la cuenta de servicio no tiene acceso a esta planilla. Compartila con el email de GOOGLE_SHEETS_CLIENT_EMAIL, con permiso de Editor.";
  }
  if (status === 404) return "Google devolvió 404 — revisar el ID de la planilla configurado.";
  if (status === 400) return `Google rechazó el pedido (400): ${bodyText.slice(0, 300)}`;
  return `Google Sheets devolvió un error (${status}): ${bodyText.slice(0, 300)}`;
}

async function sheetsFetch<T>(
  config: SheetsConfig,
  path: string,
  init: { method?: string; body?: unknown; query?: Record<string, string> } = {},
): Promise<T> {
  const token = await getAccessToken(config);
  const query = init.query ? `?${new URLSearchParams(init.query).toString()}` : "";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}${path}${query}`;

  const response = await fetch(url, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new SheetsApiError(translateErrorMessage(response.status, bodyText), response.status);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

type CellValue = string | number | boolean | null;

/** "Probar conexión": confirma que la cuenta de servicio puede leer los metadatos de la planilla. */
export async function getSpreadsheetTitle(configInput: SheetsConfig | null): Promise<string> {
  const config = requireConfig(configInput);
  const data = await sheetsFetch<{ properties?: { title?: string } }>(config, "", {
    query: { fields: "properties.title" },
  });
  return data.properties?.title ?? "(sin título)";
}

/** Todas las filas de datos desde `firstRow` hasta la columna `lastColumn`, valores sin formatear (fechas como número de serie — locale-independiente). */
export async function readSheetRows(configInput: SheetsConfig | null, firstRow: number, lastColumn: string): Promise<unknown[][]> {
  const config = requireConfig(configInput);
  const data = await sheetsFetch<{ values?: unknown[][] }>(
    config,
    `/values/${encodeURIComponent(`'${config.sheetName}'!A${firstRow}:${lastColumn}`)}`,
    { query: { valueRenderOption: "UNFORMATTED_VALUE", dateTimeRenderOption: "FORMATTED_STRING" } },
  );
  return data.values ?? [];
}

/** Agrega una fila nueva al final de la planilla. Devuelve el número de fila real donde quedó (Sheets decide, no siempre es "última fila conocida + 1" si hay filas vacías en el medio). */
export async function appendSheetRow(configInput: SheetsConfig | null, lastColumn: string, values: CellValue[]): Promise<number> {
  const config = requireConfig(configInput);
  const data = await sheetsFetch<{ updates?: { updatedRange?: string } }>(
    config,
    `/values/${encodeURIComponent(`'${config.sheetName}'!A:${lastColumn}`)}:append`,
    {
      method: "POST",
      query: { valueInputOption: "USER_ENTERED", insertDataOption: "INSERT_ROWS" },
      body: { values: [values] },
    },
  );
  const range = data.updates?.updatedRange ?? "";
  const match = range.match(/![A-Z]+(\d+):/);
  if (!match) throw new SheetsApiError(`No se pudo determinar en qué fila quedó la nueva entrada (rango devuelto: "${range}").`);
  return Number.parseInt(match[1], 10);
}

/** Sobrescribe una fila existente (A{row}:{lastColumn}{row}) — usado al editar un registro que ya tiene `sheet_row`. */
export async function updateSheetRow(configInput: SheetsConfig | null, row: number, lastColumn: string, values: CellValue[]): Promise<void> {
  const config = requireConfig(configInput);
  await sheetsFetch(config, `/values/${encodeURIComponent(`'${config.sheetName}'!A${row}:${lastColumn}${row}`)}`, {
    method: "PUT",
    query: { valueInputOption: "USER_ENTERED" },
    body: { values: [values] },
  });
}

/** Sobrescribe una sola celda (usado para volcar un valor puntual sin reescribir toda la fila). */
export async function updateSheetCell(configInput: SheetsConfig | null, row: number, column: string, value: CellValue): Promise<void> {
  const config = requireConfig(configInput);
  await sheetsFetch(config, `/values/${encodeURIComponent(`'${config.sheetName}'!${column}${row}`)}`, {
    method: "PUT",
    query: { valueInputOption: "USER_ENTERED" },
    body: { values: [[value]] },
  });
}
