import { Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listAreas } from "@/lib/db/queries";
import { createAreaAction, toggleAreaAction } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Áreas | Ágora`,
};

export default function AreasPage() {
  const areas = listAreas();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-12">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
          <Building2 className="h-6 w-6" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Configuración</p>
          <h1 className="text-2xl font-semibold text-avenida-black">Áreas</h1>
        </div>
      </div>

      <p className="text-sm text-avenida-black">
        Áreas de Avenida+ usadas para clasificar registros, procesos y responsables. Se usan en el
        formulario de Reportar y en el Registro SGC.
      </p>

      <Card className="flex flex-col divide-y divide-border p-0">
        {areas.map((area) => (
          <div key={area.id} className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-avenida-black">{area.name}</span>
              {!area.active && <Badge tone="gray">Inactiva</Badge>}
            </div>
            <form action={toggleAreaAction}>
              <input type="hidden" name="id" value={area.id} />
              <Button type="submit" variant="secondary" size="sm">
                {area.active ? "Desactivar" : "Activar"}
              </Button>
            </form>
          </div>
        ))}
      </Card>

      <Card className="flex flex-col gap-3 p-5">
        <p className="text-sm font-semibold text-avenida-black">Agregar área</p>
        <form action={createAreaAction} className="flex flex-col gap-3 sm:flex-row">
          <input
            name="name"
            type="text"
            required
            placeholder="Ej: Legales"
            className="h-10 flex-1 rounded-xl border border-border bg-white px-3 text-sm text-avenida-black placeholder:text-muted focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20"
          />
          <Button type="submit" className="shrink-0">
            Agregar
          </Button>
        </form>
      </Card>
    </div>
  );
}
