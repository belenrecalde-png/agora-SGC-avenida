import { ListChecks, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { RegistroTable } from "@/components/gestion-calidad/registro-table";
import { listAreas, listRecords, listRecordTypes } from "@/lib/db/queries";
import { filterByAreaAccess, requireGestionAccess } from "@/lib/auth/access";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Registro SGC | Ágora`,
};

export default async function RegistroSgcPage() {
  const user = await requireGestionAccess();
  const records = filterByAreaAccess(listRecords(), user);
  const types = listRecordTypes();
  const areas = listAreas();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
            <ListChecks className="h-6 w-6" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Gestión de Calidad</p>
            <h1 className="text-2xl font-semibold text-avenida-black">Registro SGC</h1>
          </div>
        </div>
        <LinkButton href="/reportar" className="shrink-0">
          <Flag className="h-4 w-4" />
          Reportar una situación
        </LinkButton>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-avenida-black">
          Todos los reportes cargados en Ágora (NC, AC, AP, OM, Q, S, R), en un solo listado.
        </p>
        <Badge tone="gray" className="w-fit">
          {records.length} {records.length === 1 ? "registro" : "registros"}
        </Badge>
      </div>

      <RegistroTable records={records} types={types} areas={areas} />
    </div>
  );
}
