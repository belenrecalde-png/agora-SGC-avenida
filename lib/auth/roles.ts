/**
 * Roles del portal, tal como los define la spec (sección 60–64). Viven en
 * código, no en la base — la columna `users.role` es texto libre a
 * propósito, para no tener que migrar el esquema si se agrega un rol nuevo.
 */
export const ROLES = ["admin", "calidad", "responsable_area", "colaborador", "consulta"] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador SGC",
  calidad: "Calidad",
  responsable_area: "Responsable de Área",
  colaborador: "Colaborador",
  consulta: "Consulta",
};

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

/** `ADMIN_EMAILS` es una lista separada por comas — nunca se pide ni se inventa un valor real en el chat. */
export function isAdminEmail(email: string): boolean {
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}
