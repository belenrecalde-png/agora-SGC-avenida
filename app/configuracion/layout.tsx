import { requireRole } from "@/lib/auth/dal";

/**
 * Configuración es solo para Administrador SGC y Calidad — antes de esto,
 * la mayoría de las pantallas del menú (Áreas, Tipos, Estados, Plane,
 * Procesos, Roles, Apps Script, Integraciones, Logs) no tenían ningún
 * chequeo de rol propio, solo el optimista de `proxy.ts` (¿hay sesión?),
 * así que cualquier persona logueada podía entrar y, en varias, editar
 * datos globales. Este layout corta todo `/configuracion/*` de una vez;
 * `requireRole(["admin"])` en Usuarios y Página de inicio sigue aplicando
 * arriba de esto para el subconjunto que ni Calidad debería tocar.
 */
export default async function ConfiguracionLayout({ children }: LayoutProps<"/configuracion">) {
  await requireRole(["admin", "calidad"]);
  return children;
}
