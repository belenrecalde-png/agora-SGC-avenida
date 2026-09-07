import { randomUUID } from "node:crypto";
import { db } from "./client";
import { getRiskBand, getRiskScore, type RiskBand, type RiskKind } from "@/lib/risk-scoring";

// Reexportados tal cual para que el resto del código (Server Components) los
// siga importando desde "@/lib/db/queries" sin cambios — ver el comentario en
// lib/risk-scoring.ts sobre por qué la lógica pura vive en un módulo aparte.
export { getRiskBand, getRiskScore };
export type { RiskBand, RiskKind };

export type Area = {
  id: string;
  name: string;
  active: boolean;
  sort_order: number;
};

export type RecordType = {
  id: string;
  code: string;
  name: string;
  description: string;
  color: string;
  active: boolean;
  sort_order: number;
};

export type SgcRecord = {
  id: string;
  code: string;
  type_id: string;
  title: string;
  description: string;
  area_id: string | null;
  process_name: string | null;
  reporter_name: string;
  event_date: string | null;
  impact: string | null;
  priority: "Baja" | "Media" | "Alta";
  urgent: boolean;
  evidence_note: string | null;
  comments: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  // Fase 4 — relación con el work item de Plane (null si Plane no está
  // configurado, o si el área del registro no tiene un proyecto mapeado).
  plane_project_id: string | null;
  plane_work_item_id: string | null;
  plane_sequence_id: string | null;
  plane_status: string | null;
  plane_url: string | null;
  plane_synced_at: string | null;
  // Fase 7 — vencimiento/compromiso genérico, análisis de causa raíz y
  // corrección inmediata (principalmente NC), verificación de eficacia y
  // cierre (principalmente AC).
  due_date: string | null;
  root_cause_method: string | null;
  root_cause_analysis: string | null;
  root_cause: string | null;
  correction_action: string | null;
  correction_responsible: string | null;
  correction_date: string | null;
  effectiveness_due_date: string | null;
  effectiveness_responsible: string | null;
  effectiveness_result: string | null;
  effectiveness_evidence: string | null;
  effective: boolean | null;
  closed_at: string | null;
};

export type ActivityLogEntry = {
  id: string;
  record_id: string;
  event: string;
  detail: string | null;
  created_at: string;
};

// Fase 4 — mapeo área del portal ↔ proyecto de Plane. `plane_project_id` es el
// UUID real del proyecto en la instancia de Plane del usuario; nunca se
// inventa ni se hardcodea acá, lo carga el usuario en Configuración → Plane.
export type PlaneProjectMapping = {
  id: string;
  area_id: string;
  plane_project_id: string;
  plane_project_name: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type PlaneSyncDirection = "portal_to_plane" | "plane_to_portal";
export type PlaneSyncStatus = "success" | "error" | "skipped";

export type PlaneSyncLog = {
  id: string;
  direction: PlaneSyncDirection;
  record_id: string | null;
  record_code: string | null;
  plane_project_id: string | null;
  event: string;
  status: PlaneSyncStatus;
  detail: string | null;
  created_at: string;
};

// Fase 6 — un ticket de Plane marcado como "no aplica al SGC" desde la
// pantalla Gestión de Calidad → Tickets Plane (ver `dismissPlaneTicket`).
export type PlaneTicketDismissal = {
  id: string;
  plane_project_id: string;
  plane_work_item_id: string;
  plane_sequence_id: string | null;
  reason: string | null;
  created_at: string;
};

// Fase 7 — vínculo entre dos registros del SGC (NC→AC, o cualquier otro par).
// Genérico y bidireccional: `other` y `direction` están resueltos relativos
// al registro desde el que se pidió el listado (ver `listRelationshipsForRecord`).
export type RecordRelationship = {
  id: string;
  from_record_id: string;
  to_record_id: string;
  label: string | null;
  created_at: string;
  other: SgcRecord;
  direction: "from" | "to";
};

// Fase 7 — una evidencia adjunta a un registro (texto/link, no archivo — misma
// simplificación deliberada que `evidence_note` desde la Fase 3). A diferencia
// de `evidence_note` (un campo único cargado en el reporte original), acá se
// pueden sumar varias a lo largo de la gestión del registro.
export type RecordEvidence = {
  id: string;
  record_id: string;
  description: string;
  link: string | null;
  created_by: string | null;
  created_at: string;
};

function toBool(value: unknown): boolean {
  return value === 1 || value === true;
}

function rowToArea(row: Record<string, unknown>): Area {
  return {
    id: row.id as string,
    name: row.name as string,
    active: toBool(row.active),
    sort_order: row.sort_order as number,
  };
}

function rowToType(row: Record<string, unknown>): RecordType {
  return {
    id: row.id as string,
    code: row.code as string,
    name: row.name as string,
    description: row.description as string,
    color: row.color as string,
    active: toBool(row.active),
    sort_order: row.sort_order as number,
  };
}

function rowToRecord(row: Record<string, unknown>): SgcRecord {
  return {
    id: row.id as string,
    code: row.code as string,
    type_id: row.type_id as string,
    title: row.title as string,
    description: row.description as string,
    area_id: (row.area_id as string) ?? null,
    process_name: (row.process_name as string) ?? null,
    reporter_name: row.reporter_name as string,
    event_date: (row.event_date as string) ?? null,
    impact: (row.impact as string) ?? null,
    priority: row.priority as SgcRecord["priority"],
    urgent: toBool(row.urgent),
    evidence_note: (row.evidence_note as string) ?? null,
    comments: (row.comments as string) ?? null,
    status: row.status as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    plane_project_id: (row.plane_project_id as string) ?? null,
    plane_work_item_id: (row.plane_work_item_id as string) ?? null,
    plane_sequence_id: (row.plane_sequence_id as string) ?? null,
    plane_status: (row.plane_status as string) ?? null,
    plane_url: (row.plane_url as string) ?? null,
    plane_synced_at: (row.plane_synced_at as string) ?? null,
    due_date: (row.due_date as string) ?? null,
    root_cause_method: (row.root_cause_method as string) ?? null,
    root_cause_analysis: (row.root_cause_analysis as string) ?? null,
    root_cause: (row.root_cause as string) ?? null,
    correction_action: (row.correction_action as string) ?? null,
    correction_responsible: (row.correction_responsible as string) ?? null,
    correction_date: (row.correction_date as string) ?? null,
    effectiveness_due_date: (row.effectiveness_due_date as string) ?? null,
    effectiveness_responsible: (row.effectiveness_responsible as string) ?? null,
    effectiveness_result: (row.effectiveness_result as string) ?? null,
    effectiveness_evidence: (row.effectiveness_evidence as string) ?? null,
    effective: row.effective === null || row.effective === undefined ? null : toBool(row.effective),
    closed_at: (row.closed_at as string) ?? null,
  };
}

function rowToPlaneProjectMapping(row: Record<string, unknown>): PlaneProjectMapping {
  return {
    id: row.id as string,
    area_id: row.area_id as string,
    plane_project_id: row.plane_project_id as string,
    plane_project_name: (row.plane_project_name as string) ?? null,
    active: toBool(row.active),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

function rowToPlaneTicketDismissal(row: Record<string, unknown>): PlaneTicketDismissal {
  return {
    id: row.id as string,
    plane_project_id: row.plane_project_id as string,
    plane_work_item_id: row.plane_work_item_id as string,
    plane_sequence_id: (row.plane_sequence_id as string) ?? null,
    reason: (row.reason as string) ?? null,
    created_at: row.created_at as string,
  };
}

function rowToPlaneSyncLog(row: Record<string, unknown>): PlaneSyncLog {
  return {
    id: row.id as string,
    direction: row.direction as PlaneSyncDirection,
    record_id: (row.record_id as string) ?? null,
    record_code: (row.record_code as string) ?? null,
    plane_project_id: (row.plane_project_id as string) ?? null,
    event: row.event as string,
    status: row.status as PlaneSyncStatus,
    detail: (row.detail as string) ?? null,
    created_at: row.created_at as string,
  };
}

// ---------- Áreas ----------

export function listAreas({ onlyActive = false }: { onlyActive?: boolean } = {}): Area[] {
  const sql = onlyActive
    ? "SELECT * FROM areas WHERE active = 1 ORDER BY sort_order ASC"
    : "SELECT * FROM areas ORDER BY sort_order ASC";
  return db.prepare(sql).all().map(rowToArea);
}

export function createArea(name: string): Area {
  const id = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const maxOrder = db.prepare("SELECT MAX(sort_order) as maxOrder FROM areas").get() as
    | { maxOrder: number | null }
    | undefined;
  const sortOrder = (maxOrder?.maxOrder ?? 0) + 1;
  db.prepare("INSERT INTO areas (id, name, active, sort_order) VALUES (?, ?, 1, ?)").run(id, name, sortOrder);
  return { id, name, active: true, sort_order: sortOrder };
}

export function toggleAreaActive(id: string): void {
  db.prepare("UPDATE areas SET active = CASE active WHEN 1 THEN 0 ELSE 1 END WHERE id = ?").run(id);
}

// ---------- Tipos de registro ----------

export function listRecordTypes({ onlyActive = false }: { onlyActive?: boolean } = {}): RecordType[] {
  const sql = onlyActive
    ? "SELECT * FROM record_types WHERE active = 1 ORDER BY sort_order ASC"
    : "SELECT * FROM record_types ORDER BY sort_order ASC";
  return db.prepare(sql).all().map(rowToType);
}

export function getRecordTypeByCode(code: string): RecordType | undefined {
  const row = db.prepare("SELECT * FROM record_types WHERE code = ?").get(code);
  return row ? rowToType(row) : undefined;
}

export function createRecordType(input: { code: string; name: string; description: string; color: string }): RecordType {
  const id = input.code.toLowerCase();
  const maxOrder = db.prepare("SELECT MAX(sort_order) as maxOrder FROM record_types").get() as
    | { maxOrder: number | null }
    | undefined;
  const sortOrder = (maxOrder?.maxOrder ?? 0) + 1;
  db.prepare(
    "INSERT INTO record_types (id, code, name, description, color, active, sort_order) VALUES (?, ?, ?, ?, ?, 1, ?)",
  ).run(id, input.code.toUpperCase(), input.name, input.description, input.color, sortOrder);
  return {
    id,
    code: input.code.toUpperCase(),
    name: input.name,
    description: input.description,
    color: input.color,
    active: true,
    sort_order: sortOrder,
  };
}

export function toggleRecordTypeActive(id: string): void {
  db.prepare("UPDATE record_types SET active = CASE active WHEN 1 THEN 0 ELSE 1 END WHERE id = ?").run(id);
}

// ---------- Código SGC automático ----------

export function generateSgcCode(typeCode: string): string {
  const year = new Date().getFullYear();
  const row = db.prepare("SELECT count FROM code_counters WHERE type_code = ? AND year = ?").get(typeCode, year) as
    | { count: number }
    | undefined;
  const next = (row?.count ?? 0) + 1;
  db.prepare(
    `INSERT INTO code_counters (type_code, year, count) VALUES (?, ?, ?)
     ON CONFLICT(type_code, year) DO UPDATE SET count = excluded.count`,
  ).run(typeCode, year, next);
  return `${typeCode}-${year}-${String(next).padStart(3, "0")}`;
}

// ---------- Registros ----------

export type CreateRecordInput = {
  typeCode: string;
  title: string;
  description: string;
  areaId: string | null;
  processName: string | null;
  reporterName: string;
  eventDate: string | null;
  impact: string | null;
  priority: "Baja" | "Media" | "Alta";
  urgent: boolean;
  evidenceNote: string | null;
  comments: string | null;
};

export function createRecord(input: CreateRecordInput): SgcRecord {
  const type = getRecordTypeByCode(input.typeCode);
  if (!type) throw new Error(`Tipo de registro desconocido: ${input.typeCode}`);

  const code = generateSgcCode(type.code);
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO records (
      id, code, type_id, title, description, area_id, process_name, reporter_name,
      event_date, impact, priority, urgent, evidence_note, comments, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Recibido', ?, ?)`,
  ).run(
    id,
    code,
    type.id,
    input.title,
    input.description,
    input.areaId,
    input.processName,
    input.reporterName,
    input.eventDate,
    input.impact,
    input.priority,
    input.urgent ? 1 : 0,
    input.evidenceNote,
    input.comments,
    now,
    now,
  );

  addActivityLog(id, "Reporte creado", `${input.reporterName} creó el registro ${code}.`);

  return getRecordByCode(code)!;
}

export function listRecords(): SgcRecord[] {
  return db.prepare("SELECT * FROM records ORDER BY created_at DESC").all().map(rowToRecord);
}

export function getRecordByCode(code: string): SgcRecord | undefined {
  const row = db.prepare("SELECT * FROM records WHERE code = ?").get(code);
  return row ? rowToRecord(row) : undefined;
}

export function getRecordById(id: string): SgcRecord | undefined {
  const row = db.prepare("SELECT * FROM records WHERE id = ?").get(id);
  return row ? rowToRecord(row) : undefined;
}

export function countRecords(): number {
  const row = db.prepare("SELECT COUNT(*) as count FROM records").get() as { count: number } | undefined;
  return row?.count ?? 0;
}

/** Registros que ya tienen un work item de Plane asociado — para refrescar su estado. */
export function listRecordsWithPlaneTicket(): SgcRecord[] {
  return db
    .prepare("SELECT * FROM records WHERE plane_work_item_id IS NOT NULL ORDER BY updated_at ASC")
    .all()
    .map(rowToRecord);
}

// ---------- Historial / trazabilidad ----------

export function addActivityLog(recordId: string, event: string, detail?: string | null): void {
  db.prepare("INSERT INTO activity_log (id, record_id, event, detail, created_at) VALUES (?, ?, ?, ?, ?)").run(
    randomUUID(),
    recordId,
    event,
    detail ?? null,
    new Date().toISOString(),
  );
}

export function listActivityLog(recordId: string): ActivityLogEntry[] {
  return db
    .prepare("SELECT * FROM activity_log WHERE record_id = ? ORDER BY created_at ASC")
    .all(recordId)
    .map((row) => ({
      id: row.id as string,
      record_id: row.record_id as string,
      event: row.event as string,
      detail: (row.detail as string) ?? null,
      created_at: row.created_at as string,
    }));
}

// ---------- Plane: mapeo de proyectos por área ----------

export function listPlaneProjectMappings(): PlaneProjectMapping[] {
  return db.prepare("SELECT * FROM plane_project_mappings ORDER BY created_at ASC").all().map(rowToPlaneProjectMapping);
}

export function getPlaneProjectMappingByArea(areaId: string): PlaneProjectMapping | undefined {
  const row = db.prepare("SELECT * FROM plane_project_mappings WHERE area_id = ?").get(areaId);
  return row ? rowToPlaneProjectMapping(row) : undefined;
}

/**
 * Alta o edición del mapeo área↔proyecto de Plane. `planeProjectId` tiene que
 * ser el UUID real del proyecto en la instancia de Plane del usuario — esta
 * función no lo valida contra Plane (eso lo hace `lib/plane/client.ts` con
 * "Probar conexión"), solo lo guarda.
 */
export function upsertPlaneProjectMapping(input: {
  areaId: string;
  planeProjectId: string;
  planeProjectName?: string | null;
}): PlaneProjectMapping {
  const existing = getPlaneProjectMappingByArea(input.areaId);
  const now = new Date().toISOString();

  if (existing) {
    db.prepare(
      "UPDATE plane_project_mappings SET plane_project_id = ?, plane_project_name = ?, active = 1, updated_at = ? WHERE id = ?",
    ).run(input.planeProjectId, input.planeProjectName ?? null, now, existing.id);
    return { ...existing, plane_project_id: input.planeProjectId, plane_project_name: input.planeProjectName ?? null, active: true, updated_at: now };
  }

  const id = randomUUID();
  db.prepare(
    "INSERT INTO plane_project_mappings (id, area_id, plane_project_id, plane_project_name, active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)",
  ).run(id, input.areaId, input.planeProjectId, input.planeProjectName ?? null, now, now);
  return {
    id,
    area_id: input.areaId,
    plane_project_id: input.planeProjectId,
    plane_project_name: input.planeProjectName ?? null,
    active: true,
    created_at: now,
    updated_at: now,
  };
}

export function togglePlaneProjectMappingActive(id: string): void {
  db.prepare(
    "UPDATE plane_project_mappings SET active = CASE active WHEN 1 THEN 0 ELSE 1 END, updated_at = ? WHERE id = ?",
  ).run(new Date().toISOString(), id);
}

export function deletePlaneProjectMapping(id: string): void {
  db.prepare("DELETE FROM plane_project_mappings WHERE id = ?").run(id);
}

// ---------- Plane: relación con el registro y log de sincronización ----------

export function updateRecordPlaneInfo(
  recordId: string,
  info: {
    planeProjectId: string | null;
    planeWorkItemId: string | null;
    planeSequenceId: string | null;
    planeStatus: string | null;
    planeUrl: string | null;
  },
): void {
  db.prepare(
    `UPDATE records SET
      plane_project_id = ?, plane_work_item_id = ?, plane_sequence_id = ?,
      plane_status = ?, plane_url = ?, plane_synced_at = ?, updated_at = ?
     WHERE id = ?`,
  ).run(
    info.planeProjectId,
    info.planeWorkItemId,
    info.planeSequenceId,
    info.planeStatus,
    info.planeUrl,
    new Date().toISOString(),
    new Date().toISOString(),
    recordId,
  );
}

export function updateRecordPlaneStatus(recordId: string, planeStatus: string | null): void {
  const now = new Date().toISOString();
  db.prepare("UPDATE records SET plane_status = ?, plane_synced_at = ?, updated_at = ? WHERE id = ?").run(
    planeStatus,
    now,
    now,
    recordId,
  );
}

export function addPlaneSyncLog(entry: {
  direction: PlaneSyncDirection;
  recordId?: string | null;
  recordCode?: string | null;
  planeProjectId?: string | null;
  event: string;
  status: PlaneSyncStatus;
  detail?: string | null;
}): void {
  db.prepare(
    `INSERT INTO plane_sync_logs (id, direction, record_id, record_code, plane_project_id, event, status, detail, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    randomUUID(),
    entry.direction,
    entry.recordId ?? null,
    entry.recordCode ?? null,
    entry.planeProjectId ?? null,
    entry.event,
    entry.status,
    entry.detail ?? null,
    new Date().toISOString(),
  );
}

export function listPlaneSyncLogs(limit = 50): PlaneSyncLog[] {
  return db
    .prepare("SELECT * FROM plane_sync_logs ORDER BY created_at DESC LIMIT ?")
    .all(limit)
    .map(rowToPlaneSyncLog);
}

// ---------- Fase 6: tipificación de tickets de Plane ----------

/** El registro (si existe) ya vinculado a este work item de Plane. */
export function getRecordByPlaneWorkItemId(planeWorkItemId: string): SgcRecord | undefined {
  const row = db.prepare("SELECT * FROM records WHERE plane_work_item_id = ?").get(planeWorkItemId);
  return row ? rowToRecord(row) : undefined;
}

export function getPlaneTicketDismissal(planeWorkItemId: string): PlaneTicketDismissal | undefined {
  const row = db.prepare("SELECT * FROM plane_ticket_dismissals WHERE plane_work_item_id = ?").get(planeWorkItemId);
  return row ? rowToPlaneTicketDismissal(row) : undefined;
}

export function listPlaneTicketDismissals(): PlaneTicketDismissal[] {
  return db
    .prepare("SELECT * FROM plane_ticket_dismissals ORDER BY created_at DESC")
    .all()
    .map(rowToPlaneTicketDismissal);
}

/**
 * Marca un ticket de Plane como "no aplica al SGC". No borra nada de Plane ni
 * crea un registro — solo evita que la pantalla lo vuelva a mostrar como
 * pendiente de tipificar. Se puede revertir con `undoPlaneTicketDismissal`.
 */
export function dismissPlaneTicket(input: {
  planeProjectId: string;
  planeWorkItemId: string;
  planeSequenceId?: string | null;
  reason?: string | null;
}): void {
  db.prepare(
    `INSERT INTO plane_ticket_dismissals (id, plane_project_id, plane_work_item_id, plane_sequence_id, reason, created_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(plane_work_item_id) DO UPDATE SET reason = excluded.reason, created_at = excluded.created_at`,
  ).run(
    randomUUID(),
    input.planeProjectId,
    input.planeWorkItemId,
    input.planeSequenceId ?? null,
    input.reason ?? null,
    new Date().toISOString(),
  );
  addPlaneSyncLog({
    direction: "plane_to_portal",
    planeProjectId: input.planeProjectId,
    event: "Ticket marcado como 'no aplica al SGC'",
    status: "skipped",
    detail: input.reason ? input.reason : null,
  });
}

export function undoPlaneTicketDismissal(planeWorkItemId: string): void {
  db.prepare("DELETE FROM plane_ticket_dismissals WHERE plane_work_item_id = ?").run(planeWorkItemId);
}

/**
 * "Tipificar" un ticket de Plane: crea un registro SGC nuevo (con su código
 * automático, igual que un reporte del portal) ya vinculado a ese work item
 * — no pasa por `syncRecordToPlane` porque el work item ya existe, esto va
 * en el sentido contrario (Plane → SGC).
 */
export function createRecordFromPlaneTicket(input: CreateRecordInput & {
  planeProjectId: string;
  planeWorkItemId: string;
  planeSequenceId: string | null;
  planeStatus: string | null;
  planeUrl: string | null;
}): SgcRecord {
  const record = createRecord(input);
  updateRecordPlaneInfo(record.id, {
    planeProjectId: input.planeProjectId,
    planeWorkItemId: input.planeWorkItemId,
    planeSequenceId: input.planeSequenceId,
    planeStatus: input.planeStatus,
    planeUrl: input.planeUrl,
  });
  addActivityLog(
    record.id,
    "Tipificado desde un ticket de Plane",
    `Ticket #${input.planeSequenceId ?? input.planeWorkItemId} clasificado como ${input.typeCode} desde Gestión de Calidad → Tickets Plane.`,
  );
  addPlaneSyncLog({
    direction: "plane_to_portal",
    recordId: record.id,
    recordCode: record.code,
    planeProjectId: input.planeProjectId,
    event: "Ticket tipificado",
    status: "success",
    detail: `Ticket #${input.planeSequenceId ?? input.planeWorkItemId} → ${record.code}`,
  });
  return getRecordByCode(record.code)!;
}

/** "Vincular" un ticket de Plane a un registro SGC ya existente (por código). */
export function linkRecordToPlaneTicket(
  recordCode: string,
  info: {
    planeProjectId: string;
    planeWorkItemId: string;
    planeSequenceId: string | null;
    planeStatus: string | null;
    planeUrl: string | null;
  },
): SgcRecord {
  const record = getRecordByCode(recordCode.trim().toUpperCase());
  if (!record) throw new Error(`No existe ningún registro con el código "${recordCode}".`);

  updateRecordPlaneInfo(record.id, info);
  addActivityLog(
    record.id,
    "Vinculado a un ticket de Plane",
    `Vinculado manualmente al ticket #${info.planeSequenceId ?? info.planeWorkItemId} desde Gestión de Calidad → Tickets Plane.`,
  );
  addPlaneSyncLog({
    direction: "plane_to_portal",
    recordId: record.id,
    recordCode: record.code,
    planeProjectId: info.planeProjectId,
    event: "Ticket vinculado a registro existente",
    status: "success",
    detail: `Ticket #${info.planeSequenceId ?? info.planeWorkItemId} → ${record.code}`,
  });
  return getRecordByCode(record.code)!;
}

// ---------- Fase 7: gestión completa (análisis de causa, corrección,
// Acciones Correctivas, verificación de eficacia, relaciones, evidencias) ----------

/**
 * Guarda la corrección inmediata y el análisis de causa raíz de un registro
 * (pensado sobre todo para NC, pero no se restringe por tipo — cualquier
 * registro puede tener un análisis). Si el registro seguía en su estado
 * inicial ("Recibido"), lo mueve a "En análisis" para reflejar que ya se
 * empezó a trabajar — no pisa un estado más avanzado que ya haya elegido
 * Calidad a mano.
 */
export function updateRecordAnalysis(
  recordId: string,
  input: {
    rootCauseMethod: string | null;
    rootCauseAnalysis: string | null;
    rootCause: string | null;
    correctionAction: string | null;
    correctionResponsible: string | null;
    correctionDate: string | null;
  },
): SgcRecord {
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE records SET
      root_cause_method = ?, root_cause_analysis = ?, root_cause = ?,
      correction_action = ?, correction_responsible = ?, correction_date = ?,
      status = CASE WHEN status = 'Recibido' THEN 'En análisis' ELSE status END,
      updated_at = ?
     WHERE id = ?`,
  ).run(
    input.rootCauseMethod,
    input.rootCauseAnalysis,
    input.rootCause,
    input.correctionAction,
    input.correctionResponsible,
    input.correctionDate,
    now,
    recordId,
  );
  addActivityLog(
    recordId,
    "Análisis de causa y corrección actualizados",
    input.rootCause ? `Causa raíz identificada: ${input.rootCause}` : "Se guardó el análisis (sin causa raíz definida todavía).",
  );
  return getRecordById(recordId)!;
}

/**
 * Guarda la verificación de eficacia de una Acción Correctiva (fecha
 * prevista, responsable, resultado, evidencia y si fue eficaz o no). No
 * cierra el registro por sí sola — el cierre es un paso explícito aparte
 * (`updateRecordStatus`) que además queda bloqueado si esto no se completó
 * con resultado "eficaz".
 */
export function updateRecordEffectiveness(
  recordId: string,
  input: {
    dueDate: string | null;
    responsible: string | null;
    result: string | null;
    evidence: string | null;
    effective: boolean | null;
  },
): SgcRecord {
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE records SET
      effectiveness_due_date = ?, effectiveness_responsible = ?, effectiveness_result = ?,
      effectiveness_evidence = ?, effective = ?, updated_at = ?
     WHERE id = ?`,
  ).run(
    input.dueDate,
    input.responsible,
    input.result,
    input.evidence,
    input.effective === null ? null : input.effective ? 1 : 0,
    now,
    recordId,
  );
  addActivityLog(
    recordId,
    "Verificación de eficacia registrada",
    input.effective === null ? (input.result ?? undefined) : input.effective ? "Resultado: eficaz." : "Resultado: no eficaz.",
  );
  return getRecordById(recordId)!;
}

// Estados considerados "cierre definitivo" — sujetos a la validación de
// eficacia para Acciones Correctivas.
const CLOSING_STATUSES = new Set(["Cerrada", "Cerrado"]);

/**
 * Sugerencia de próximos estados por tipo, para que la pantalla ofrezca solo
 * transiciones razonables (el usuario igual puede elegir cualquier estado
 * activo desde Configuración → Tipos si hiciera falta un caso no previsto
 * acá — esto es una ayuda de UI, no una restricción dura salvo el cierre).
 */
export const AC_STATUS_FLOW = [
  "Pendiente",
  "En curso",
  "Implementada",
  "Pendiente de verificación",
  "Eficaz",
  "No eficaz",
  "Cerrada",
] as const;

export const GENERIC_STATUS_FLOW = ["Recibido", "En análisis", "En curso", "Resuelto", "Cerrado", "Rechazado"] as const;

/**
 * Cambia el estado de un registro. Para Acciones Correctivas (tipo "AC"),
 * bloquea el pase a un estado de cierre si todavía no se registró una
 * verificación de eficacia con resultado "eficaz" — refleja la regla de la
 * spec: "No se permite cierre definitivo si corresponde verificación de
 * eficacia y no está hecha".
 */
export function updateRecordStatus(recordId: string, newStatus: string): SgcRecord {
  const record = getRecordById(recordId);
  if (!record) throw new Error("Registro no encontrado.");
  const type = listRecordTypes().find((t) => t.id === record.type_id);

  if (type?.code === "AC" && CLOSING_STATUSES.has(newStatus) && record.effective !== true) {
    throw new Error(
      "No se puede cerrar esta Acción Correctiva: falta registrar la verificación de eficacia con resultado \"Eficaz\".",
    );
  }

  const now = new Date().toISOString();
  const closedAt = CLOSING_STATUSES.has(newStatus) ? now : record.closed_at;
  db.prepare("UPDATE records SET status = ?, closed_at = ?, updated_at = ? WHERE id = ?").run(
    newStatus,
    closedAt,
    now,
    recordId,
  );
  addActivityLog(recordId, "Cambio de estado", `${record.status} → ${newStatus}`);
  return getRecordById(recordId)!;
}

/** Fecha de vencimiento/compromiso genérica — quedó señalada como pendiente desde la Fase 3. */
export function updateRecordDueDate(recordId: string, dueDate: string | null): SgcRecord {
  db.prepare("UPDATE records SET due_date = ?, updated_at = ? WHERE id = ?").run(
    dueDate,
    new Date().toISOString(),
    recordId,
  );
  addActivityLog(recordId, "Vencimiento actualizado", dueDate ? `Nueva fecha de vencimiento: ${dueDate}.` : "Se quitó la fecha de vencimiento.");
  return getRecordById(recordId)!;
}

// ---------- Fase 7: relaciones entre registros ----------

export function createRelationship(fromRecordId: string, toRecordId: string, label?: string | null): void {
  db.prepare(
    "INSERT INTO sgc_relationships (id, from_record_id, to_record_id, label, created_at) VALUES (?, ?, ?, ?, ?)",
  ).run(randomUUID(), fromRecordId, toRecordId, label ?? null, new Date().toISOString());
}

/** Todos los vínculos de un registro, en cualquier dirección, con el "otro lado" ya resuelto. */
export function listRelationshipsForRecord(recordId: string): RecordRelationship[] {
  const asFrom = db
    .prepare("SELECT * FROM sgc_relationships WHERE from_record_id = ? ORDER BY created_at ASC")
    .all(recordId) as Record<string, unknown>[];
  const asTo = db
    .prepare("SELECT * FROM sgc_relationships WHERE to_record_id = ? ORDER BY created_at ASC")
    .all(recordId) as Record<string, unknown>[];

  const results: RecordRelationship[] = [];
  for (const row of asFrom) {
    const other = getRecordById(row.to_record_id as string);
    if (!other) continue;
    results.push({
      id: row.id as string,
      from_record_id: row.from_record_id as string,
      to_record_id: row.to_record_id as string,
      label: (row.label as string) ?? null,
      created_at: row.created_at as string,
      other,
      direction: "from",
    });
  }
  for (const row of asTo) {
    const other = getRecordById(row.from_record_id as string);
    if (!other) continue;
    results.push({
      id: row.id as string,
      from_record_id: row.from_record_id as string,
      to_record_id: row.to_record_id as string,
      label: (row.label as string) ?? null,
      created_at: row.created_at as string,
      other,
      direction: "to",
    });
  }
  return results.sort((a, b) => a.created_at.localeCompare(b.created_at));
}

/**
 * Vincula dos registros existentes por código (en cualquier sentido — no
 * solo NC→AC; sirve por ejemplo también para Q→NC o R→AC más adelante).
 * Registra el vínculo una sola vez (de "from" a "to") pero queda visible
 * desde ambos registros vía `listRelationshipsForRecord`.
 */
export function linkExistingRecordRelationship(
  fromCode: string,
  toCode: string,
  label?: string | null,
): { from: SgcRecord; to: SgcRecord } {
  const from = getRecordByCode(fromCode.trim().toUpperCase());
  const to = getRecordByCode(toCode.trim().toUpperCase());
  if (!from) throw new Error(`No existe ningún registro con el código "${fromCode}".`);
  if (!to) throw new Error(`No existe ningún registro con el código "${toCode}".`);
  if (from.id === to.id) throw new Error("Un registro no puede vincularse a sí mismo.");

  createRelationship(from.id, to.id, label ?? null);
  addActivityLog(from.id, "Vinculado a otro registro", `Vinculado a ${to.code}${label ? ` (${label})` : ""}.`);
  addActivityLog(to.id, "Vinculado a otro registro", `Vinculado a ${from.code}${label ? ` (${label})` : ""}.`);
  return { from, to };
}

/**
 * Crea una Acción Correctiva nueva a partir de una No Conformidad (u otro
 * registro) y la vincula automáticamente. Hereda área y proceso del origen
 * para no hacer recargar esos datos a quien la crea.
 */
export function createCorrectiveActionForRecord(
  source: SgcRecord,
  input: {
    title: string;
    description: string;
    responsible: string;
    dueDate: string | null;
    priority: "Baja" | "Media" | "Alta";
  },
): SgcRecord {
  const ac = createRecord({
    typeCode: "AC",
    title: input.title,
    description: input.description,
    areaId: source.area_id,
    processName: source.process_name,
    reporterName: input.responsible,
    eventDate: null,
    impact: null,
    priority: input.priority,
    urgent: false,
    evidenceNote: null,
    comments: `Acción Correctiva generada desde ${source.code}.`,
  });

  if (input.dueDate) {
    db.prepare("UPDATE records SET due_date = ?, updated_at = ? WHERE id = ?").run(
      input.dueDate,
      new Date().toISOString(),
      ac.id,
    );
  }

  createRelationship(source.id, ac.id, `Acción Correctiva de ${source.code}`);
  addActivityLog(source.id, "Acción Correctiva creada", `Se creó ${ac.code} como Acción Correctiva de este registro.`);
  addActivityLog(ac.id, "Creada desde una No Conformidad", `Creada como Acción Correctiva de ${source.code}.`);

  return getRecordById(ac.id)!;
}

// ---------- Fase 7: evidencias ----------

function rowToEvidence(row: Record<string, unknown>): RecordEvidence {
  return {
    id: row.id as string,
    record_id: row.record_id as string,
    description: row.description as string,
    link: (row.link as string) ?? null,
    created_by: (row.created_by as string) ?? null,
    created_at: row.created_at as string,
  };
}

export function addEvidence(
  recordId: string,
  input: { description: string; link?: string | null; createdBy?: string | null },
): void {
  db.prepare(
    "INSERT INTO sgc_evidence (id, record_id, description, link, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  ).run(randomUUID(), recordId, input.description, input.link ?? null, input.createdBy ?? null, new Date().toISOString());
  addActivityLog(recordId, "Evidencia agregada", input.description);
}

export function listEvidence(recordId: string): RecordEvidence[] {
  return db
    .prepare("SELECT * FROM sgc_evidence WHERE record_id = ? ORDER BY created_at ASC")
    .all(recordId)
    .map(rowToEvidence);
}

// ---------- Fase 8: Riesgos y Oportunidades ----------
//
// A diferencia de NC/AC/AP/OM/Q/S/R (que viven en "records"), Riesgos y
// Oportunidades son una entidad propia ("sgc_risks"). "kind" las distingue.
// La matriz de valoración es probabilidad (1-3) × impacto (1-5) = score
// (1-15); los umbrales de la matriz quedan hardcodeados acá (no editables
// desde Configuración todavía — recorte deliberado de esta fase, documentado
// en claude/progreso-implementacion.md).

export type SgcRisk = {
  id: string;
  code: string;
  kind: RiskKind;
  source: string | null;
  area_id: string | null;
  process_name: string | null;
  activity: string | null;
  description: string;
  detail: string | null;
  existing_control: string | null;
  probability_initial: number | null;
  impact_initial: number | null;
  treatment_plan: string | null;
  responsible: string | null;
  due_date: string | null;
  status: string;
  verification: string | null;
  probability_residual: number | null;
  impact_residual: number | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
};

export type RiskControl = {
  id: string;
  risk_id: string;
  description: string;
  responsible: string | null;
  effectiveness: string | null;
  created_at: string;
};

// El registro SGC ya resuelto, visto desde el riesgo (listRiskRelationshipsForRisk).
export type RiskRecordLink = {
  id: string;
  risk_id: string;
  record_id: string;
  label: string | null;
  created_at: string;
  record: SgcRecord;
};

// El riesgo ya resuelto, visto desde el registro (listRiskRelationshipsForRecord).
export type RecordRiskLink = {
  id: string;
  risk_id: string;
  record_id: string;
  label: string | null;
  created_at: string;
  risk: SgcRisk;
};

function rowToRisk(row: Record<string, unknown>): SgcRisk {
  return {
    id: row.id as string,
    code: row.code as string,
    kind: row.kind as RiskKind,
    source: (row.source as string) ?? null,
    area_id: (row.area_id as string) ?? null,
    process_name: (row.process_name as string) ?? null,
    activity: (row.activity as string) ?? null,
    description: row.description as string,
    detail: (row.detail as string) ?? null,
    existing_control: (row.existing_control as string) ?? null,
    probability_initial: (row.probability_initial as number) ?? null,
    impact_initial: (row.impact_initial as number) ?? null,
    treatment_plan: (row.treatment_plan as string) ?? null,
    responsible: (row.responsible as string) ?? null,
    due_date: (row.due_date as string) ?? null,
    status: row.status as string,
    verification: (row.verification as string) ?? null,
    probability_residual: (row.probability_residual as number) ?? null,
    impact_residual: (row.impact_residual as number) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    closed_at: (row.closed_at as string) ?? null,
  };
}

function rowToRiskControl(row: Record<string, unknown>): RiskControl {
  return {
    id: row.id as string,
    risk_id: row.risk_id as string,
    description: row.description as string,
    responsible: (row.responsible as string) ?? null,
    effectiveness: (row.effectiveness as string) ?? null,
    created_at: row.created_at as string,
  };
}

export const RISK_STATUS_FLOW = [
  "Identificado",
  "En tratamiento",
  "En seguimiento",
  "Mitigado",
  "Materializado",
  "Cerrado",
] as const;

export const OPPORTUNITY_STATUS_FLOW = [
  "Identificada",
  "En evaluación",
  "En curso",
  "Aprovechada",
  "Descartada",
  "Cerrada",
] as const;

const RISK_CLOSING_STATUSES = new Set(["Cerrado", "Cerrada", "Mitigado", "Aprovechada"]);

export type CreateRiskInput = {
  kind: RiskKind;
  source: string | null;
  areaId: string | null;
  processName: string | null;
  activity: string | null;
  description: string;
  detail: string | null;
  existingControl: string | null;
  probabilityInitial: number | null;
  impactInitial: number | null;
  treatmentPlan: string | null;
  responsible: string | null;
  dueDate: string | null;
};

export function createRisk(input: CreateRiskInput): SgcRisk {
  const code = generateSgcCode("RISK");
  const id = randomUUID();
  const now = new Date().toISOString();
  const initialStatus = input.kind === "oportunidad" ? "Identificada" : "Identificado";

  db.prepare(
    `INSERT INTO sgc_risks (
      id, code, kind, source, area_id, process_name, activity, description, detail,
      existing_control, probability_initial, impact_initial, treatment_plan, responsible,
      due_date, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    code,
    input.kind,
    input.source,
    input.areaId,
    input.processName,
    input.activity,
    input.description,
    input.detail,
    input.existingControl,
    input.probabilityInitial,
    input.impactInitial,
    input.treatmentPlan,
    input.responsible,
    input.dueDate,
    initialStatus,
    now,
    now,
  );

  addActivityLog(id, `${input.kind === "oportunidad" ? "Oportunidad" : "Riesgo"} identificado`, `Se creó ${code}.`);

  return getRiskByCode(code)!;
}

export function listRisks(filter: { kind?: RiskKind } = {}): SgcRisk[] {
  const sql = filter.kind
    ? "SELECT * FROM sgc_risks WHERE kind = ? ORDER BY created_at DESC"
    : "SELECT * FROM sgc_risks ORDER BY created_at DESC";
  return (filter.kind ? db.prepare(sql).all(filter.kind) : db.prepare(sql).all()).map(rowToRisk);
}

export function getRiskByCode(code: string): SgcRisk | undefined {
  const row = db.prepare("SELECT * FROM sgc_risks WHERE code = ?").get(code);
  return row ? rowToRisk(row) : undefined;
}

export function getRiskById(id: string): SgcRisk | undefined {
  const row = db.prepare("SELECT * FROM sgc_risks WHERE id = ?").get(id);
  return row ? rowToRisk(row) : undefined;
}

/**
 * Guarda identificación + valoración inicial + tratamiento en un solo form
 * (mismo criterio de "un form por tab" que `updateRecordAnalysis` en la Fase 7).
 */
export function updateRiskTreatment(
  riskId: string,
  input: {
    source: string | null;
    areaId: string | null;
    processName: string | null;
    activity: string | null;
    description: string;
    detail: string | null;
    existingControl: string | null;
    probabilityInitial: number | null;
    impactInitial: number | null;
    treatmentPlan: string | null;
    responsible: string | null;
    dueDate: string | null;
  },
): SgcRisk {
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE sgc_risks SET
      source = ?, area_id = ?, process_name = ?, activity = ?, description = ?, detail = ?,
      existing_control = ?, probability_initial = ?, impact_initial = ?, treatment_plan = ?,
      responsible = ?, due_date = ?, updated_at = ?
     WHERE id = ?`,
  ).run(
    input.source,
    input.areaId,
    input.processName,
    input.activity,
    input.description,
    input.detail,
    input.existingControl,
    input.probabilityInitial,
    input.impactInitial,
    input.treatmentPlan,
    input.responsible,
    input.dueDate,
    now,
    riskId,
  );
  addActivityLog(riskId, "Identificación y tratamiento actualizados", input.treatmentPlan ?? undefined);
  return getRiskById(riskId)!;
}

export function createRiskControl(
  riskId: string,
  input: { description: string; responsible: string | null; effectiveness: string | null },
): void {
  db.prepare(
    "INSERT INTO sgc_risk_controls (id, risk_id, description, responsible, effectiveness, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  ).run(randomUUID(), riskId, input.description, input.responsible, input.effectiveness, new Date().toISOString());
  addActivityLog(riskId, "Control agregado", input.description);
}

export function listRiskControls(riskId: string): RiskControl[] {
  return db
    .prepare("SELECT * FROM sgc_risk_controls WHERE risk_id = ? ORDER BY created_at ASC")
    .all(riskId)
    .map(rowToRiskControl);
}

export function updateRiskResidual(
  riskId: string,
  input: { probabilityResidual: number | null; impactResidual: number | null; verification: string | null },
): SgcRisk {
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE sgc_risks SET probability_residual = ?, impact_residual = ?, verification = ?, updated_at = ? WHERE id = ?`,
  ).run(input.probabilityResidual, input.impactResidual, input.verification, now, riskId);
  addActivityLog(riskId, "Valoración residual registrada", input.verification ?? undefined);
  return getRiskById(riskId)!;
}

/**
 * Cambia el estado de un riesgo/oportunidad. Bloquea el pase a un estado de
 * cierre si todavía no hay valoración residual ni verificación registrada —
 * mismo criterio que el bloqueo de cierre de AC en la Fase 7
 * (`updateRecordStatus`): no se puede demostrar que el tratamiento funcionó
 * sin haber vuelto a valorar el riesgo.
 */
export function updateRiskStatus(riskId: string, newStatus: string): SgcRisk {
  const risk = getRiskById(riskId);
  if (!risk) throw new Error("Riesgo no encontrado.");

  const hasResidual = risk.probability_residual !== null || risk.impact_residual !== null;
  const hasVerification = Boolean(risk.verification && risk.verification.trim());
  if (RISK_CLOSING_STATUSES.has(newStatus) && !hasResidual && !hasVerification) {
    throw new Error(
      `No se puede pasar a "${newStatus}": falta registrar la verificación y la valoración residual.`,
    );
  }

  const now = new Date().toISOString();
  const closedAt = RISK_CLOSING_STATUSES.has(newStatus) ? now : risk.closed_at;
  db.prepare("UPDATE sgc_risks SET status = ?, closed_at = ?, updated_at = ? WHERE id = ?").run(
    newStatus,
    closedAt,
    now,
    riskId,
  );
  addActivityLog(riskId, "Cambio de estado", `${risk.status} → ${newStatus}`);
  return getRiskById(riskId)!;
}

export function createRiskRelationship(riskId: string, recordCode: string, label?: string | null): RiskRecordLink {
  const record = getRecordByCode(recordCode.trim().toUpperCase());
  if (!record) throw new Error(`No existe ningún registro con el código "${recordCode}".`);

  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    "INSERT INTO sgc_risk_relationships (id, risk_id, record_id, label, created_at) VALUES (?, ?, ?, ?, ?)",
  ).run(id, riskId, record.id, label ?? null, now);

  const risk = getRiskById(riskId);
  addActivityLog(riskId, "Vinculado a un registro SGC", `Vinculado a ${record.code}${label ? ` (${label})` : ""}.`);
  addActivityLog(
    record.id,
    "Vinculado a un riesgo/oportunidad",
    `Vinculado a ${risk?.code ?? riskId}${label ? ` (${label})` : ""}.`,
  );

  return { id, risk_id: riskId, record_id: record.id, label: label ?? null, created_at: now, record };
}

export function listRiskRelationshipsForRisk(riskId: string): RiskRecordLink[] {
  const rows = db
    .prepare("SELECT * FROM sgc_risk_relationships WHERE risk_id = ? ORDER BY created_at ASC")
    .all(riskId) as Record<string, unknown>[];
  const results: RiskRecordLink[] = [];
  for (const row of rows) {
    const record = getRecordById(row.record_id as string);
    if (!record) continue;
    results.push({
      id: row.id as string,
      risk_id: row.risk_id as string,
      record_id: row.record_id as string,
      label: (row.label as string) ?? null,
      created_at: row.created_at as string,
      record,
    });
  }
  return results;
}

/** Riesgos/oportunidades vinculados a un registro SGC — para mostrar en su tab de Relaciones. */
export function listRiskRelationshipsForRecord(recordId: string): RecordRiskLink[] {
  const rows = db
    .prepare("SELECT * FROM sgc_risk_relationships WHERE record_id = ? ORDER BY created_at ASC")
    .all(recordId) as Record<string, unknown>[];
  const results: RecordRiskLink[] = [];
  for (const row of rows) {
    const risk = getRiskById(row.risk_id as string);
    if (!risk) continue;
    results.push({
      id: row.id as string,
      risk_id: row.risk_id as string,
      record_id: row.record_id as string,
      label: (row.label as string) ?? null,
      created_at: row.created_at as string,
      risk,
    });
  }
  return results;
}
