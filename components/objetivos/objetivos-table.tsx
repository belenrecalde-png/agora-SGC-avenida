"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { Area, SgcObjective } from "@/lib/db/queries";

function statusTone(status: string): BadgeTone {
  if (status === "Cumplido") return "green";
  if (status === "Incumplido") return "red";
  if (status === "En riesgo") return "amber";
  return "blue";
}

export function ObjetivosTable({ objectives, areas }: { objectives: SgcObjective[]; areas: Area[] }) {
  const [query, setQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState("todas");

  const areaById = useMemo(() => new Map(areas.map((a) => [a.id, a])), [areas]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return objectives.filter((objective) => {
      const matchesArea = areaFilter === "todas" || objective.area_id === areaFilter;
      const matchesQuery =
        !q || objective.code.toLowerCase().includes(q) || objective.title.toLowerCase().includes(q);
      return matchesArea && matchesQuery;
    });
  }, [objectives, query, areaFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="text"
            placeholder="Buscar por código o título"
            className="h-10 w-full rounded-xl border border-border bg-white pl-9 pr-3 text-sm text-avenida-black placeholder:text-muted focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20"
          />
        </div>
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
            {objectives.length === 0
              ? "Todavía no hay objetivos cargados."
              : "No encontramos objetivos para los filtros elegidos."}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-avenida-violet-light/20 text-left text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Código</th>
                  <th className="px-4 py-3 font-medium">Objetivo</th>
                  <th className="px-4 py-3 font-medium">Área</th>
                  <th className="px-4 py-3 font-medium">Responsable</th>
                  <th className="px-4 py-3 font-medium">Resultado actual</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((objective) => {
                  const area = objective.area_id ? areaById.get(objective.area_id) : undefined;
                  return (
                    <tr key={objective.id} className="border-b border-border last:border-0 hover:bg-avenida-violet-light/10">
                      <td className="px-4 py-3">
                        <Link
                          href={`/planificacion/objetivos-de-calidad/${objective.code}`}
                          className="font-medium text-avenida-violet hover:underline"
                        >
                          {objective.code}
                        </Link>
                      </td>
                      <td className="max-w-[280px] truncate px-4 py-3 text-avenida-black">{objective.title}</td>
                      <td className="px-4 py-3 text-muted">{area?.name ?? "Sin definir"}</td>
                      <td className="px-4 py-3 text-muted">{objective.responsible ?? "Sin definir"}</td>
                      <td className="px-4 py-3 text-muted">
                        {objective.current_result ?? "Sin definir"}
                        {objective.target_value !== null ? ` (meta: ${objective.target_value}${objective.unit ? ` ${objective.unit}` : ""})` : ""}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={statusTone(objective.status)}>{objective.status}</Badge>
                      </td>
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
