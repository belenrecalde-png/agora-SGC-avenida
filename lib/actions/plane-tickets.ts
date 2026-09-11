"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createRecordFromPlaneTicket,
  dismissPlaneTicket,
  getPlaneProjectMappingByProjectId,
  linkRecordToPlaneTicket,
  undoPlaneTicketDismissal,
} from "@/lib/db/queries";
import { getWorkItemUrl } from "@/lib/plane/client";
import { hasFullAreaAccess, requireTicketsPlaneAccess } from "@/lib/auth/access";

function refreshTicketsPlaneScreens() {
  revalidatePath("/gestion-calidad/tickets-plane");
  revalidatePath("/gestion-calidad/registro");
}

/** Mismo chequeo que las páginas de tipificar/vincular — gatea también la Server Action, no solo la pantalla. */
async function requireTicketProjectAccess(planeProjectId: string) {
  const user = await requireTicketsPlaneAccess();
  if (!hasFullAreaAccess(user.role)) {
    const mapping = getPlaneProjectMappingByProjectId(planeProjectId);
    if (mapping?.area_id !== user.area_id) {
      throw new Error("No tenés permiso sobre este proyecto de Plane — no pertenece a tu área.");
    }
  }
  return user;
}

function readTicketRefs(formData: FormData) {
  const planeProjectId = String(formData.get("planeProjectId") ?? "").trim();
  const planeWorkItemId = String(formData.get("planeWorkItemId") ?? "").trim();
  const planeSequenceIdRaw = String(formData.get("planeSequenceId") ?? "").trim();
  const planeStatus = String(formData.get("planeStatus") ?? "").trim() || null;

  if (!planeProjectId || !planeWorkItemId) {
    throw new Error("Faltan los datos del ticket de Plane.");
  }

  return {
    planeProjectId,
    planeWorkItemId,
    planeSequenceId: planeSequenceIdRaw || null,
    planeStatus,
    planeUrl: getWorkItemUrl(planeProjectId, planeWorkItemId),
  };
}

/**
 * "Tipificar": crea un registro nuevo del SGC (NC/AC/AP/OM/Q/S/R) a partir de
 * un ticket de Plane que todavía no tiene ningún registro asociado. Mismos
 * campos que `/reportar/nuevo` — ver `app/gestion-calidad/tickets-plane/tipificar/page.tsx`.
 */
export async function tipificarTicketAction(formData: FormData): Promise<void> {
  const ticket = readTicketRefs(formData);
  await requireTicketProjectAccess(ticket.planeProjectId);

  const typeCode = String(formData.get("typeCode") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const areaId = String(formData.get("areaId") ?? "").trim() || null;
  const processName = String(formData.get("processName") ?? "").trim() || null;
  const reporterName = String(formData.get("reporterName") ?? "").trim();
  const eventDate = String(formData.get("eventDate") ?? "").trim() || null;
  const impact = String(formData.get("impact") ?? "").trim() || null;
  const priority = (String(formData.get("priority") ?? "Media").trim() || "Media") as "Baja" | "Media" | "Alta";
  const urgent = formData.get("urgent") === "on";
  const evidenceNote = String(formData.get("evidenceNote") ?? "").trim() || null;
  const comments = String(formData.get("comments") ?? "").trim() || null;

  if (!typeCode || !title || !description || !reporterName) {
    throw new Error("Faltan campos obligatorios para tipificar el ticket.");
  }

  const record = createRecordFromPlaneTicket({
    typeCode,
    title,
    description,
    areaId,
    processName,
    reporterName,
    eventDate,
    impact,
    priority,
    urgent,
    evidenceNote,
    comments,
    planeProjectId: ticket.planeProjectId,
    planeWorkItemId: ticket.planeWorkItemId,
    planeSequenceId: ticket.planeSequenceId,
    planeStatus: ticket.planeStatus,
    planeUrl: ticket.planeUrl,
  });

  refreshTicketsPlaneScreens();
  redirect(`/gestion-calidad/registro/${record.code}`);
}

/** "Vincular": asocia el ticket a un registro del SGC que ya existe (por código). */
export async function vincularTicketAction(formData: FormData): Promise<void> {
  const ticket = readTicketRefs(formData);
  await requireTicketProjectAccess(ticket.planeProjectId);
  const recordCode = String(formData.get("recordCode") ?? "").trim();

  if (!recordCode) {
    throw new Error("Hace falta indicar el código del registro a vincular.");
  }

  const record = linkRecordToPlaneTicket(recordCode, {
    planeProjectId: ticket.planeProjectId,
    planeWorkItemId: ticket.planeWorkItemId,
    planeSequenceId: ticket.planeSequenceId,
    planeStatus: ticket.planeStatus,
    planeUrl: ticket.planeUrl,
  });

  refreshTicketsPlaneScreens();
  redirect(`/gestion-calidad/registro/${record.code}`);
}

/** "No aplica al SGC": no borra ni modifica nada en Plane, solo lo saca de "pendientes". */
export async function descartarTicketAction(formData: FormData): Promise<void> {
  const planeProjectId = String(formData.get("planeProjectId") ?? "").trim();
  const planeWorkItemId = String(formData.get("planeWorkItemId") ?? "").trim();
  const planeSequenceId = String(formData.get("planeSequenceId") ?? "").trim() || null;
  const reason = String(formData.get("reason") ?? "").trim() || null;
  if (!planeProjectId || !planeWorkItemId) return;
  await requireTicketProjectAccess(planeProjectId);

  dismissPlaneTicket({ planeProjectId, planeWorkItemId, planeSequenceId, reason });
  refreshTicketsPlaneScreens();
}

/** Deshace un "No aplica al SGC" — el ticket vuelve a aparecer como pendiente. */
export async function revertirDescarteAction(formData: FormData): Promise<void> {
  const planeWorkItemId = String(formData.get("planeWorkItemId") ?? "").trim();
  if (!planeWorkItemId) return;
  await requireTicketsPlaneAccess();

  undoPlaneTicketDismissal(planeWorkItemId);
  refreshTicketsPlaneScreens();
}
