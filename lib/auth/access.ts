/**
 * Autorización fina por rol (recorte de la fase de autenticación, retomado
 * a pedido del usuario). Hasta acá, `requireRole` solo gateaba pantallas
 * completas (Configuración → Usuarios); esto agrega el segundo nivel: qué
 * fila de datos puede ver o editar cada rol dentro de una misma pantalla.
 *
 * Modelo confirmado con el usuario:
 * - `admin` / `calidad`: ven y editan todo, sin filtrar por área.
 * - `responsable_area`: solo ve/edita los registros, riesgos, objetivos e
 *   indicadores de SU área (`users.area_id`). El resto de la empresa no
 *   aparece en sus listados.
 * - `consulta`: igual que `responsable_area` pero sin poder editar nada —
 *   pensado para alguien que solo necesita mirar un área puntual.
 * - `colaborador`: no navega el Registro de Gestión / Riesgos / Objetivos /
 *   Indicadores completos — solo "Mi SGC" (lo que reportó o tiene asignado,
 *   ver `lib/mi-sgc-data.ts`) y puede reportar situaciones nuevas. Sí puede
 *   ver el detalle de un registro puntual si es el reportante o el
 *   responsable de esa acción (para que los links desde Mi SGC funcionen).
 */
import "server-only";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/dal";
import type { PortalUser } from "@/lib/db/queries";

export type AreaScoped = { area_id: string | null };

export function hasFullAreaAccess(role: string): boolean {
  return role === "admin" || role === "calidad";
}

export function isReadOnlyRole(role: string): boolean {
  return role === "consulta";
}

/** `colaborador` no navega los listados de gestión — solo Mi SGC y Reportar. */
export function canBrowseGestion(role: string): boolean {
  return role !== "colaborador";
}

/**
 * "Tickets Plane" es una cola de trabajo (tipificar/vincular/descartar), no
 * una pantalla de solo consulta — a diferencia del resto de las pantallas de
 * gestión, acá `consulta` tampoco entra (no tiene sentido un rol de solo
 * lectura en una pantalla que es 100% acciones).
 */
export function canAccessTicketsPlane(role: string): boolean {
  return role === "admin" || role === "calidad" || role === "responsable_area";
}

export function canViewAreaScoped(item: AreaScoped, user: PortalUser): boolean {
  if (hasFullAreaAccess(user.role)) return true;
  if (user.role === "responsable_area" || user.role === "consulta") {
    return item.area_id !== null && item.area_id === user.area_id;
  }
  return false;
}

export function canEditAreaScoped(item: AreaScoped, user: PortalUser): boolean {
  if (isReadOnlyRole(user.role)) return false;
  return canViewAreaScoped(item, user);
}

/** Recorta un listado a lo que el usuario puede ver según su rol/área. */
export function filterByAreaAccess<T extends AreaScoped>(items: T[], user: PortalUser): T[] {
  if (hasFullAreaAccess(user.role)) return items;
  if (user.role === "responsable_area" || user.role === "consulta") {
    return items.filter((item) => item.area_id === user.area_id);
  }
  return [];
}

const DIACRITICS_PATTERN = new RegExp("[\\u0300-\\u036f]", "g");

function normalizeName(value: string | null | undefined): string {
  return (value ?? "").normalize("NFD").replace(DIACRITICS_PATTERN, "").trim().toLowerCase();
}

type OwnableRecord = {
  reporter_name: string;
  correction_responsible: string | null;
  effectiveness_responsible: string | null;
};

/** Un `colaborador` no navega el Registro completo, pero sí puede ver un registro puntual si lo reportó o es responsable de su corrección/verificación (para que los links desde Mi SGC funcionen). */
export function isRecordOwner(record: OwnableRecord, user: PortalUser): boolean {
  const target = normalizeName(user.name);
  if (!target) return false;
  return (
    normalizeName(record.reporter_name) === target ||
    normalizeName(record.correction_responsible) === target ||
    normalizeName(record.effectiveness_responsible) === target
  );
}

/** Ver un registro puntual: por área (según rol) o por ser quien lo reportó/gestiona. */
export function canViewRecord(record: AreaScoped & OwnableRecord, user: PortalUser): boolean {
  return canViewAreaScoped(record, user) || isRecordOwner(record, user);
}

/**
 * Para Server Actions que editan una entidad con área — exige sesión real y
 * corta con un mensaje claro si el usuario no puede editar ESA entidad
 * puntual (rol de solo lectura, o área distinta a la suya).
 */
export async function requireEditAccess<T extends AreaScoped>(item: T): Promise<PortalUser> {
  const user = await requireUser();
  if (!canEditAreaScoped(item, user)) {
    throw new Error("No tenés permiso para editar este registro — no pertenece a tu área, o tu rol es de solo lectura.");
  }
  return user;
}

/**
 * Para páginas de listado (Registro, Riesgos, Objetivos, Indicadores,
 * Tickets Plane) — redirige a Mi SGC si el rol no puede navegar estas
 * pantallas (`colaborador`).
 */
export async function requireGestionAccess(): Promise<PortalUser> {
  const user = await requireUser();
  if (!canBrowseGestion(user.role)) redirect("/mi-sgc");
  return user;
}

/**
 * Para las pantallas "nuevo" (crear riesgo/objetivo/indicador) — a
 * diferencia de navegar un listado, `consulta` tampoco debería ver el
 * formulario de alta (fallaría al guardar igual, pero no tiene sentido
 * mostrárselo). Redirige a la lista correspondiente si el rol es de solo
 * lectura.
 */
export async function requireCreateAccess(listPath: string): Promise<PortalUser> {
  const user = await requireGestionAccess();
  if (isReadOnlyRole(user.role)) redirect(listPath);
  return user;
}

/** Para las pantallas de "Tickets Plane" (tipificar/vincular/descartar) — ver `canAccessTicketsPlane`. */
export async function requireTicketsPlaneAccess(): Promise<PortalUser> {
  const user = await requireUser();
  if (!canAccessTicketsPlane(user.role)) redirect("/mi-sgc");
  return user;
}
