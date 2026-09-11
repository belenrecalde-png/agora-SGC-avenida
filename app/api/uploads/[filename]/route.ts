import { NextResponse, type NextRequest } from "next/server";
import { isSafeUploadFilename, readUpload } from "@/lib/uploads";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/**
 * Sirve archivos subidos desde el portal (ver `lib/uploads.ts`). El nombre de
 * archivo siempre lo generamos nosotros al subir (timestamp + extensión), así
 * que nunca se reutiliza — se puede cachear como inmutable sin riesgo de
 * servir una versión vieja bajo el mismo nombre.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!isSafeUploadFilename(filename)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const buffer = readUpload(filename);
  if (!buffer) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const ext = filename.split(".").pop() ?? "";
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
