"use server";

/**
 * Fase 11 — Server Actions de Indicadores. Mismo estilo que
 * `lib/actions/objectives.ts`.
 */

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addIndicatorResult, createIndicator, getIndicatorByCode, updateIndicator } from "@/lib/db/queries";

function requireIndicator(code: string) {
  const indicator = getIndicatorByCode(code);
  if (!indicator) throw new Error(`No existe ningún indicador con el código "${code}".`);
  return indicator;
}

function parseFloatOrNull(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number.parseFloat(raw);
  return Number.isNaN(parsed) ? null : parsed;
}

function readIndicatorFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("El nombre del indicador no puede quedar vacío.");
  return {
    name,
    description: String(formData.get("description") ?? "").trim() || null,
    formula: String(formData.get("formula") ?? "").trim() || null,
    source: String(formData.get("source") ?? "").trim() || null,
    unit: String(formData.get("unit") ?? "").trim() || null,
    targetValue: parseFloatOrNull(formData.get("targetValue")),
    tolerance: parseFloatOrNull(formData.get("tolerance")),
    frequency: String(formData.get("frequency") ?? "").trim() || null,
    responsible: String(formData.get("responsible") ?? "").trim() || null,
    areaId: String(formData.get("areaId") ?? "").trim() || null,
    processName: String(formData.get("processName") ?? "").trim() || null,
  };
}

export async function crearIndicadorAction(formData: FormData): Promise<void> {
  const fields = readIndicatorFields(formData);
  const indicator = createIndicator(fields);
  redirect(`/evaluacion/indicadores/${indicator.code}`);
}

export async function guardarIndicadorAction(formData: FormData): Promise<void> {
  const code = String(formData.get("code") ?? "").trim();
  const indicator = requireIndicator(code);
  const fields = readIndicatorFields(formData);

  updateIndicator(indicator.id, fields);
  revalidatePath(`/evaluacion/indicadores/${code}`);
}

export async function agregarResultadoIndicadorAction(formData: FormData): Promise<void> {
  const code = String(formData.get("code") ?? "").trim();
  const indicator = requireIndicator(code);
  const period = String(formData.get("period") ?? "").trim();
  if (!period) throw new Error("Indicá el período (ej. 2026-01).");

  addIndicatorResult(indicator.id, {
    period,
    value: parseFloatOrNull(formData.get("value")),
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  revalidatePath(`/evaluacion/indicadores/${code}`);
}
