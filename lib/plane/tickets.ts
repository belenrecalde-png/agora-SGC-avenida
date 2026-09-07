/**
 * Fase 6 — Tipificación de tickets de Plane.
 *
 * Reúne, para la pantalla Gestión de Calidad → Tickets Plane, los work items
 * de los proyectos de Plane que el portal ya conoce, cruzados contra:
 *  - `records` (¿este ticket ya está vinculado a un registro del SGC?), y
 *  - `plane_ticket_dismissals` (¿se marcó como "no aplica al SGC"?).
 *
 * Importante — de dónde sale la lista de proyectos: todavía no existe en el
 * portal un concepto separado de "proyectos de solo lectura para tipificar"
 * (eso sí existe, pero como configuración de Apps Script/Sheets — Fase 5,
 * `AGORA_PLANE_SYNC_ENTRADA_FIJA_` — que es un sistema completamente aparte
 * y no comparte datos con esta base). Por ahora esta pantalla reutiliza el
 * mismo mapeo área↔proyecto de la Fase 4 (`plane_project_mappings`) como
 * fuente de "qué proyectos mirar": simplificación deliberada para no
 * bloquear la Fase 6 en una decisión de producto (¿los mismos proyectos que
 * reciben reportes del portal, u otra lista?) — documentado acá para
 * revisar con el usuario si hace falta una lista separada más adelante.
 */
import {
  getPlaneTicketDismissal,
  getRecordByPlaneWorkItemId,
  listPlaneProjectMappings,
  listRecordTypes,
  type RecordType,
} from "@/lib/db/queries";
import {
  PlaneApiError,
  getWorkItemUrl,
  isPlaneConfigured,
  listWorkItems,
  mapPlanePriorityToPortal,
  resolveWorkItemStatus,
  stripHtml,
  type PlaneWorkItem,
} from "@/lib/plane/client";

export type TicketPlaneClassification = "pending" | "linked" | "dismissed";

export type TicketPlaneRow = {
  projectId: string;
  projectName: string;
  workItemId: string;
  sequenceId: number | null;
  title: string;
  descriptionText: string;
  statusName: string | null;
  statusGroup: string | null;
  priority: "Baja" | "Media" | "Alta";
  createdAt: string | null;
  planeUrl: string | null;
  classification: TicketPlaneClassification;
  linkedRecord?: { code: string; typeCode: string; status: string };
  dismissedReason?: string | null;
};

export type TicketsPlaneResult = {
  configured: boolean;
  projects: { id: string; name: string }[];
  rows: TicketPlaneRow[];
  /** Un mensaje de error por proyecto que falló al listar (no rompe el resto). */
  projectErrors: { projectId: string; projectName: string; message: string }[];
};

async function rowFromWorkItem(
  projectId: string,
  projectName: string,
  item: PlaneWorkItem,
  typesById: Map<string, RecordType>,
): Promise<TicketPlaneRow> {
  const status = await resolveWorkItemStatus(projectId, item).catch(() => null);
  const planeUrl = getWorkItemUrl(projectId, item.id);

  const linkedRecord = getRecordByPlaneWorkItemId(item.id);
  if (linkedRecord) {
    const type = typesById.get(linkedRecord.type_id);
    return {
      projectId,
      projectName,
      workItemId: item.id,
      sequenceId: item.sequence_id ?? null,
      title: item.name,
      descriptionText: stripHtml(item.description_html),
      statusName: status?.name ?? null,
      statusGroup: status?.group ?? null,
      priority: mapPlanePriorityToPortal(item.priority),
      createdAt: item.created_at ?? null,
      planeUrl,
      classification: "linked",
      linkedRecord: {
        code: linkedRecord.code,
        typeCode: type?.code ?? linkedRecord.type_id,
        status: linkedRecord.status,
      },
    };
  }

  const dismissal = getPlaneTicketDismissal(item.id);
  return {
    projectId,
    projectName,
    workItemId: item.id,
    sequenceId: item.sequence_id ?? null,
    title: item.name,
    descriptionText: stripHtml(item.description_html),
    statusName: status?.name ?? null,
    statusGroup: status?.group ?? null,
    priority: mapPlanePriorityToPortal(item.priority),
    createdAt: item.created_at ?? null,
    planeUrl,
    classification: dismissal ? "dismissed" : "pending",
    dismissedReason: dismissal?.reason ?? null,
  };
}

/**
 * Trae la primera página de work items de cada proyecto mapeado y activo.
 * No pagina más allá de eso todavía (ver limitación documentada arriba) —
 * para un proyecto con muchos tickets, esta primera versión solo muestra
 * los primeros que devuelva Plane.
 */
export async function listTicketsPlaneRows(): Promise<TicketsPlaneResult> {
  const configured = isPlaneConfigured();
  const mappings = listPlaneProjectMappings().filter((m) => m.active);
  const projects = mappings.map((m) => ({
    id: m.plane_project_id,
    name: m.plane_project_name ?? m.plane_project_id,
  }));

  if (!configured || projects.length === 0) {
    return { configured, projects, rows: [], projectErrors: [] };
  }

  const typesById = new Map(listRecordTypes().map((t) => [t.id, t]));
  const rows: TicketPlaneRow[] = [];
  const projectErrors: { projectId: string; projectName: string; message: string }[] = [];

  for (const project of projects) {
    try {
      const { results } = await listWorkItems(project.id);
      for (const item of results) {
        rows.push(await rowFromWorkItem(project.id, project.name, item, typesById));
      }
    } catch (error) {
      const message =
        error instanceof PlaneApiError || error instanceof Error
          ? error.message
          : "Error desconocido al listar los tickets de este proyecto.";
      projectErrors.push({ projectId: project.id, projectName: project.name, message });
    }
  }

  rows.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  return { configured, projects, rows, projectErrors };
}
