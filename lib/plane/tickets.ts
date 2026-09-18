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
  resolveLabelId,
  resolveWorkItemStatus,
  stripHtml,
  workItemHasLabel,
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

/**
 * Sugiere el tipo SGC para un ticket, en orden de prioridad: 1) un tag en el
 * título (`title_tag_types`, ej. "[Bug]" → NC), 2) una etiqueta real de Plane
 * que tenga cargada (`label_types`, ej. "Mejora" → OM), 3) `auto_type_code`
 * (sugerencia fija por proyecto, sin importar el contenido del ticket). El
 * tag de título siempre gana si matchea, aunque el ticket también tenga
 * alguna de las etiquetas configuradas. Todas las fuentes se validan contra
 * los tipos activos por si se borró/desactivó alguno.
 */
export async function resolveSuggestedTypeCode(
  projectId: string,
  ticket: PlaneWorkItem,
  mapping:
    | { auto_type_code: string | null; label_types: { label: string; typeCode: string }[]; title_tag_types: { tag: string; typeCode: string }[] }
    | undefined,
  validTypeCodes: Set<string>,
): Promise<string | undefined> {
  if (!mapping) return undefined;

  const lowerTitle = ticket.name.toLowerCase();
  const byTag = mapping.title_tag_types.find(
    (entry) => validTypeCodes.has(entry.typeCode) && lowerTitle.includes(entry.tag.toLowerCase()),
  );
  if (byTag) return byTag.typeCode;

  for (const entry of mapping.label_types) {
    if (!validTypeCodes.has(entry.typeCode)) continue;
    const labelId = await resolveLabelId(projectId, entry.label);
    if (labelId && workItemHasLabel(ticket, labelId)) return entry.typeCode;
  }

  return mapping.auto_type_code && validTypeCodes.has(mapping.auto_type_code) ? mapping.auto_type_code : undefined;
}

export type TicketsPlaneResult = {
  configured: boolean;
  projects: { id: string; name: string; labels: string[] }[];
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
 *
 * Si el mapeo tiene `label_types` cargado, se filtran los work items del
 * proyecto a solo los que tengan alguna de esas etiquetas en Plane — así el
 * proyecto entero no queda "pendiente de tipificar" ticket por ticket, solo
 * lo que se marcó explícitamente como relevante para el SGC. Sin etiquetas
 * ni tags de título, se listan todos los work items del proyecto
 * (comportamiento original de la Fase 6).
 *
 * Si además (o en vez de eso) el mapeo tiene `title_tag_types` cargado, se
 * suma otro criterio de entrada: los work items cuyo título contenga alguno
 * de esos tags (ej. "[Bug]", "[Mejora]") también entran como pendientes — el
 * mismo criterio que ya se usa para sugerir el tipo al tipificar
 * (`resolveSuggestedTypeCode`), pero acá decide qué aparece en vez de qué
 * tipo pre-cargar. Si el mapeo tiene los dos cargados, es un OR: con cumplir
 * cualquiera de los dos alcanza, no hace falta cumplir ambos.
 *
 * `onlyAreaId` (autorización fina por rol): si se pasa, solo se consultan
 * los proyectos mapeados a esa área — un Responsable de Área no debe ver
 * (ni golpear la API por) tickets de proyectos de otras áreas.
 */
export async function listTicketsPlaneRows(onlyAreaId?: string | null): Promise<TicketsPlaneResult> {
  const configured = isPlaneConfigured();
  let mappings = listPlaneProjectMappings().filter((m) => m.active);
  if (onlyAreaId !== undefined) {
    mappings = mappings.filter((m) => m.area_id === onlyAreaId);
  }
  const projects = mappings.map((m) => ({
    id: m.plane_project_id,
    name: m.plane_project_name ?? m.plane_project_id,
    labels: m.label_types.map((entry) => entry.label),
  }));

  if (!configured || projects.length === 0) {
    return { configured, projects, rows: [], projectErrors: [] };
  }

  const typesById = new Map(listRecordTypes().map((t) => [t.id, t]));
  const rows: TicketPlaneRow[] = [];
  const projectErrors: { projectId: string; projectName: string; message: string }[] = [];

  for (const mapping of mappings) {
    const projectId = mapping.plane_project_id;
    const projectName = mapping.plane_project_name ?? mapping.plane_project_id;
    try {
      const { results } = await listWorkItems(projectId);

      const labelRequested = mapping.label_types.length > 0;
      const labelIds: string[] = [];
      const labelsNotFound: string[] = [];
      for (const entry of mapping.label_types) {
        const labelId = await resolveLabelId(projectId, entry.label);
        if (labelId) labelIds.push(labelId);
        else labelsNotFound.push(entry.label);
      }
      if (labelsNotFound.length > 0) {
        const tagFallbackNote = mapping.title_tag_types.length
          ? " Se siguen trayendo los tickets que matcheen por tag de título o por alguna otra etiqueta cargada."
          : "";
        projectErrors.push({
          projectId,
          projectName,
          message: `No se ${labelsNotFound.length === 1 ? "encontró la etiqueta" : "encontraron las etiquetas"} ${labelsNotFound.map((l) => `"${l}"`).join(", ")} en este proyecto de Plane — revisar el nombre exacto en Configuración → Plane.${tagFallbackNote}`,
        });
      }

      const tags = mapping.title_tag_types.map((entry) => entry.tag.toLowerCase());
      const hasTagFilter = tags.length > 0;

      // OR, no AND: si el proyecto tiene los dos filtros cargados, alcanza con
      // cumplir cualquiera de los dos (alguna etiqueta de Plane, o algún tag
      // en el título) para entrar como pendiente — no hace falta cumplir
      // ambos. Una etiqueta que no se encontró en Plane simplemente no suma
      // ningún id a `labelIds` (no aporta matches), pero el resto de las
      // etiquetas y el filtro por tag siguen funcionando igual.
      let items = results;
      if (labelRequested || hasTagFilter) {
        items = items.filter((item) => {
          const matchesLabel = labelIds.some((labelId) => workItemHasLabel(item, labelId));
          const matchesTag = hasTagFilter && tags.some((tag) => item.name.toLowerCase().includes(tag));
          return matchesLabel || matchesTag;
        });
      }

      for (const item of items) {
        rows.push(await rowFromWorkItem(projectId, projectName, item, typesById));
      }
    } catch (error) {
      const message =
        error instanceof PlaneApiError || error instanceof Error
          ? error.message
          : "Error desconocido al listar los tickets de este proyecto.";
      projectErrors.push({ projectId, projectName, message });
    }
  }

  rows.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  return { configured, projects, rows, projectErrors };
}
