/**
 * Puente entre un registro SGC recién creado y Plane (Fase 4).
 *
 * Regla central: esto NUNCA debe romper la creación de un reporte. Si Plane
 * no está configurado, si el área no tiene proyecto mapeado, o si la llamada
 * a Plane falla, el registro queda creado igual en el portal (como en la
 * Fase 3) y la situación queda documentada en el historial del registro y en
 * el log de sincronización — no se lanza la excepción hacia quien reporta.
 */
import {
  addActivityLog,
  addPlaneSyncLog,
  getPlaneProjectMappingByArea,
  listRecordsWithPlaneTicket,
  updateRecordPlaneInfo,
  updateRecordPlaneStatus,
  type RecordType,
  type SgcRecord,
} from "@/lib/db/queries";
import {
  createWorkItem,
  getWorkItem,
  getWorkItemUrl,
  isPlaneConfigured,
  mapPortalPriorityToPlane,
  resolveWorkItemStatus,
  PlaneApiError,
} from "@/lib/plane/client";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildDescriptionHtml(record: SgcRecord): string {
  const parts = [`<p>${escapeHtml(record.description)}</p>`];
  if (record.impact) parts.push(`<p><strong>Impacto:</strong> ${escapeHtml(record.impact)}</p>`);
  if (record.process_name) parts.push(`<p><strong>Proceso:</strong> ${escapeHtml(record.process_name)}</p>`);
  if (record.event_date) parts.push(`<p><strong>Fecha del hecho:</strong> ${escapeHtml(record.event_date)}</p>`);
  parts.push(`<p><strong>Reportado por:</strong> ${escapeHtml(record.reporter_name)}</p>`);
  if (record.comments) parts.push(`<p><strong>Comentarios:</strong> ${escapeHtml(record.comments)}</p>`);
  parts.push(`<p><em>Origen: Portal Ágora — registro ${record.code}</em></p>`);
  return parts.join("\n");
}

/**
 * Intenta crear el work item en Plane correspondiente a un registro recién
 * creado. No devuelve nada relevante para el flujo del formulario — el
 * resultado (éxito, salteado, o error) queda en `activity_log` y en
 * `plane_sync_logs`, y el registro se actualiza en el lugar si hubo éxito.
 */
export async function syncRecordToPlane(record: SgcRecord, type: RecordType): Promise<void> {
  if (!isPlaneConfigured()) {
    addPlaneSyncLog({
      direction: "portal_to_plane",
      recordId: record.id,
      recordCode: record.code,
      event: "Creación de work item",
      status: "skipped",
      detail: "Plane no está configurado en este entorno (faltan variables de entorno).",
    });
    return;
  }

  if (!record.area_id) {
    addPlaneSyncLog({
      direction: "portal_to_plane",
      recordId: record.id,
      recordCode: record.code,
      event: "Creación de work item",
      status: "skipped",
      detail: "El registro no tiene un área asignada — no hay forma de saber a qué proyecto de Plane mandarlo.",
    });
    return;
  }

  const mapping = getPlaneProjectMappingByArea(record.area_id);
  if (!mapping || !mapping.active) {
    addPlaneSyncLog({
      direction: "portal_to_plane",
      recordId: record.id,
      recordCode: record.code,
      event: "Creación de work item",
      status: "skipped",
      detail: mapping
        ? "El área tiene un proyecto de Plane mapeado, pero el mapeo está desactivado."
        : "El área del registro todavía no tiene un proyecto de Plane mapeado (Configuración → Plane).",
    });
    return;
  }

  try {
    const workItem = await createWorkItem(mapping.plane_project_id, {
      name: `[${type.code}] ${record.title}`,
      descriptionHtml: buildDescriptionHtml(record),
      priority: mapPortalPriorityToPlane(record.priority, record.urgent),
    });

    const status = await resolveWorkItemStatus(mapping.plane_project_id, workItem).catch(() => null);
    const url = getWorkItemUrl(mapping.plane_project_id, workItem.id);

    updateRecordPlaneInfo(record.id, {
      planeProjectId: mapping.plane_project_id,
      planeWorkItemId: workItem.id,
      planeSequenceId: workItem.sequence_id != null ? String(workItem.sequence_id) : null,
      planeStatus: status?.name ?? null,
      planeUrl: url,
    });

    addActivityLog(
      record.id,
      "Ticket creado en Plane",
      `Se creó el work item ${workItem.sequence_id ?? workItem.id} en el proyecto "${mapping.plane_project_name ?? mapping.plane_project_id}".`,
    );

    addPlaneSyncLog({
      direction: "portal_to_plane",
      recordId: record.id,
      recordCode: record.code,
      planeProjectId: mapping.plane_project_id,
      event: "Creación de work item",
      status: "success",
      detail: url ?? undefined,
    });
  } catch (error) {
    const message =
      error instanceof PlaneApiError || error instanceof Error ? error.message : "Error desconocido al crear el work item en Plane.";

    addActivityLog(record.id, "No se pudo sincronizar con Plane", message);

    addPlaneSyncLog({
      direction: "portal_to_plane",
      recordId: record.id,
      recordCode: record.code,
      planeProjectId: mapping.plane_project_id,
      event: "Creación de work item",
      status: "error",
      detail: message,
    });
  }
}

/**
 * Refresca el estado (`plane_status`) de todos los registros que ya tienen un
 * work item de Plane asociado — pensado para el botón "Sincronizar ahora" de
 * Configuración → Plane. Cada registro se procesa de forma independiente: si
 * uno falla, se registra el error y se sigue con el resto.
 *
 * Nota de alcance: esto solo actualiza el *estado* de tickets que el portal ya
 * conoce (creados desde acá). Traer tickets creados directamente en Plane
 * hacia el Registro de Gestión es responsabilidad del script de Apps Script
 * (ver `claude/integracion-plane-appsscript.md` y la Tarea de Apps Script de
 * esta misma fase) — el portal no tiene acceso al Google Sheet del usuario.
 */
export async function syncAllRecordsStatusFromPlane(): Promise<{ checked: number; updated: number; failed: number }> {
  if (!isPlaneConfigured()) {
    addPlaneSyncLog({
      direction: "plane_to_portal",
      event: "Sincronización manual de estados",
      status: "skipped",
      detail: "Plane no está configurado en este entorno (faltan variables de entorno).",
    });
    return { checked: 0, updated: 0, failed: 0 };
  }

  const records = listRecordsWithPlaneTicket();
  let updated = 0;
  let failed = 0;

  for (const record of records) {
    if (!record.plane_project_id || !record.plane_work_item_id) continue;
    try {
      const workItem = await getWorkItem(record.plane_project_id, record.plane_work_item_id);
      const status = await resolveWorkItemStatus(record.plane_project_id, workItem);
      const newStatus = status?.name ?? null;

      if (newStatus !== record.plane_status) {
        updateRecordPlaneStatus(record.id, newStatus);
        addActivityLog(record.id, "Estado actualizado desde Plane", `Nuevo estado en Plane: ${newStatus ?? "sin definir"}.`);
      }

      addPlaneSyncLog({
        direction: "plane_to_portal",
        recordId: record.id,
        recordCode: record.code,
        planeProjectId: record.plane_project_id,
        event: "Sincronización manual de estados",
        status: "success",
        detail: `Estado: ${newStatus ?? "sin definir"}`,
      });
      updated += 1;
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : "Error desconocido al consultar Plane.";
      addPlaneSyncLog({
        direction: "plane_to_portal",
        recordId: record.id,
        recordCode: record.code,
        planeProjectId: record.plane_project_id,
        event: "Sincronización manual de estados",
        status: "error",
        detail: message,
      });
    }
  }

  return { checked: records.length, updated, failed };
}
