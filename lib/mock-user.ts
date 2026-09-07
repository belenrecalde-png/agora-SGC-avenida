/**
 * Usuario "logueado" de ejemplo para el header (isotipo/branding, Fase 2026-09-07).
 *
 * Todavía no existe un sistema de autenticación real en el portal (ver
 * `claude/progreso-implementacion.md`, Fase 3: "Reportado por" hoy es un campo
 * de texto libre en el formulario, no una sesión de usuario). Este mock solo
 * sirve para que el header muestre nombre + rol como en la referencia visual
 * que compartió el usuario, en vez de únicamente iniciales sin contexto.
 *
 * Reemplazar por el usuario real de la sesión el día que se defina
 * autenticación — ese es el mismo punto pendiente ya documentado para
 * Configuración → Usuarios/Roles.
 */
export const CURRENT_USER = {
  name: "María Cortés",
  initials: "MC",
  role: "Calidad",
  org: "Avenida+",
};

/** Cantidad de notificaciones sin leer, mock — todavía no hay backend de notificaciones. */
export const MOCK_UNREAD_NOTIFICATIONS = 3;
