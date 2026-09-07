import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForUser } from "@/lib/auth/google";
import { createSessionCookie } from "@/lib/auth/session";
import { isAdminEmail } from "@/lib/auth/roles";
import { upsertUserFromGoogle } from "@/lib/db/queries";

const STATE_COOKIE = "agora_oauth_state";

/**
 * Callback de Google: recibe `code`+`state`, valida el `state` anti-CSRF
 * contra la cookie que dejó `/api/auth/login`, intercambia el código,
 * hace upsert del usuario en `users` y crea la cookie de sesión propia.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/login?error=state", request.url));
  }

  try {
    const googleUser = await exchangeCodeForUser(code);
    const user = upsertUserFromGoogle({
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
      forceAdmin: isAdminEmail(googleUser.email),
    });

    if (!user.active) {
      return NextResponse.redirect(new URL("/login?error=inactive", request.url));
    }

    await createSessionCookie({
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role,
    });

    // El `state` puede traer un "next" codificado adentro (ver
    // /api/auth/login) para volver a la página que el usuario quería ver
    // antes de que `proxy.ts` lo mandara a /login.
    const [, encodedNext] = state.split("|");
    const next = encodedNext ? decodeURIComponent(encodedNext) : "/";
    const isSafeNext = next.startsWith("/") && !next.startsWith("//");

    return NextResponse.redirect(new URL(isSafeNext ? next : "/", request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido al iniciar sesión.";
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, request.url));
  }
}
