import { Flag, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { RegistroTable } from "@/components/gestion-calidad/registro-table";
import type { Area, RecordType, SgcRecord } from "@/lib/db/queries";

export function TipoRegistroView({
  title,
  description,
  icon: Icon,
  records,
  types,
  areas,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  records: SgcRecord[];
  types: RecordType[];
  areas: Area[];
}) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
            <Icon className="h-6 w-6" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Gestión de Calidad</p>
            <h1 className="text-2xl font-semibold text-avenida-black">{title}</h1>
          </div>
        </div>
        <LinkButton href="/reportar" className="shrink-0">
          <Flag className="h-4 w-4" />
          Reportar una situación
        </LinkButton>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-avenida-black">{description}</p>
        <Badge tone="gray" className="w-fit">
          {records.length} {records.length === 1 ? "registro" : "registros"}
        </Badge>
      </div>

      <RegistroTable records={records} types={types} areas={areas} hideTypeFilter />
    </div>
  );
}
