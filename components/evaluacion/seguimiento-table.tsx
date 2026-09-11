"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { SeguimientoItem } from "@/lib/seguimiento-data";

function formatDue(item: SeguimientoItem): string {
  if (item.overdue) return `Vencido hace ${item.daysOverdue} día${item.daysOverdue === 1 ? "" : "s"}`;
  if (item.daysOverdue === 0) return "Vence hoy";
  const remaining = Math.abs(item.daysOverdue);
  return `En ${remaining} día${remaining === 1 ? "" : "s"}`;
}

function dueTone(item: SeguimientoItem): BadgeTone {
  if (item.overdue) return "red";
  if (item.daysOverdue >= -7) return "amber";
  return "gray";
}

export function SeguimientoTable({ items, areas }: { items: SeguimientoItem[]; areas: { id: string; name: string }[] }) {
  const [query, setQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState("todas");
  const [estadoFilter, setEstadoFilter] = useState<"todos" | "vencidos" | "proximos">("todos");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesArea = areaFilter === "todas" || item.areaId === areaFilter;
      const matchesEstado =
        estadoFilter === "todos" ||
        (estadoFilter === "vencidos" && item.overdue) ||
        (estadoFilter === "proximos" && !item.overdue && item.daysOverdue >= -7);
      const matchesQuery =
        !q || item.code.toLowerCase().includes(q) || item.title.toLowerCase().includes(q) || item.owner.toLowerCase().includes(q);
      return matchesArea && matchesEstado && matchesQuery;
    });
  }, [items, query, areaFilter, estadoFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="text"
            placeholder="Buscar por código, título o responsable"
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
        <select
          value={estadoFilter}
          onChange={(event) => setEstadoFilter(event.target.value as typeof estadoFilter)}
          className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-avenida-black focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20"
        >
          <option value="todos">Todos</option>
          <option value="vencidos">Vencidos</option>
          <option value="proximos">Próximos 7 días</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-8 text-center">
          <p className="text-sm text-muted">
            {items.length === 0
              ? "No hay nada abierto con vencimiento cargado por ahora."
              : "No encontramos nada para los filtros elegidos."}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-avenida-violet-light/20 text-left text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Código</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Título</th>
                  <th className="px-4 py-3 font-medium">Área</th>
                  <th className="px-4 py-3 font-medium">Responsable</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Vencimiento</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.code} className="border-b border-border last:border-0 hover:bg-avenida-violet-light/10">
                    <td className="px-4 py-3">
                      <Link href={item.href} className="font-medium text-avenida-violet hover:underline">
                        {item.code}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone="gray">{item.type}</Badge>
                    </td>
                    <td className="max-w-[240px] truncate px-4 py-3 text-avenida-black">{item.title}</td>
                    <td className="px-4 py-3 text-muted">{item.area}</td>
                    <td className="px-4 py-3 text-muted">{item.owner}</td>
                    <td className="px-4 py-3 text-muted">{item.status}</td>
                    <td className="px-4 py-3">
                      <Badge tone={dueTone(item)}>{formatDue(item)}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
