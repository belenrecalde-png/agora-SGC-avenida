import { UserCog } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/dal";
import { ROLES, ROLE_LABELS } from "@/lib/auth/roles";
import { listAreas, listUsers } from "@/lib/db/queries";
import { toggleUserActiveAction, updateUserRoleAction } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Usuarios | Ágora`,
};

const selectClass =
  "h-9 rounded-lg border border-border bg-white px-2 text-sm text-avenida-black focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20";

function formatDate(iso: string | null): string {
  if (!iso) return "Nunca";
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function UsuariosPage() {
  // Gateada a admin — un Colaborador que entre directo a esta URL no debería
  // ver ni poder tocar los roles de nadie.
  await requireRole(["admin"]);

  const users = listUsers();
  const areas = listAreas();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-12">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
          <UserCog className="h-6 w-6" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Configuración</p>
          <h1 className="text-2xl font-semibold text-avenida-black">Usuarios</h1>
        </div>
      </div>

      <p className="text-sm text-avenida-black">
        Cada persona se da de alta sola al loguearse con su cuenta de Google de la empresa — acá se
        les asigna el rol (y el área, si corresponde) y se puede desactivar el acceso.
      </p>

      {users.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-8 text-center">
          <p className="text-sm text-muted">Todavía no inició sesión nadie.</p>
        </Card>
      ) : (
        <Card className="flex flex-col divide-y divide-border p-0">
          {users.map((user) => (
            <div key={user.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="avatar-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
                  {user.name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((p) => p[0]?.toUpperCase())
                    .join("")}
                </span>
                <div className="flex flex-col">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-avenida-black">
                    {user.name}
                    {!user.active && <Badge tone={"gray" as BadgeTone}>Inactivo</Badge>}
                  </span>
                  <span className="text-xs text-muted">
                    {user.email} · último ingreso: {formatDate(user.last_login_at)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <form action={updateUserRoleAction} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="userId" value={user.id} />
                  <select name="role" defaultValue={user.role} className={selectClass}>
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                  <select name="areaId" defaultValue={user.area_id ?? ""} className={selectClass}>
                    <option value="">Sin área</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" variant="secondary" size="sm">
                    Guardar
                  </Button>
                </form>
                <form action={toggleUserActiveAction}>
                  <input type="hidden" name="userId" value={user.id} />
                  <Button type="submit" variant="secondary" size="sm">
                    {user.active ? "Desactivar" : "Activar"}
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
