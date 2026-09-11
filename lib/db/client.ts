/**
 * Conexión a la base de datos del portal (Fase 3).
 *
 * Decisión de esta fase: usar `node:sqlite` (el driver de SQLite incluido en Node
 * 22.5+, sin dependencias externas) en vez de un ORM como Prisma. Se probó Prisma
 * primero, pero requiere descargar binarios de motor desde `binaries.prisma.sh` en
 * el momento de instalar/generar el cliente, y esa red no está disponible en este
 * entorno de build. `node:sqlite` viene incluido en Node y no necesita descargar
 * nada, así que es la opción más robusta para no depender de qué red tenga
 * disponible el entorno donde se despliegue esto.
 *
 * Es una base real (SQLite, un archivo en `data/agora.db`), no un mock en memoria.
 * Si más adelante hace falta Postgres (por ejemplo, para correr con múltiples
 * instancias del servidor a la vez), toda el acceso a datos pasa por
 * `lib/db/queries.ts` — ahí es donde habría que migrar, sin tocar las páginas.
 *
 * `import "server-only"` (agregado en la fase de autenticación): este módulo
 * abre `node:sqlite`, que no existe en el navegador. Sin esta guardia, un
 * componente "use client" que importa un *valor* (no un tipo) de
 * `lib/db/queries.ts` — que importa este archivo — rompe el build de
 * Turbopack con un panic críptico (`the chunking context ... does not
 * support external modules`, ver Fases 8 y 11 en
 * `claude/progreso-implementacion.md`). Con esta guardia, el mismo error da
 * un mensaje claro de "server-only" en el momento de compilar en vez de un
 * panic interno de Turbopack.
 */
import "server-only";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "agora.db");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS areas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS record_types (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT 'violet',
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS records (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  area_id TEXT,
  process_name TEXT,
  reporter_name TEXT NOT NULL,
  event_date TEXT,
  impact TEXT,
  priority TEXT NOT NULL DEFAULT 'Media',
  urgent INTEGER NOT NULL DEFAULT 0,
  evidence_note TEXT,
  comments TEXT,
  status TEXT NOT NULL DEFAULT 'Recibido',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  record_id TEXT NOT NULL,
  event TEXT NOT NULL,
  detail TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS code_counters (
  type_code TEXT NOT NULL,
  year INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (type_code, year)
);

-- Fase 4: mapeo de qué proyecto de Plane corresponde a cada área del portal.
-- "plane_project_id" es el UUID real del proyecto en la instancia de Plane del
-- usuario — nunca se inventa acá, lo carga el usuario en Configuración → Plane.
CREATE TABLE IF NOT EXISTS plane_project_mappings (
  id TEXT PRIMARY KEY,
  area_id TEXT NOT NULL UNIQUE,
  plane_project_id TEXT NOT NULL,
  plane_project_name TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Fase 4: historial de intentos de sincronización con Plane (creación de work
-- items desde el portal, y futuras corridas de sincronización periódica).
CREATE TABLE IF NOT EXISTS plane_sync_logs (
  id TEXT PRIMARY KEY,
  direction TEXT NOT NULL,
  record_id TEXT,
  record_code TEXT,
  plane_project_id TEXT,
  event TEXT NOT NULL,
  status TEXT NOT NULL,
  detail TEXT,
  created_at TEXT NOT NULL
);

-- Fase 6: tickets de Plane marcados como "no aplica al SGC" desde la pantalla
-- Gestión de Calidad → Tickets Plane. No se borra el ticket de Plane ni se
-- crea ningún registro — solo se recuerda la decisión para no volver a
-- mostrarlo como pendiente de tipificar en cada carga de la pantalla.
CREATE TABLE IF NOT EXISTS plane_ticket_dismissals (
  id TEXT PRIMARY KEY,
  plane_project_id TEXT NOT NULL,
  plane_work_item_id TEXT NOT NULL UNIQUE,
  plane_sequence_id TEXT,
  reason TEXT,
  created_at TEXT NOT NULL
);

-- Configuración general del sitio, clave/valor genérico — por ahora solo se
-- usa para recordar el archivo de la foto del equipo en el Home
-- ("home_photo_filename"), pero queda pensada para cualquier otro ajuste
-- global futuro sin tener que agregar una tabla nueva cada vez.
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Fase 7: vínculos entre dos registros del SGC (NC->AC, Q->NC, R->AC, etc.). Genérica
-- y bidireccional a propósito: no se modela como una columna "AC relacionada" en
-- records porque un mismo registro puede terminar vinculado a más de uno (a
-- diferencia del límite de "un solo ticket de Plane por registro" que sí quedó
-- documentado como limitación en la Fase 6).
CREATE TABLE IF NOT EXISTS sgc_relationships (
  id TEXT PRIMARY KEY,
  from_record_id TEXT NOT NULL,
  to_record_id TEXT NOT NULL,
  label TEXT,
  created_at TEXT NOT NULL
);

-- Fase 7: evidencia adjunta a un registro (texto/link, no carga de archivos —
-- misma simplificación deliberada que "evidence_note" desde la Fase 3), a
-- diferencia de "evidence_note" (un solo campo del reporte original) esto
-- permite sumar varias evidencias a lo largo de la gestión del registro.
CREATE TABLE IF NOT EXISTS sgc_evidence (
  id TEXT PRIMARY KEY,
  record_id TEXT NOT NULL,
  description TEXT NOT NULL,
  link TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL
);

-- Fase 8: Riesgos y Oportunidades. A diferencia de NC/AC/AP/OM/Q/S/R (que viven
-- en "records" con un type_id), la spec los modela como una entidad propia
-- ("sgc_risks" en el modelo de datos de la sección 65) — no es un tipo de
-- registro más. "kind" distingue 'riesgo' de 'oportunidad'; ambos comparten el
-- mismo prefijo de código (RISK-2026-001, ver generateSgcCode) porque la spec
-- solo lista ese prefijo para ambos.
CREATE TABLE IF NOT EXISTS sgc_risks (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL,
  source TEXT,
  area_id TEXT,
  process_name TEXT,
  activity TEXT,
  description TEXT NOT NULL,
  detail TEXT,
  existing_control TEXT,
  probability_initial INTEGER,
  impact_initial INTEGER,
  treatment_plan TEXT,
  responsible TEXT,
  due_date TEXT,
  status TEXT NOT NULL DEFAULT 'Identificado',
  verification TEXT,
  probability_residual INTEGER,
  impact_residual INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  closed_at TEXT
);

-- Fase 8: controles existentes de un riesgo/oportunidad. Lista (no un campo
-- único) porque a lo largo de la gestión se pueden ir sumando más controles,
-- cada uno con su propia evaluación de eficacia — misma filosofía que
-- "sgc_evidence" desde la Fase 7.
CREATE TABLE IF NOT EXISTS sgc_risk_controls (
  id TEXT PRIMARY KEY,
  risk_id TEXT NOT NULL,
  description TEXT NOT NULL,
  responsible TEXT,
  effectiveness TEXT,
  created_at TEXT NOT NULL
);

-- Fase 8: vínculo entre un riesgo/oportunidad y un registro SGC existente
-- (NC/AC/OM/etc — "record_id" referencia records.id). Tabla propia en vez de
-- reutilizar "sgc_relationships" porque esa tabla vincula dos records entre
-- sí, y un riesgo no es un record.
CREATE TABLE IF NOT EXISTS sgc_risk_relationships (
  id TEXT PRIMARY KEY,
  risk_id TEXT NOT NULL,
  record_id TEXT NOT NULL,
  label TEXT,
  created_at TEXT NOT NULL
);

-- Fase 11: Objetivos de Calidad e Indicadores. Mismo criterio que sgc_risks:
-- snapshot de los campos actuales (igual que los lista la spec) + una tabla
-- de histórico aparte para la vista "Meta vs Real" y las tendencias — mismo
-- patrón que evidence_note (Fase 3, campo único) conviviendo con
-- sgc_evidence (Fase 7, lista histórica).
CREATE TABLE IF NOT EXISTS sgc_objectives (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  goal TEXT,
  target_value REAL,
  indicator_id TEXT,
  unit TEXT,
  resources TEXT,
  responsible TEXT,
  area_id TEXT,
  process_name TEXT,
  start_date TEXT,
  end_date TEXT,
  frequency TEXT,
  method TEXT,
  current_result TEXT,
  compliance_percent REAL,
  evidence TEXT,
  observations TEXT,
  status TEXT NOT NULL DEFAULT 'En curso',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  closed_at TEXT
);

CREATE TABLE IF NOT EXISTS sgc_objective_results (
  id TEXT PRIMARY KEY,
  objective_id TEXT NOT NULL,
  period TEXT NOT NULL,
  actual_value REAL,
  target_value REAL,
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sgc_indicators (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  formula TEXT,
  source TEXT,
  unit TEXT,
  target_value REAL,
  tolerance REAL,
  frequency TEXT,
  responsible TEXT,
  area_id TEXT,
  process_name TEXT,
  current_result REAL,
  current_period TEXT,
  evidence TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sgc_indicator_results (
  id TEXT PRIMARY KEY,
  indicator_id TEXT NOT NULL,
  period TEXT NOT NULL,
  value REAL,
  notes TEXT,
  created_at TEXT NOT NULL
);

-- Evaluación → Satisfacción: resultados de satisfacción del cliente por
-- período (encuestas, NPS, CSAT, lo que use cada área), vinculados en la
-- pantalla con las Quejas y Reclamos ya cargados en el Registro SGC.
CREATE TABLE IF NOT EXISTS sgc_satisfaction_results (
  id TEXT PRIMARY KEY,
  period TEXT NOT NULL,
  area_id TEXT,
  score REAL NOT NULL,
  unit TEXT,
  respondents INTEGER,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Autenticación: usuarios reales del portal (login con Google Workspace).
-- "role" es texto libre a propósito (no CHECK) para no tener que migrar el
-- esquema si el usuario pide un rol nuevo más adelante — los valores válidos
-- de hoy (admin | calidad | responsable_area | colaborador | consulta) viven
-- en código (lib/auth/roles.ts), no en la base.
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  picture TEXT,
  role TEXT NOT NULL DEFAULT 'colaborador',
  area_id TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_login_at TEXT
);
`;

// Fase 4: columnas nuevas en `records` para guardar la relación con el work item
// de Plane. Se agregan con ALTER TABLE (no en el CREATE TABLE de arriba) porque
// instalaciones que ya venían de la Fase 3 ya tienen la tabla `records` creada
// sin estas columnas — `CREATE TABLE IF NOT EXISTS` no las agrega solo.
const RECORDS_PLANE_COLUMNS: { name: string; ddl: string }[] = [
  { name: "plane_project_id", ddl: "ALTER TABLE records ADD COLUMN plane_project_id TEXT" },
  { name: "plane_work_item_id", ddl: "ALTER TABLE records ADD COLUMN plane_work_item_id TEXT" },
  { name: "plane_sequence_id", ddl: "ALTER TABLE records ADD COLUMN plane_sequence_id TEXT" },
  { name: "plane_status", ddl: "ALTER TABLE records ADD COLUMN plane_status TEXT" },
  { name: "plane_url", ddl: "ALTER TABLE records ADD COLUMN plane_url TEXT" },
  { name: "plane_synced_at", ddl: "ALTER TABLE records ADD COLUMN plane_synced_at TEXT" },
];

/**
 * Agrega columnas nuevas a una tabla existente (patrón `ALTER TABLE ... ADD
 * COLUMN`, idempotente entre reinicios normales). El build de producción con
 * Turbopack levanta ~20 workers en paralelo que evalúan `migrate()` al mismo
 * tiempo (procesos separados, no comparten el singleton de `db`) — dos
 * pueden leer "la columna no existe" antes de que el otro termine su ALTER,
 * y el segundo choca con `duplicate column name`. Es inofensivo (la columna
 * ya quedó creada por el otro proceso), así que se ignora puntualmente ese
 * error y se relanza cualquier otro.
 */
function ensureColumns(db: DatabaseSync, table: string, columns: { name: string; ddl: string }[]) {
  const existing = new Set(
    (db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).map((col) => col.name),
  );
  for (const column of columns) {
    if (existing.has(column.name)) continue;
    try {
      db.exec(column.ddl);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("duplicate column name")) throw error;
    }
  }
}

function ensureRecordsPlaneColumns(db: DatabaseSync) {
  ensureColumns(db, "records", RECORDS_PLANE_COLUMNS);
}

// Fase 7: columnas de "gestión completa" — análisis de causa raíz y corrección
// inmediata (principalmente para NC), verificación de eficacia y cierre
// (principalmente para AC), y una fecha de vencimiento/compromiso genérica que
// había quedado señalada como pendiente desde la Fase 3.
const RECORDS_GESTION_COLUMNS: { name: string; ddl: string }[] = [
  { name: "due_date", ddl: "ALTER TABLE records ADD COLUMN due_date TEXT" },
  { name: "root_cause_method", ddl: "ALTER TABLE records ADD COLUMN root_cause_method TEXT" },
  { name: "root_cause_analysis", ddl: "ALTER TABLE records ADD COLUMN root_cause_analysis TEXT" },
  { name: "root_cause", ddl: "ALTER TABLE records ADD COLUMN root_cause TEXT" },
  { name: "correction_action", ddl: "ALTER TABLE records ADD COLUMN correction_action TEXT" },
  { name: "correction_responsible", ddl: "ALTER TABLE records ADD COLUMN correction_responsible TEXT" },
  { name: "correction_date", ddl: "ALTER TABLE records ADD COLUMN correction_date TEXT" },
  { name: "effectiveness_due_date", ddl: "ALTER TABLE records ADD COLUMN effectiveness_due_date TEXT" },
  { name: "effectiveness_responsible", ddl: "ALTER TABLE records ADD COLUMN effectiveness_responsible TEXT" },
  { name: "effectiveness_result", ddl: "ALTER TABLE records ADD COLUMN effectiveness_result TEXT" },
  { name: "effectiveness_evidence", ddl: "ALTER TABLE records ADD COLUMN effectiveness_evidence TEXT" },
  { name: "effective", ddl: "ALTER TABLE records ADD COLUMN effective INTEGER" },
  { name: "closed_at", ddl: "ALTER TABLE records ADD COLUMN closed_at TEXT" },
];

function ensureRecordsGestionColumns(db: DatabaseSync) {
  ensureColumns(db, "records", RECORDS_GESTION_COLUMNS);
}

// Autenticación: quién hizo cada acción. `activity_log` existe desde la Fase
// 3 sin esta columna — se agrega ahora, no antes, porque hasta esta fase no
// existía ningún concepto de "quién" (ver `addActivityLog` en queries.ts,
// que las completa sola leyendo la sesión actual).
const ACTIVITY_LOG_ACTOR_COLUMNS: { name: string; ddl: string }[] = [
  { name: "actor_email", ddl: "ALTER TABLE activity_log ADD COLUMN actor_email TEXT" },
  { name: "actor_name", ddl: "ALTER TABLE activity_log ADD COLUMN actor_name TEXT" },
];

function ensureActivityLogActorColumns(db: DatabaseSync) {
  ensureColumns(db, "activity_log", ACTIVITY_LOG_ACTOR_COLUMNS);
}

// Fase 6 (etiqueta de importación): filtro opcional para no traer TODOS los
// work items del proyecto mapeado a "Gestión de Calidad → Tickets Plane" —
// si se completa, solo se listan como pendientes de tipificar los que tengan
// esa etiqueta en Plane. Sin ella, se mantiene el comportamiento anterior
// (se listan todos los work items del proyecto).
// `auto_type_code`: tipo SGC sugerido (código de `record_types`) para
// pre-cargar al tipificar un ticket de este proyecto — no crea el registro
// solo, sigue exigiendo el click de "Crear registro y vincular" (a propósito,
// ver la nota de `tipificarTicketAction`), pero evita elegir tipo y área a
// mano cada vez que ya se sabe de antemano qué va a ser.
const PLANE_MAPPING_LABEL_COLUMNS: { name: string; ddl: string }[] = [
  { name: "import_label", ddl: "ALTER TABLE plane_project_mappings ADD COLUMN import_label TEXT" },
  { name: "auto_type_code", ddl: "ALTER TABLE plane_project_mappings ADD COLUMN auto_type_code TEXT" },
];

function ensurePlaneMappingLabelColumn(db: DatabaseSync) {
  ensureColumns(db, "plane_project_mappings", PLANE_MAPPING_LABEL_COLUMNS);
}

// Notificaciones (campana del header): en vez de una tabla de notificaciones
// propiamente dicha, se reutiliza `activity_log` (ya filtrado por relevancia
// para cada usuario, mismo criterio que "Mi SGC" → Últimos movimientos) y se
// guarda solo cuándo cada usuario vio la campana por última vez — todo lo
// posterior a esa fecha cuenta como "no leído". Más simple que trackear el
// estado de lectura de cada evento por separado, y alcanza para una campana
// que se marca como leída al abrirla (no ítem por ítem).
const USER_NOTIFICATIONS_COLUMNS: { name: string; ddl: string }[] = [
  { name: "notifications_last_seen_at", ddl: "ALTER TABLE users ADD COLUMN notifications_last_seen_at TEXT" },
];

function ensureUserNotificationsColumn(db: DatabaseSync) {
  ensureColumns(db, "users", USER_NOTIFICATIONS_COLUMNS);
}

// Sincronización con la planilla real de Objetivos de Calidad del usuario
// (Google Sheets) — `sheet_row` es la fila que le corresponde a este
// objetivo en la planilla (null hasta que se importa o se sincroniza por
// primera vez); `sheet_no` conserva el "N°" original de la planilla, solo
// para mostrar, no se usa para direccionar nada. `indicator_text` y
// `policy_principle` son 2 columnas de la planilla sin equivalente en el
// modelo del portal hasta ahora — se agregan tal cual, en vez de forzarlas
// dentro de un campo que significa otra cosa (`indicator_id` es una FK real
// a `sgc_indicators`, no texto libre).
const OBJECTIVE_SHEET_COLUMNS: { name: string; ddl: string }[] = [
  { name: "sheet_row", ddl: "ALTER TABLE sgc_objectives ADD COLUMN sheet_row INTEGER" },
  { name: "sheet_no", ddl: "ALTER TABLE sgc_objectives ADD COLUMN sheet_no TEXT" },
  { name: "indicator_text", ddl: "ALTER TABLE sgc_objectives ADD COLUMN indicator_text TEXT" },
  { name: "policy_principle", ddl: "ALTER TABLE sgc_objectives ADD COLUMN policy_principle TEXT" },
];

function ensureObjectiveSheetColumns(db: DatabaseSync) {
  ensureColumns(db, "sgc_objectives", OBJECTIVE_SHEET_COLUMNS);
}

// Igual que `OBJECTIVE_SHEET_COLUMNS` pero para Riesgos y Oportunidades —
// planilla distinta (2 pestañas, "Riesgos" y "Oportunidades", mismo layout).
const RISK_SHEET_COLUMNS: { name: string; ddl: string }[] = [
  { name: "sheet_row", ddl: "ALTER TABLE sgc_risks ADD COLUMN sheet_row INTEGER" },
  { name: "sheet_no", ddl: "ALTER TABLE sgc_risks ADD COLUMN sheet_no TEXT" },
];

function ensureRiskSheetColumns(db: DatabaseSync) {
  ensureColumns(db, "sgc_risks", RISK_SHEET_COLUMNS);
}

const SEED_AREAS: { id: string; name: string; sort_order: number }[] = [
  { id: "operaciones", name: "Operaciones", sort_order: 1 },
  { id: "comercial", name: "Comercial", sort_order: 2 },
  { id: "delivery", name: "Delivery", sort_order: 3 },
  { id: "rrhh", name: "RRHH", sort_order: 4 },
  { id: "administracion", name: "Administración", sort_order: 5 },
  { id: "it", name: "IT", sort_order: 6 },
  { id: "producto", name: "Producto", sort_order: 7 },
  { id: "calidad", name: "Calidad", sort_order: 8 },
];

const SEED_TYPES: {
  id: string;
  code: string;
  name: string;
  description: string;
  color: string;
  sort_order: number;
}[] = [
  { id: "nc", code: "NC", name: "No Conformidad", description: "Algo que estaba definido no se cumplió.", color: "red", sort_order: 1 },
  { id: "ac", code: "AC", name: "Acción Correctiva", description: "Elimina la causa raíz de una No Conformidad.", color: "violet", sort_order: 2 },
  { id: "ap", code: "AP", name: "Acción Preventiva", description: "Actúa sobre una situación potencial, antes de que ocurra.", color: "amber", sort_order: 3 },
  { id: "om", code: "OM", name: "Oportunidad de Mejora", description: "Propuesta para hacer algo más simple, rápido o eficiente.", color: "green", sort_order: 4 },
  { id: "q", code: "Q", name: "Queja", description: "Insatisfacción manifestada sobre un servicio o proceso.", color: "amber", sort_order: 5 },
  { id: "s", code: "S", name: "Sugerencia", description: "Propuesta o recomendación de cualquier colaborador.", color: "blue", sort_order: 6 },
  { id: "r", code: "R", name: "Reclamo", description: "Solicitud formal de resolución ante un incumplimiento.", color: "red", sort_order: 7 },
];

function migrate(db: DatabaseSync) {
  db.exec(SCHEMA);
  ensureRecordsPlaneColumns(db);
  ensureRecordsGestionColumns(db);
  ensureActivityLogActorColumns(db);
  ensurePlaneMappingLabelColumn(db);
  ensureUserNotificationsColumn(db);
  ensureObjectiveSheetColumns(db);
  ensureRiskSheetColumns(db);
}

function seed(db: DatabaseSync) {
  const areaCount = db.prepare("SELECT COUNT(*) as count FROM areas").get() as { count: number } | undefined;
  if (!areaCount || areaCount.count === 0) {
    const insertArea = db.prepare("INSERT INTO areas (id, name, active, sort_order) VALUES (?, ?, 1, ?)");
    for (const area of SEED_AREAS) insertArea.run(area.id, area.name, area.sort_order);
  }

  const typeCount = db.prepare("SELECT COUNT(*) as count FROM record_types").get() as
    | { count: number }
    | undefined;
  if (!typeCount || typeCount.count === 0) {
    const insertType = db.prepare(
      "INSERT INTO record_types (id, code, name, description, color, active, sort_order) VALUES (?, ?, ?, ?, ?, 1, ?)",
    );
    for (const type of SEED_TYPES) {
      insertType.run(type.id, type.code, type.name, type.description, type.color, type.sort_order);
    }
  }
}

declare global {
  var __agoraDb: DatabaseSync | undefined;
}

function createConnection(): DatabaseSync {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  const database = new DatabaseSync(DB_PATH);
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA busy_timeout = 5000;");
  migrate(database);
  seed(database);
  return database;
}

// En dev, Next.js recarga módulos frecuentemente (HMR) — cachear en `global` evita
// abrir una conexión nueva (y volver a correr el seed) en cada recarga.
export const db: DatabaseSync = global.__agoraDb ?? createConnection();
if (process.env.NODE_ENV !== "production") {
  global.__agoraDb = db;
}
