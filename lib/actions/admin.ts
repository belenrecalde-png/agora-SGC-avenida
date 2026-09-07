"use server";

import { revalidatePath } from "next/cache";
import { createArea, createRecordType, toggleAreaActive, toggleRecordTypeActive, toggleUserActive, updateUserRoleAndArea } from "@/lib/db/queries";
import { requireRole } from "@/lib/auth/dal";
import { isRole } from "@/lib/auth/roles";

export async function createAreaAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("El área necesita un nombre.");
  createArea(name);
  revalidatePath("/configuracion/areas");
}

export async function toggleAreaAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  toggleAreaActive(id);
  revalidatePath("/configuracion/areas");
}

export async function createRecordTypeAction(formData: FormData): Promise<void> {
  const code = String(formData.get("code") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const color = String(formData.get("color") ?? "violet").trim();
  if (!code || !name) throw new Error("El tipo necesita sigla y nombre.");
  createRecordType({ code, name, description, color });
  revalidatePath("/configuracion/tipos");
}

export async function toggleRecordTypeAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  toggleRecordTypeActive(id);
  revalidatePath("/configuracion/tipos");
}

// ---------- Usuarios (autenticación) ----------
//
// Gateadas con `requireRole(["admin"])` acá adentro, no solo en la página —
// un Server Action es un endpoint más y tiene que validar permisos por su
// cuenta (mismo criterio que la guía de autenticación de Next 16: "treat
// Server Actions with the same security considerations as public APIs").

export async function updateUserRoleAction(formData: FormData): Promise<void> {
  await requireRole(["admin"]);
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "").trim();
  const areaId = String(formData.get("areaId") ?? "").trim() || null;
  if (!userId || !isRole(role)) throw new Error("Rol inválido.");

  updateUserRoleAndArea(userId, role, areaId);
  revalidatePath("/configuracion/usuarios");
}

export async function toggleUserActiveAction(formData: FormData): Promise<void> {
  await requireRole(["admin"]);
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;
  toggleUserActive(userId);
  revalidatePath("/configuracion/usuarios");
}
