"use server";

/**
 * Fase 8 — Server Actions de Riesgos y Oportunidades. Mismo estilo que
 * `lib/actions/gestion.ts`: validaciones mínimas con `throw new Error(...)`
 * (dejan la página de error genérica de Next en producción, salvo el bloqueo
 * de cierre, que es la regla de negocio central de esta pantalla — mismo
 * criterio que `cambiarEstadoAction` en la Fase 7), y `revalidatePath`.
 */

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createRisk,
  createRiskControl,
  createRiskRelationship,
  getRiskByCode,
  updateRiskResidual,
  updateRiskStatus,
  updateRiskTreatment,
  type RiskKind,
} from "@/lib/db/queries";
import { isReadOnlyRole, requireEditAccess, requireGestionAccess } from "@/lib/auth/access";
import { pushRiskToSheetSafe } from "@/lib/google-sheets/risk-sync";

function requireRisk(code: string) {
  const risk = getRiskByCode(code);
  if (!risk) throw new Error(`No existe ningún riesgo/oportunidad con el código "${code}".`);
  return risk;
}

function parseIntOrNull(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function crearRiesgoAction(formData: FormData): Promise<void> {
  const user = await requireGestionAccess();
  if (isReadOnlyRole(user.role)) throw new Error("Tu rol es de solo lectura — no podés cargar riesgos u oportunidades.");

  const kind = (String(formData.get("kind") ?? "riesgo").trim() || "riesgo") as RiskKind;
  const description = String(formData.get("description") ?? "").trim();
  if (!description) throw new Error("Describí el riesgo u oportunidad antes de guardarlo.");

  // Un Responsable de Área solo puede cargar riesgos de su propia área,
  // aunque el formulario mande otra cosa — se ignora lo enviado y se fuerza
  // la propia área (mismo criterio que el resto de este archivo: nunca
  // confiar en lo que manda el cliente para decidir permisos).
  const areaId =
    user.role === "responsable_area" ? user.area_id : String(formData.get("areaId") ?? "").trim() || null;

  const risk = createRisk({
    kind,
    source: String(formData.get("source") ?? "").trim() || null,
    areaId,
    processName: String(formData.get("processName") ?? "").trim() || null,
    activity: String(formData.get("activity") ?? "").trim() || null,
    description,
    detail: String(formData.get("detail") ?? "").trim() || null,
    existingControl: String(formData.get("existingControl") ?? "").trim() || null,
    probabilityInitial: parseIntOrNull(formData.get("probabilityInitial")),
    impactInitial: parseIntOrNull(formData.get("impactInitial")),
    treatmentPlan: String(formData.get("treatmentPlan") ?? "").trim() || null,
    responsible: String(formData.get("responsible") ?? "").trim() || null,
    dueDate: String(formData.get("dueDate") ?? "").trim() || null,
  });
  await pushRiskToSheetSafe(risk);

  redirect(`/planificacion/riesgos-y-oportunidades/${risk.code}`);
}

export async function guardarTratamientoAction(formData: FormData): Promise<void> {
  const code = String(formData.get("code") ?? "").trim();
  const risk = requireRisk(code);
  await requireEditAccess(risk);

  const description = String(formData.get("description") ?? "").trim();
  if (!description) throw new Error("La descripción no puede quedar vacía.");

  const updated = updateRiskTreatment(risk.id, {
    source: String(formData.get("source") ?? "").trim() || null,
    areaId: String(formData.get("areaId") ?? "").trim() || null,
    processName: String(formData.get("processName") ?? "").trim() || null,
    activity: String(formData.get("activity") ?? "").trim() || null,
    description,
    detail: String(formData.get("detail") ?? "").trim() || null,
    existingControl: String(formData.get("existingControl") ?? "").trim() || null,
    probabilityInitial: parseIntOrNull(formData.get("probabilityInitial")),
    impactInitial: parseIntOrNull(formData.get("impactInitial")),
    treatmentPlan: String(formData.get("treatmentPlan") ?? "").trim() || null,
    responsible: String(formData.get("responsible") ?? "").trim() || null,
    dueDate: String(formData.get("dueDate") ?? "").trim() || null,
  });
  await pushRiskToSheetSafe(updated);

  revalidatePath(`/planificacion/riesgos-y-oportunidades/${code}`);
}

export async function agregarControlAction(formData: FormData): Promise<void> {
  const code = String(formData.get("code") ?? "").trim();
  const risk = requireRisk(code);
  await requireEditAccess(risk);

  const description = String(formData.get("description") ?? "").trim();
  if (!description) throw new Error("Describí el control antes de guardarlo.");

  createRiskControl(risk.id, {
    description,
    responsible: String(formData.get("responsible") ?? "").trim() || null,
    effectiveness: String(formData.get("effectiveness") ?? "").trim() || null,
  });

  revalidatePath(`/planificacion/riesgos-y-oportunidades/${code}`);
}

export async function guardarValoracionResidualAction(formData: FormData): Promise<void> {
  const code = String(formData.get("code") ?? "").trim();
  const risk = requireRisk(code);
  await requireEditAccess(risk);

  const updated = updateRiskResidual(risk.id, {
    probabilityResidual: parseIntOrNull(formData.get("probabilityResidual")),
    impactResidual: parseIntOrNull(formData.get("impactResidual")),
    verification: String(formData.get("verification") ?? "").trim() || null,
  });
  await pushRiskToSheetSafe(updated);

  revalidatePath(`/planificacion/riesgos-y-oportunidades/${code}`);
}

export async function cambiarEstadoRiesgoAction(formData: FormData): Promise<void> {
  const code = String(formData.get("code") ?? "").trim();
  const risk = requireRisk(code);
  await requireEditAccess(risk);
  const newStatus = String(formData.get("status") ?? "").trim();
  if (!newStatus) throw new Error("Elegí un estado.");

  try {
    updateRiskStatus(risk.id, newStatus);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar el estado.";
    redirect(`/planificacion/riesgos-y-oportunidades/${code}?tab=valoracion&estadoError=${encodeURIComponent(message)}`);
  }

  revalidatePath(`/planificacion/riesgos-y-oportunidades/${code}`);
}

export async function vincularRegistroRiesgoAction(formData: FormData): Promise<void> {
  const code = String(formData.get("code") ?? "").trim();
  const risk = requireRisk(code);
  await requireEditAccess(risk);
  const targetCode = String(formData.get("targetCode") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim() || null;
  if (!targetCode) throw new Error("Ingresá el código del registro a vincular.");

  createRiskRelationship(risk.id, targetCode, label);
  revalidatePath(`/planificacion/riesgos-y-oportunidades/${code}`);
}
