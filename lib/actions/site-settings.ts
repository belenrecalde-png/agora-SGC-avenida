"use server";

/**
 * Configuración → Página de inicio: subir/quitar la foto del equipo que se
 * muestra en el Hero del Home. Gateada a admin, igual que el resto de
 * Configuración con datos sensibles (Usuarios).
 */
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/dal";
import { HOME_PHOTO_SETTING_KEY, deleteSiteSetting, getSiteSetting, setSiteSetting } from "@/lib/db/queries";
import { deleteUpload, saveUpload } from "@/lib/uploads";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function uploadHomePhotoAction(formData: FormData): Promise<void> {
  await requireRole(["admin"]);

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Elegí un archivo de imagen para subir.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("La imagen no puede pesar más de 5 MB.");
  }
  const ext = EXTENSION_BY_TYPE[file.type];
  if (!ext) {
    throw new Error("Formato no soportado — usá JPG, PNG o WEBP.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `home-photo-${Date.now()}.${ext}`;
  saveUpload(filename, buffer);

  const previous = getSiteSetting(HOME_PHOTO_SETTING_KEY);
  setSiteSetting(HOME_PHOTO_SETTING_KEY, filename);
  if (previous) deleteUpload(previous);

  revalidatePath("/");
  revalidatePath("/configuracion/inicio");
}

export async function removeHomePhotoAction(): Promise<void> {
  await requireRole(["admin"]);

  const previous = getSiteSetting(HOME_PHOTO_SETTING_KEY);
  if (previous) {
    deleteUpload(previous);
    deleteSiteSetting(HOME_PHOTO_SETTING_KEY);
  }

  revalidatePath("/");
  revalidatePath("/configuracion/inicio");
}
