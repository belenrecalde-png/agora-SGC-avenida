import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "./session";
import { getUserByEmail, type PortalUser } from "@/lib/db/queries";
import { isRole, type Role } from "./roles";

/**
 * Capa de acceso a datos de autenticación (DAL), siguiendo la guía oficial
 * de Next 16 (`authentication.md`, sección "Creating a Data Access Layer").
 * A diferencia de `getSession()` (optimista, solo el JWT), esto es el
 * chequeo "seguro": siempre revalida contra la tabla `users` — así un
 * cambio de rol o una baja desde Configuración → Usuarios se aplica en el
 * momento, sin esperar a que expire el JWT.
 */

/** Usuario real (verificado contra la base) o `null` si no hay sesión válida o el usuario está inactivo. */
export const getCurrentUser = cache(async (): Promise<PortalUser | null> => {
  const session = await getSession();
  if (!session) return null;
  const user = getUserByEmail(session.email);
  if (!user || !user.active) return null;
  return user;
});

/** Para Server Components/Actions que necesitan sí o sí un usuario logueado — redirige a /login si no. */
export async function requireUser(): Promise<PortalUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Igual que `requireUser`, pero además exige que el rol esté en la lista dada (ej. `requireRole(["admin"])`). */
export async function requireRole(roles: Role[]): Promise<PortalUser> {
  const user = await requireUser();
  if (!isRole(user.role) || !roles.includes(user.role)) {
    redirect("/");
  }
  return user;
}
