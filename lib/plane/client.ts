/**
 * Cliente de Plane (Fase 4).
 *
 * Replica, en TypeScript y para uso server-side (Server Actions / route
 * handlers de Next.js), las mismas convenciones que ya usa el proyecto de
 * Apps Script del usuario contra su instancia real de Plane — ver
 * `claude/integracion-plane-appsscript.md` en el proyecto de Claude para el
 * detalle original. Se replican a propósito, en vez de inventar una integración
 * nueva, para que ambos sistemas (portal y Apps Script) hablen con Plane de la
 * misma forma y no diverjan en el manejo de errores o en la forma de las URLs.
 *
 * Importante — credenciales: este archivo NUNCA contiene URLs, workspace ni
 * API keys reales. Todo sale de variables de entorno (`PLANE_BASE_URL`,
 * `PLANE_WORKSPACE_SLUG`, `PLANE_API_KEY`) que el usuario carga en su propio
 * `.env.local` / entorno de despliegue — ver `.env.example` y el README. Si
 * esas variables no están configuradas, `getPlaneConfig()` devuelve `null` y
 * el resto de la app se comporta como si Plane estuviera "apagado" (ver
 * `isPlaneConfigured()`), nunca lanza ni bloquea el flujo de reportes.
 *
 * Instancia objetivo: Plane self-hosted, **Community Edition** (no Plane
 * Cloud / `api.plane.so`) — la URL base es siempre la del servidor propio del
 * usuario.
 *
 * ⚠️ Endpoint no documentado en la referencia original: `listWorkItems()`
 * (GET `/projects/{project_id}/work-items/`, sin id) es una suposición —
 * la implementación de Apps Script solo necesitaba leer work items por id ya
 * conocido, nunca listar todos los de un proyecto. Se asume que la API REST
 * de Plane expone la colección completa en la misma ruta base (patrón REST
 * estándar: colección sin id = todos, colección + id = uno), y que la
 * respuesta viene paginada con la forma `{ results: [...], next_cursor,
 * ... }` como el resto de la API de Plane. **Hay que confirmar esto contra
 * la instancia real** (ver "Probar conexión" en Configuración → Plane) antes
 * de confiar en la sincronización de tickets preexistentes.
 */

type PlaneConfig = {
  baseUrl: string;
  workspaceSlug: string;
  apiKey: string;
};

export type PlanePriority = "urgent" | "high" | "medium" | "low" | "none";

export type PlaneState = {
  id: string;
  name: string;
  group: string; // "backlog" | "unstarted" | "started" | "completed" | "cancelled" (típico de Plane)
};

export type PlaneWorkItem = {
  id: string;
  sequence_id?: number;
  name: string;
  description_html?: string;
  priority?: PlanePriority | null;
  state?: string | null; // UUID de PlaneState
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export type PlaneProjectInfo = {
  id: string;
  name: string;
  identifier?: string;
  [key: string]: unknown;
};

export type CreateWorkItemInput = {
  name: string;
  descriptionHtml?: string;
  priority?: PlanePriority;
};

export class PlaneApiError extends Error {
  status: number | null;
  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "PlaneApiError";
    this.status = status;
  }
}

export class PlaneNotConfiguredError extends Error {
  constructor() {
    super(
      "Plane no está configurado en este entorno (faltan PLANE_BASE_URL, PLANE_WORKSPACE_SLUG o PLANE_API_KEY).",
    );
    this.name = "PlaneNotConfiguredError";
  }
}

/** Lee la configuración de Plane desde variables de entorno. `null` si falta alguna. */
export function getPlaneConfig(): PlaneConfig | null {
  const baseUrl = process.env.PLANE_BASE_URL?.trim();
  const workspaceSlug = process.env.PLANE_WORKSPACE_SLUG?.trim();
  const apiKey = process.env.PLANE_API_KEY?.trim();
  if (!baseUrl || !workspaceSlug || !apiKey) return null;
  return { baseUrl: baseUrl.replace(/\/+$/, ""), workspaceSlug, apiKey };
}

export function isPlaneConfigured(): boolean {
  return getPlaneConfig() !== null;
}

/**
 * Estado de configuración variable por variable — para mostrar en pantalla
 * sin exponer nunca los valores reales (ni siquiera parcialmente).
 */
export function getPlaneConfigStatus(): {
  baseUrl: boolean;
  workspaceSlug: boolean;
  apiKey: boolean;
  configured: boolean;
} {
  const baseUrl = Boolean(process.env.PLANE_BASE_URL?.trim());
  const workspaceSlug = Boolean(process.env.PLANE_WORKSPACE_SLUG?.trim());
  const apiKey = Boolean(process.env.PLANE_API_KEY?.trim());
  return { baseUrl, workspaceSlug, apiKey, configured: baseUrl && workspaceSlug && apiKey };
}

function requireConfig(): PlaneConfig {
  const config = getPlaneConfig();
  if (!config) throw new PlaneNotConfiguredError();
  return config;
}

function buildApiUrl(config: PlaneConfig, path: string): string {
  const base = `${config.baseUrl}/api/v1/workspaces/${config.workspaceSlug}`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Link "humano" al work item (para mostrar en el portal), no es un endpoint de API. */
export function buildWorkItemUrl(config: PlaneConfig, projectId: string, workItemId: string): string {
  return `${config.baseUrl}/${config.workspaceSlug}/projects/${projectId}/issues/${workItemId}`;
}

/** Igual que `buildWorkItemUrl`, pero resuelve la config sola — `null` si Plane no está configurado. */
export function getWorkItemUrl(projectId: string, workItemId: string): string | null {
  const config = getPlaneConfig();
  if (!config) return null;
  return buildWorkItemUrl(config, projectId, workItemId);
}

function translateErrorMessage(status: number, bodyText: string): string {
  if (status === 401 || status === 403) {
    return "Plane rechazó las credenciales (401/403) — revisar PLANE_API_KEY.";
  }
  if (status === 404) {
    return "Plane devolvió 404 — revisar PLANE_BASE_URL, PLANE_WORKSPACE_SLUG o el ID de proyecto.";
  }
  if (status === 400) {
    return `Plane rechazó el payload (400): ${bodyText.slice(0, 300)}`;
  }
  return `Plane devolvió un error (${status}): ${bodyText.slice(0, 300)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 1500;

/**
 * Wrapper único para todas las llamadas HTTP a Plane — mismo criterio que
 * `_fetchPlane_` en Apps Script: 429/5xx y errores de red reintentan con
 * backoff (`1500ms * intento`, hasta 2 reintentos); 4xx falla inmediato con
 * mensaje traducido.
 */
async function planeFetch<T>(
  config: PlaneConfig,
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const url = buildApiUrl(config, path);
  const method = init.method ?? "GET";

  let lastError: unknown = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "X-API-Key": config.apiKey,
          "Content-Type": "application/json",
        },
        body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
        cache: "no-store",
      });

      if (response.ok) {
        if (response.status === 204) return undefined as T;
        return (await response.json()) as T;
      }

      const bodyText = await response.text().catch(() => "");

      if (response.status === 429 || response.status >= 500) {
        lastError = new PlaneApiError(translateErrorMessage(response.status, bodyText), response.status);
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_BASE_DELAY_MS * (attempt + 1));
          continue;
        }
        throw lastError;
      }

      // 4xx: no reintentar, error inmediato.
      throw new PlaneApiError(translateErrorMessage(response.status, bodyText), response.status);
    } catch (error) {
      if (error instanceof PlaneApiError) throw error;
      // Error de red (DNS, timeout, fetch failed) -> entra al loop de reintento.
      lastError = error;
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_BASE_DELAY_MS * (attempt + 1));
        continue;
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new PlaneApiError(`No se pudo conectar con Plane: ${message}`);
    }
  }

  throw lastError instanceof Error ? lastError : new PlaneApiError("Error desconocido al conectar con Plane.");
}

/** Info del proyecto — se usa como "probar conexión" (config + project_id válidos). */
export async function testConnection(projectId: string): Promise<PlaneProjectInfo> {
  const config = requireConfig();
  return planeFetch<PlaneProjectInfo>(config, `/projects/${projectId}/`);
}

// Cache de estados por proyecto, en memoria de proceso — evita golpear
// `/states/` en cada work item durante una misma corrida de sincronización.
// Mismo criterio que el cacheo por `project_id` que describe el doc de Apps
// Script. Se puede forzar una relectura con `refresh: true`.
const statesCache = new Map<string, Map<string, PlaneState>>();

export async function listStates(projectId: string, options: { refresh?: boolean } = {}): Promise<Map<string, PlaneState>> {
  if (!options.refresh && statesCache.has(projectId)) return statesCache.get(projectId)!;

  const config = requireConfig();
  const raw = await planeFetch<{ results?: PlaneState[] } | PlaneState[]>(config, `/projects/${projectId}/states/`);
  const list = Array.isArray(raw) ? raw : (raw.results ?? []);
  const map = new Map<string, PlaneState>(list.map((state) => [state.id, state]));
  statesCache.set(projectId, map);
  return map;
}

export function clearStatesCache(projectId?: string): void {
  if (projectId) statesCache.delete(projectId);
  else statesCache.clear();
}

export async function createWorkItem(projectId: string, input: CreateWorkItemInput): Promise<PlaneWorkItem> {
  const config = requireConfig();
  return planeFetch<PlaneWorkItem>(config, `/projects/${projectId}/work-items/`, {
    method: "POST",
    body: {
      name: input.name,
      description_html: input.descriptionHtml ?? "<p></p>",
      priority: input.priority ?? "none",
    },
  });
}

export async function getWorkItem(projectId: string, workItemId: string): Promise<PlaneWorkItem> {
  const config = requireConfig();
  return planeFetch<PlaneWorkItem>(config, `/projects/${projectId}/work-items/${workItemId}/`);
}

/**
 * ⚠️ Endpoint asumido, no verificado contra una instancia real (ver nota al
 * inicio del archivo). Si la instancia del usuario no lo expone en esta
 * ruta, esta función es el único lugar que habría que ajustar.
 */
export async function listWorkItems(
  projectId: string,
  options: { cursor?: string } = {},
): Promise<{ results: PlaneWorkItem[]; nextCursor: string | null }> {
  const config = requireConfig();
  const query = options.cursor ? `?cursor=${encodeURIComponent(options.cursor)}` : "";
  const raw = await planeFetch<{ results?: PlaneWorkItem[]; next_cursor?: string | null } | PlaneWorkItem[]>(
    config,
    `/projects/${projectId}/work-items/${query}`,
  );
  if (Array.isArray(raw)) return { results: raw, nextCursor: null };
  return { results: raw.results ?? [], nextCursor: raw.next_cursor ?? null };
}

/** Resuelve el estado de un work item contra el mapa de estados del proyecto. */
export async function resolveWorkItemStatus(
  projectId: string,
  workItem: PlaneWorkItem,
): Promise<{ name: string; group: string; terminal: boolean } | null> {
  if (!workItem.state) return null;
  const states = await listStates(projectId);
  const state = states.get(workItem.state);
  if (!state) return null;
  return {
    name: state.name,
    group: state.group,
    terminal: state.group === "completed" || state.group === "cancelled",
  };
}

/** Traduce prioridad + urgencia del portal a la escala de prioridad de Plane. */
export function mapPortalPriorityToPlane(priority: "Baja" | "Media" | "Alta", urgent: boolean): PlanePriority {
  if (urgent) return "urgent";
  if (priority === "Alta") return "high";
  if (priority === "Media") return "medium";
  return "low";
}

/**
 * Dirección inversa (Fase 6, tipificación) — un ticket creado directo en
 * Plane no tiene equivalente exacto de "urgente" del portal, así que
 * "urgent" de Plane mapea a Alta igual que "high".
 */
export function mapPlanePriorityToPortal(priority: PlanePriority | null | undefined): "Baja" | "Media" | "Alta" {
  if (priority === "urgent" || priority === "high") return "Alta";
  if (priority === "medium") return "Media";
  return "Baja";
}

/** Saca las etiquetas HTML de `description_html` para guardarlas como texto plano. */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
