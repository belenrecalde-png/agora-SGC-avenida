import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { absoluteAppUrl } from "@/lib/auth/google";
import { decryptSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";

/**
 * Chequeo optimista de sesión (Next.js 16 renombró `middleware.ts` a
 * `proxy.ts` — ver `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`
 * y la nota completa en `claude/progreso-implementacion.md`). Solo
 * desencripta el JWT de la cookie — nunca toca la base acá (Proxy corre en
 * cada request, incluidos los prefetch; la guía oficial de Next
 * explícitamente pide evitar chequeos contra la base en este archivo). El
 * chequeo "de verdad" (usuario activo, rol al día) vive en
 * `lib/auth/dal.ts` (`requireUser`/`requireRole`), usado en cada página.
 */
const PUBLIC_PATH_PREFIXES = ["/login", "/api/auth"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await decryptSession(token) : null;

  if (!session) {
    const loginUrl = absoluteAppUrl("/login");
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
