import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

/**
 * Sesión propia del portal (Fase de autenticación). Hand-rolled siguiendo al
 * pie de la letra la guía oficial de Next.js 16
 * (`node_modules/next/dist/docs/01-app/02-guides/authentication.md`,
 * sección "Stateless Sessions") en vez de una librería de auth de terceros —
 * ver la justificación completa en `claude/progreso-implementacion.md`.
 *
 * La sesión es un JWT firmado (no cifrado — no lleva nada sensible, solo
 * email/nombre/rol, que ya vienen del propio Google) guardado en una cookie
 * httpOnly. No hay tabla de sesiones en la base: el JWT expira solo, y
 * `getSession()` siempre re-valida el usuario contra la tabla `users` en
 * `lib/auth/dal.ts` para los chequeos que importan de verdad (`proxy.ts`
 * solo hace el chequeo optimista de que la cookie exista y sea válida).
 */

const COOKIE_NAME = "agora_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 días — portal interno, sin refresh contra Google.

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  role: string;
};

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "Falta AUTH_SESSION_SECRET en las variables de entorno — generalo con `openssl rand -base64 32` y agregalo a .env.local.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function encryptSession(user: SessionUser): Promise<string> {
  return new SignJWT({ email: user.email, name: user.name, picture: user.picture, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

/**
 * Exportada (a diferencia de las otras funciones internas de este archivo)
 * para que `proxy.ts` pueda hacer el chequeo optimista de la Fase de
 * autenticación sin duplicar la lógica de verificación del JWT.
 */
export async function decryptSession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ["HS256"] });
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.name !== "string" || typeof payload.role !== "string") {
      return null;
    }
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: typeof payload.picture === "string" ? payload.picture : null,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

/**
 * Sesión "optimista": solo desencripta el JWT de la cookie, no toca la base.
 * `React.cache` evita desencriptar más de una vez por request. Para el
 * usuario real (verificado contra `users`, con `active`/rol al día) usar
 * `requireUser()`/`getCurrentUser()` de `lib/auth/dal.ts`.
 */
export const getSession = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return decryptSession(token);
});

export async function createSessionCookie(user: SessionUser): Promise<void> {
  const token = await encryptSession(user);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
