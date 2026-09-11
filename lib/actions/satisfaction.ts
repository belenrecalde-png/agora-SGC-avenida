"use server";

/** Evaluación → Satisfacción. Mismo estilo que `lib/actions/indicators.ts`. */

import { revalidatePath } from "next/cache";
import { addSatisfactionResult } from "@/lib/db/queries";
import { isReadOnlyRole, requireGestionAccess } from "@/lib/auth/access";

function parseFloatOrNull(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number.parseFloat(raw);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseIntOrNull(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function addSatisfactionResultAction(formData: FormData): Promise<void> {
  const user = await requireGestionAccess();
  if (isReadOnlyRole(user.role)) throw new Error("Tu rol es de solo lectura — no podés cargar resultados de satisfacción.");

  const period = String(formData.get("period") ?? "").trim();
  const score = parseFloatOrNull(formData.get("score"));
  if (!period || score === null) throw new Error("Indicá el período y el puntaje.");

  const areaId =
    user.role === "responsable_area" ? user.area_id : String(formData.get("areaId") ?? "").trim() || null;

  addSatisfactionResult({
    period,
    areaId,
    score,
    unit: String(formData.get("unit") ?? "").trim() || null,
    respondents: parseIntOrNull(formData.get("respondents")),
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  revalidatePath("/evaluacion/satisfaccion");
}
