/**
 * Almacenamiento de archivos subidos desde el portal (ej. la foto del Home,
 * Configuración → Página de inicio). Se guardan en el filesystem, junto a
 * `data/agora.db` — mismo criterio que la base: requiere un host con
 * filesystem persistente (Fly.io/Railway), no serverless. No usa `public/`
 * a propósito, para no mezclar assets subidos en tiempo de ejecución con los
 * assets estáticos del build; se sirven aparte vía `app/api/uploads/[filename]`.
 */
import "server-only";
import fs from "node:fs";
import path from "node:path";

const UPLOADS_DIR = path.join(process.cwd(), "data", "uploads");

/** Nombres de archivo válidos para servir/leer — nada de rutas ni `..`, solo lo que nosotros mismos generamos al subir. */
const SAFE_FILENAME = /^[a-z0-9-]+\.(jpg|jpeg|png|webp)$/;

export function isSafeUploadFilename(filename: string): boolean {
  return SAFE_FILENAME.test(filename);
}

export function saveUpload(filename: string, buffer: Buffer): void {
  if (!isSafeUploadFilename(filename)) throw new Error("Nombre de archivo inválido.");
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
}

export function readUpload(filename: string): Buffer | null {
  if (!isSafeUploadFilename(filename)) return null;
  const filePath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath);
}

export function deleteUpload(filename: string): void {
  if (!isSafeUploadFilename(filename)) return;
  const filePath = path.join(UPLOADS_DIR, filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}
