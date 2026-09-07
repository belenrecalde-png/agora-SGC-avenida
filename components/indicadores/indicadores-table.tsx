"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Area, SgcIndicator } from "@/lib/db/queries";
import { getIndicatorToleranceStatus } from "@/lib/indicator-scoring";

export function IndicadoresTable({ indicators, areas }: { indicators: SgcIndicator[]; areas: Area[] }) {
  const [query, setQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState("todas");

  const areaById = useMemo(() => new Map(areas.map((a) => [a.id, a])), [areas]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return indicators.filter((indicator) => {
      const matchesArea = areaFilter === "todas" || indicator.area_id === areaFilter;
      const matchesQuery =
        !q || indicator.code.toLowerCase().includes(q) || indicator.name.toLowerCase().includes(q);
      return matchesArea && matchesQuery;
    });
  }, [indicators, query, areaFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="text"
            placeholder="Buscar por código o nombre"
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
            {indicators.length === 0
              ? "Todavía no hay indicadores cargados."
              : "No encontramos indicadores para los filtros elegidos."}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-avenida-violet-light/20 text-left text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Código</th>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Área</th>
                  <th className="px-4 py-3 font-medium">Responsable</th>
                  <th className="px-4 py-3 font-medium">Resultado actual</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((indicator) => {
                  const area = indicator.area_id ? areaById.get(indicator.area_id) : undefined;
                  const status = getIndicatorToleranceStatus(indicator);
                  return (
                    <tr key={indicator.id} className="border-b border-border last:border-0 hover:bg-avenida-violet-light/10">
                      <td className="px-4 py-3">
                        <Link
                          href={`/evaluacion/indicadores/${indicator.code}`}
                          className="font-medium text-avenida-violet hover:underline"
                        >
                          {indicator.code}
                        </Link>
                      </td>
                      <td className="max-w-[280px] truncate px-4 py-3 text-avenida-black">{indicator.name}</td>
                      <td className="px-4 py-3 text-muted">{area?.name ?? "Sin definir"}</td>
                      <td className="px-4 py-3 text-muted">{indicator.responsible ?? "Sin definir"}</td>
                      <td className="px-4 py-3 text-muted">
                        {indicator.current_result ?? "Sin definir"}
                        {indicator.target_value !== null ? ` (meta: ${indicator.target_value}${indicator.unit ? ` ${indicator.unit}` : ""})` : ""}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={status.tone}>{status.label}</Badge>
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
