"use server";

/**
 * Fase 11 — Server Actions de Objetivos de Calidad. Mismo estilo que
 * `lib/actions/risks.ts`: validaciones mínimas con `throw new Error(...)`,
 * `revalidatePath`.
 */

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  addObjectiveResult,
  createObjective,
  getObjectiveByCode,
  updateObjective,
  updateObjectiveStatus,
} from "@/lib/db/queries";

function requireObjective(code: string) {
  const objective = getObjectiveByCode(code);
  if (!objective) throw new Error(`No existe ningún objetivo con el código "${code}".`);
  return objective;
}

function parseFloatOrNull(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number.parseFloat(raw);
  return Number.isNaN(parsed) ? null : parsed;
}

function readObjectiveFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("El objetivo no puede quedar vacío.");
  return {
    title,
    goal: String(formData.get("goal") ?? "").trim() || null,
    targetValue: parseFloatOrNull(formData.get("targetValue")),
    indicatorId: String(formData.get("indicatorId") ?? "").trim() || null,
    unit: String(formData.get("unit") ?? "").trim() || null,
    resources: String(formData.get("resources") ?? "").trim() || null,
    responsible: String(formData.get("responsible") ?? "").trim() || null,
    areaId: String(formData.get("areaId") ?? "").trim() || null,
    processName: String(formData.get("processName") ?? "").trim() || null,
    startDate: String(formData.get("startDate") ?? "").trim() || null,
    endDate: String(formData.get("endDate") ?? "").trim() || null,
    frequency: String(formData.get("frequency") ?? "").trim() || null,
    method: String(formData.get("method") ?? "").trim() || null,
  };
}

export async function crearObjetivoAction(formData: FormData): Promise<void> {
  const fields = readObjectiveFields(formData);
  const objective = createObjective(fields);
  redirect(`/planificacion/objetivos-de-calidad/${objective.code}`);
}

export async function guardarObjetivoAction(formData: FormData): Promise<void> {
  const code = String(formData.get("code") ?? "").trim();
  const objective = requireObjective(code);
  const fields = readObjectiveFields(formData);

  updateObjective(objective.id, {
    ...fields,
    currentResult: String(formData.get("currentResult") ?? "").trim() || null,
    compliancePercent: parseFloatOrNull(formData.get("compliancePercent")),
    evidence: String(formData.get("evidence") ?? "").trim() || null,
    observations: String(formData.get("observations") ?? "").trim() || null,
  });

  revalidatePath(`/planificacion/objetivos-de-calidad/${code}`);
}

export async function agregarResultadoObjetivoAction(formData: FormData): Promise<void> {
  const code = String(formData.get("code") ?? "").trim();
  const objective = requireObjective(code);
  const period = String(formData.get("period") ?? "").trim();
  if (!period) throw new Error("Indicá el período (ej. 2026-01).");

  addObjectiveResult(objective.id, {
    period,
    actualValue: parseFloatOrNull(formData.get("actualValue")),
    targetValue: parseFloatOrNull(formData.get("targetValue")),
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  revalidatePath(`/planificacion/objetivos-de-calidad/${code}`);
}

export async function cambiarEstadoObjetivoAction(formData: FormData): Promise<void> {
  const code = String(formData.get("code") ?? "").trim();
  const objective = requireObjective(code);
  const newStatus = String(formData.get("status") ?? "").trim();
  if (!newStatus) throw new Error("Elegí un estado.");

  updateObjectiveStatus(objective.id, newStatus);
  revalidatePath(`/planificacion/objetivos-de-calidad/${code}`);
}
