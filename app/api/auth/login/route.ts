import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getGoogleAuthUrl, isGoogleConfigured } from "@/lib/auth/google";

const STATE_COOKIE = "agora_oauth_state";

/**
 * Inicia el login: genera un `state` anti-CSRF y redirige a la pantalla de
 * consentimiento de Google. Si viene `?next=`, se lo lleva codificado
 * adentro del propio `state` (Google lo devuelve tal cual en el callback)
 * para volver a esa página después de loguearse, en vez de siempre `/`.
 */
export async function GET(request: NextRequest) {
  if (!isGoogleConfigured()) {
    return NextResponse.redirect(new URL("/login?error=config", request.url));
  }

  // Solo se acepta un path relativo (nunca "//host" ni una URL absoluta) —
  // evita que alguien arme un link de login que termine mandando a otro sitio.
  const next = request.nextUrl.searchParams.get("next");
  const isSafeNext = Boolean(next) && next!.startsWith("/") && !next!.startsWith("//");
  const state = isSafeNext ? `${randomUUID()}|${encodeURIComponent(next!)}` : randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return NextResponse.redirect(getGoogleAuthUrl(state));
}
