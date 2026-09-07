"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Area, RecordType, SgcRecord } from "@/lib/db/queries";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

function statusTone(status: string): BadgeTone {
  if (status === "Cerrado") return "green";
  if (status === "Rechazado") return "gray";
  if (status === "En análisis" || status === "En curso") return "violet";
  return "blue";
}

function priorityTone(priority: string): BadgeTone {
  if (priority === "Alta") return "red";
  if (priority === "Media") return "amber";
  return "green";
}

export function RegistroTable({
  records,
  types,
  areas,
}: {
  records: SgcRecord[];
  types: RecordType[];
  areas: Area[];
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("todos");
  const [areaFilter, setAreaFilter] = useState<string>("todas");

  const typeById = useMemo(() => new Map(types.map((t) => [t.id, t])), [types]);
  const areaById = useMemo(() => new Map(areas.map((a) => [a.id, a])), [areas]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((record) => {
      const matchesType = typeFilter === "todos" || record.type_id === typeFilter;
      const matchesArea = areaFilter === "todas" || record.area_id === areaFilter;
      const matchesQuery =
        !q ||
        record.code.toLowerCase().includes(q) ||
        record.title.toLowerCase().includes(q) ||
        record.reporter_name.toLowerCase().includes(q);
      return matchesType && matchesArea && matchesQuery;
    });
  }, [records, query, typeFilter, areaFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="text"
            placeholder="Buscar por código, título o quién reportó"
            className="h-10 w-full rounded-xl border border-border bg-white pl-9 pr-3 text-sm text-avenida-black placeholder:text-muted focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
          className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-avenida-black focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20"
        >
          <option value="todos">Todos los tipos</option>
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.code} — {type.name}
            </option>
          ))}
        </select>
        <select
          value={areaFilter}
          onChange={(event) => setAreaFilter(event.target.value)}
          className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-avenida-black focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20"
        >
          <option value="todas">Todas las áreas</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-8 text-center">
          <p className="text-sm text-muted">
            {records.length === 0
              ? "Todavía no hay registros cargados. El primer reporte que se envíe va a aparecer acá."
              : `No encontramos registros para los filtros elegidos.`}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-avenida-violet-light/20 text-left text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Código</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Título</th>
                  <th className="px-4 py-3 font-medium">Área</th>
                  <th className="px-4 py-3 font-medium">Reportado por</th>
                  <th className="px-4 py-3 font-medium">Prioridad</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Creado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => {
                  const type = typeById.get(record.type_id);
                  const area = record.area_id ? areaById.get(record.area_id) : undefined;
                  return (
                    <tr key={record.id} className="border-b border-border last:border-0 hover:bg-avenida-violet-light/10">
                      <td className="px-4 py-3">
                        <Link
                          href={`/gestion-calidad/registro/${record.code}`}
                          className="font-medium text-avenida-violet hover:underline"
                        >
                          {record.code}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {type && <Badge tone={type.color as BadgeTone}>{type.code}</Badge>}
                      </td>
                      <td className="max-w-[240px] truncate px-4 py-3 text-avenida-black">{record.title}</td>
                      <td className="px-4 py-3 text-muted">{area?.name ?? "Sin definir"}</td>
                      <td className="px-4 py-3 text-muted">{record.reporter_name}</td>
                      <td className="px-4 py-3">
                        <Badge tone={priorityTone(record.priority)}>{record.priority}</Badge>
                        {record.urgent && (
                          <span className="ml-1.5 text-xs font-medium text-red-600">Urgente</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={statusTone(record.status)}>{record.status}</Badge>
                      </td>
                      <td className={cn("whitespace-nowrap px-4 py-3 text-muted")}>{formatDate(record.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
