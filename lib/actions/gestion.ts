"use server";

/**
 * Fase 7 — Server Actions de "gestión completa": análisis de causa raíz y
 * corrección inmediata (NC), creación/vinculación de Acciones Correctivas,
 * verificación de eficacia y cambio de estado con el bloqueo de cierre para
 * AC, relaciones genéricas entre registros, evidencias y vencimiento.
 *
 * Todas revalidan la página de detalle del registro (`/gestion-calidad/registro/[code]`)
 * en vez de redirigir, salvo `crearAccionCorrectivaAction` — esa sí navega,
 * porque el resultado es un registro nuevo con su propio código.
 */

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  addEvidence,
  createCorrectiveActionForRecord,
  createEscalatedRecord,
  deleteRecord,
  getRecordByCode,
  linkExistingRecordRelationship,
  updateRecordAnalysis,
  updateRecordDueDate,
  updateRecordEffectiveness,
  updateRecordStatus,
} from "@/lib/db/queries";
import { requireEditAccess } from "@/lib/auth/access";
import { requireRole } from "@/lib/auth/dal";

function requireRecord(code: string) {
  const record = getRecordByCode(code);
  if (!record) throw new Error(`No existe ningún registro con el código "${code}".`);
  return record;
}

export async function guardarAnalisisAction(formData: FormData): Promise<void> {
  const code = String(formData.get("code") ?? "").trim();
  const record = requireRecord(code);
  await requireEditAccess(record);

  updateRecordAnalysis(record.id, {
    rootCauseMethod: String(formData.get("rootCauseMethod") ?? "").trim() || null,
    rootCauseAnalysis: String(formData.get("rootCauseAnalysis") ?? "").trim() || null,
    rootCause: String(formData.get("rootCause") ?? "").trim() || null,
    correctionAction: String(formData.get("correctionAction") ?? "").trim() || null,
    correctionResponsible: String(formData.get("correctionResponsible") ?? "").trim() || null,
    correctionDate: String(formData.get("correctionDate") ?? "").trim() || null,
  });

  revalidatePath(`/gestion-calidad/registro/${code}`);
}

export async function crearAccionCorrectivaAction(formData: FormData): Promise<void> {
  const code = String(formData.get("code") ?? "").trim();
  const record = requireRecord(code);
  await requireEditAccess(record);

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const responsible = String(formData.get("responsible") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim() || null;
  const priority = (String(formData.get("priority") ?? "Media").trim() || "Media") as "Baja" | "Media" | "Alta";

  if (!title || !description || !responsible) {
    throw new Error("Faltan campos obligatorios para crear la Acción Correctiva (título, acción y responsable).");
  }

  const ac = createCorrectiveActionForRecord(record, { title, description, responsible, dueDate, priority });

  revalidatePath(`/gestion-calidad/registro/${code}`);
  redirect(`/gestion-calidad/registro/${ac.code}`);
}

/**
 * Igual que `crearAccionCorrectivaAction`, pero genérica para el resto de
 * las escaladas (Sugerencia → Oportunidad de Mejora, Queja/Reclamo → No
 * Conformidad) — el tipo a crear viaja en `targetTypeCode`, un campo oculto
 * que pone cada pestaña de `EscalarTab` según corresponda.
 */
export async function crearRegistroEscaladoAction(formData: FormData): Promise<void> {
  const code = String(formData.get("code") ?? "").trim();
  const record = requireRecord(code);
  await requireEditAccess(record);

  const targetTypeCode = String(formData.get("targetTypeCode") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const responsible = String(formData.get("responsible") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim() || null;
  const priority = (String(formData.get("priority") ?? "Media").trim() || "Media") as "Baja" | "Media" | "Alta";

  if (!targetTypeCode) throw new Error("Falta el tipo de registro a crear.");
  if (!title || !description || !responsible) {
    throw new Error("Faltan campos obligatorios (título, acción y responsable).");
  }

  const created = createEscalatedRecord(record, targetTypeCode, { title, description, responsible, dueDate, priority });

  revalidatePath(`/gestion-calidad/registro/${code}`);
  redirect(`/gestion-calidad/registro/${created.code}`);
}

export async function vincularAccionExistenteAction(formData: FormData): Promise<void> {
  const code = String(formData.get("code") ?? "").trim();
  const record = requireRecord(code);
  await requireEditAccess(record);
  const targetCode = String(formData.get("targetCode") ?? "").trim();
  if (!targetCode) throw new Error("Ingresá el código del registro a vincular.");

  linkExistingRecordRelationship(code, targetCode, `Acción Correctiva de ${code}`);
  revalidatePath(`/gestion-calidad/registro/${code}`);
}

export async function vincularRegistroAction(formData: FormData): Promise<void> {
  const code = String(formData.get("code") ?? "").trim();
  const record = requireRecord(code);
  await requireEditAccess(record);
  const targetCode = String(formData.get("targetCode") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim() || null;
  if (!targetCode) throw new Error("Ingresá el código del registro a vincular.");

  linkExistingRecordRelationship(code, targetCode, label);
  revalidatePath(`/gestion-calidad/registro/${code}`);
}

export async function guardarVerificacionAction(formData: FormData): Promise<void> {
  const code = String(formData.get("code") ?? "").trim();
  const record = requireRecord(code);
  await requireEditAccess(record);

  const effectiveRaw = String(formData.get("effective") ?? "").trim();
  const effective = effectiveRaw === "si" ? true : effectiveRaw === "no" ? false : null;

  updateRecordEffectiveness(record.id, {
    dueDate: String(formData.get("dueDate") ?? "").trim() || null,
    responsible: String(formData.get("responsible") ?? "").trim() || null,
    result: String(formData.get("result") ?? "").trim() || null,
    evidence: String(formData.get("evidence") ?? "").trim() || null,
    effective,
  });

  revalidatePath(`/gestion-calidad/registro/${code}`);
}

export async function cambiarEstadoAction(formData: FormData): Promise<void> {
  const code = String(formData.get("code") ?? "").trim();
  const record = requireRecord(code);
  await requireEditAccess(record);
  const newStatus = String(formData.get("status") ?? "").trim();
  const tab = String(formData.get("tab") ?? "verificacion").trim() || "verificacion";
  if (!newStatus) throw new Error("Elegí un estado.");

  // A diferencia del resto de las acciones de este archivo (que dejan que un
  // campo faltante tire el error genérico de Next.js sin error.tsx propio),
  // el bloqueo de cierre de una AC es el corazón de esta pantalla — probado
  // en vivo, un `throw` acá termina en la página de error genérica de
  // producción de Next ("Application error"), no en el mensaje real. Por
  // eso este caso puntual se atrapa y se vuelve a la misma pantalla con el
  // motivo en la URL, para que se vea como un aviso prolijo, no un crash.
  try {
    updateRecordStatus(record.id, newStatus);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar el estado.";
    redirect(`/gestion-calidad/registro/${code}?tab=${tab}&estadoError=${encodeURIComponent(message)}`);
  }

  revalidatePath(`/gestion-calidad/registro/${code}`);
}

export async function agregarEvidenciaAction(formData: FormData): Promise<void> {
  const code = String(formData.get("code") ?? "").trim();
  const record = requireRecord(code);
  await requireEditAccess(record);

  const description = String(formData.get("description") ?? "").trim();
  const link = String(formData.get("link") ?? "").trim() || null;
  const createdBy = String(formData.get("createdBy") ?? "").trim() || null;
  if (!description) throw new Error("Describí la evidencia antes de guardarla.");

  addEvidence(record.id, { description, link, createdBy });
  revalidatePath(`/gestion-calidad/registro/${code}`);
}

export async function actualizarVencimientoAction(formData: FormData): Promise<void> {
  const code = String(formData.get("code") ?? "").trim();
  const record = requireRecord(code);
  await requireEditAccess(record);
  const dueDate = String(formData.get("dueDate") ?? "").trim() || null;

  updateRecordDueDate(record.id, dueDate);
  revalidatePath(`/gestion-calidad/registro/${code}`);
}

/**
 * Borra un registro (NC/AC/OM/etc) — a pedido del usuario, acción exclusiva
 * de `admin` (ni siquiera `calidad`, a diferencia del resto de esta pantalla
 * que usa `requireEditAccess`). Redirige al listado porque la página de
 * detalle del código borrado ya no existe.
 */
export async function eliminarRegistroAction(formData: FormData): Promise<void> {
  await requireRole(["admin"]);
  const code = String(formData.get("code") ?? "").trim();
  const record = requireRecord(code);

  deleteRecord(record.id);
  revalidatePath("/gestion-calidad/registro");
  redirect("/gestion-calidad/registro");
}
