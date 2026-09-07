import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * Cliente de Google OAuth2 (hand-rolled, ver justificación en
 * `lib/auth/session.ts` y `claude/progreso-implementacion.md`). Solo el
 * flujo "Authorization Code" estándar — sin SDK de Google, sin librería de
 * auth de terceros.
 */

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const ISSUER_ALLOWLIST = new Set(["https://accounts.google.com", "accounts.google.com"]);

const googleJwks = createRemoteJWKSet(new URL(JWKS_URL));

export function isGoogleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.APP_URL);
}

function getRedirectUri(): string {
  const appUrl = process.env.APP_URL;
  if (!appUrl) throw new Error("Falta APP_URL en las variables de entorno.");
  return `${appUrl.replace(/\/$/, "")}/api/auth/callback`;
}

export function getGoogleAuthUrl(state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("Falta GOOGLE_CLIENT_ID en las variables de entorno.");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN;
  if (allowedDomain) params.set("hd", allowedDomain);

  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

export type GoogleUser = {
  email: string;
  name: string;
  picture: string | null;
};

/**
 * Intercambia el `code` por tokens, verifica el ID token contra las claves
 * públicas de Google (no basta con decodificarlo sin verificar — cualquiera
 * podría mandar un JWT armado a mano) y valida el dominio del email
 * server-side. El parámetro `hd` de `getGoogleAuthUrl` es solo un *hint*
 * visual para Google — nunca una garantía de seguridad, por eso se
 * revalida acá.
 */
export async function exchangeCodeForUser(code: string): Promise<GoogleUser> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Google no está configurado.");

  const tokenResponse = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getRedirectUri(),
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error(`No se pudo intercambiar el código con Google (HTTP ${tokenResponse.status}).`);
  }

  const tokenData = (await tokenResponse.json()) as { id_token?: string };
  if (!tokenData.id_token) throw new Error("Google no devolvió un id_token.");

  const { payload } = await jwtVerify(tokenData.id_token, googleJwks, {
    audience: clientId,
  });

  if (typeof payload.iss !== "string" || !ISSUER_ALLOWLIST.has(payload.iss)) {
    throw new Error("El id_token de Google tiene un issuer inesperado.");
  }
  if (payload.email_verified !== true || typeof payload.email !== "string") {
    throw new Error("Google no confirmó el email de la cuenta.");
  }

  const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN;
  if (allowedDomain && !payload.email.toLowerCase().endsWith(`@${allowedDomain.toLowerCase()}`)) {
    throw new Error(`Solo se permiten cuentas del dominio @${allowedDomain}.`);
  }

  return {
    email: payload.email,
    name: typeof payload.name === "string" ? payload.name : payload.email,
    picture: typeof payload.picture === "string" ? payload.picture : null,
  };
}
