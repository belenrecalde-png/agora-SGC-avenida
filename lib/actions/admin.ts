"use server";

import { revalidatePath } from "next/cache";
import { createArea, createRecordType, toggleAreaActive, toggleRecordTypeActive } from "@/lib/db/queries";

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
