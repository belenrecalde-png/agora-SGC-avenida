import { NextResponse, type NextRequest } from "next/server";
import { absoluteAppUrl } from "@/lib/auth/google";
import { createSessionCookie } from "@/lib/auth/session";
import { isAdminEmail } from "@/lib/auth/roles";
import { upsertUserFromGoogle } from "@/lib/db/queries";

/**
 * ⚠️ SOLO para verificar el flujo de sesión sin credenciales reales de
 * Google (mismo criterio que nunca pedir/inventar credenciales de Plane en
 * el chat — acá tampoco hay forma de probar el OAuth real sin la cuenta de
 * Google Cloud del usuario). Crea una sesión directo, sin pasar por Google.
 *
 * Doble gateado a propósito — nunca debe quedar accesible en un despliegue
 * de producción real: (1) `NODE_ENV !== "production"` y (2) además
 * `ENABLE_DEV_LOGIN=true` seteado explícitamente. Ninguno de los dos está
 * activo por default.
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production" || process.env.ENABLE_DEV_LOGIN !== "true") {
    return NextResponse.json({ error: "not_available" }, { status: 404 });
  }

  const email = request.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "missing_email" }, { status: 400 });
  const name = request.nextUrl.searchParams.get("name") ?? email;

  const user = upsertUserFromGoogle({ email, name, picture: null, forceAdmin: isAdminEmail(email) });

  await createSessionCookie({
    id: user.id,
    email: user.email,
    name: user.name,
    picture: user.picture,
    role: user.role,
  });

  return NextResponse.redirect(absoluteAppUrl("/"));
}
