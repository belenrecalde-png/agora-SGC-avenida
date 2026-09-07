"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Area, SgcRisk } from "@/lib/db/queries";
import { getRiskBand, getRiskScore, type RiskKind } from "@/lib/risk-scoring";

const PROBABILITIES = [3, 2, 1];
const IMPACTS = [1, 2, 3, 4, 5];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

function RiskMatrix({
  risks,
  kind,
  selectedCell,
  onSelectCell,
}: {
  risks: SgcRisk[];
  kind: RiskKind;
  selectedCell: { probability: number; impact: number } | null;
  onSelectCell: (cell: { probability: number; impact: number } | null) => void;
}) {
  const countAt = (probability: number, impact: number) =>
    risks.filter((r) => r.probability_initial === probability && r.impact_initial === impact).length;

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-avenida-black">Matriz probabilidad × impacto</p>
        {selectedCell && (
          <button
            type="button"
            onClick={() => onSelectCell(null)}
            className="text-xs font-medium text-avenida-violet hover:underline"
          >
            Quitar filtro de celda
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="w-16" />
              {IMPACTS.map((impact) => (
                <th key={impact} className="px-1 pb-1 text-xs font-medium text-muted">
                  Imp. {impact}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PROBABILITIES.map((probability) => (
              <tr key={probability}>
                <th className="pr-2 text-right text-xs font-medium text-muted">Prob. {probability}</th>
                {IMPACTS.map((impact) => {
                  const score = getRiskScore(probability, impact);
                  const band = getRiskBand(kind, score);
                  const count = countAt(probability, impact);
                  const isSelected = selectedCell?.probability === probability && selectedCell?.impact === impact;
                  return (
                    <td key={impact}>
                      <button
                        type="button"
                        onClick={() => onSelectCell(isSelected ? null : { probability, impact })}
                        className={cn(
                          "flex h-12 w-12 flex-col items-center justify-center rounded-lg text-xs font-semibold transition-transform",
                          BADGE_BG[band.tone],
                          isSelected ? "ring-2 ring-avenida-violet ring-offset-1" : "hover:scale-105",
                        )}
                      >
                        {count > 0 ? count : ""}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

const BADGE_BG: Record<string, string> = {
  violet: "bg-avenida-violet-light text-avenida-violet",
  blue: "bg-blue-50 text-avenida-blue",
  gray: "bg-avenida-gray/40 text-avenida-black",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-600",
};

export function RiesgosExplorer({ risks, areas }: { risks: SgcRisk[]; areas: Area[] }) {
  const [kind, setKind] = useState<RiskKind>("riesgo");
  const [query, setQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState("todas");
  const [selectedCell, setSelectedCell] = useState<{ probability: number; impact: number } | null>(null);

  const areaById = useMemo(() => new Map(areas.map((a) => [a.id, a])), [areas]);

  const byKind = useMemo(() => risks.filter((r) => r.kind === kind), [risks, kind]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return byKind.filter((risk) => {
      const matchesArea = areaFilter === "todas" || risk.area_id === areaFilter;
      const matchesCell =
        !selectedCell ||
        (risk.probability_initial === selectedCell.probability && risk.impact_initial === selectedCell.impact);
      const matchesQuery =
        !q || risk.code.toLowerCase().includes(q) || risk.description.toLowerCase().includes(q);
      return matchesArea && matchesCell && matchesQuery;
    });
  }, [byKind, query, areaFilter, selectedCell]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 rounded-xl bg-avenida-violet-light/30 p-1">
        {(["riesgo", "oportunidad"] as RiskKind[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setKind(option);
              setSelectedCell(null);
            }}
            className={cn(
              "flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              kind === option ? "bg-white text-avenida-violet shadow-sm" : "text-muted hover:text-avenida-black",
            )}
          >
            {option === "riesgo" ? "Riesgos" : "Oportunidades"}
          </button>
        ))}
      </div>

      <RiskMatrix risks={byKind} kind={kind} selectedCell={selectedCell} onSelectCell={setSelectedCell} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="text"
            placeholder="Buscar por código o descripción"
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
            {byKind.length === 0
              ? `Todavía no hay ${kind === "oportunidad" ? "oportunidades" : "riesgos"} cargados.`
              : "No encontramos resultados para los filtros elegidos."}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-avenida-violet-light/20 text-left text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Código</th>
                  <th className="px-4 py-3 font-medium">Descripción</th>
                  <th className="px-4 py-3 font-medium">Área</th>
                  <th className="px-4 py-3 font-medium">Valoración inicial</th>
                  <th className="px-4 py-3 font-medium">Responsable</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Fecha objetivo</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((risk) => {
                  const area = risk.area_id ? areaById.get(risk.area_id) : undefined;
                  const score = getRiskScore(risk.probability_initial, risk.impact_initial);
                  const band = getRiskBand(risk.kind, score);
                  return (
                    <tr key={risk.id} className="border-b border-border last:border-0 hover:bg-avenida-violet-light/10">
                      <td className="px-4 py-3">
                        <Link
                          href={`/planificacion/riesgos-y-oportunidades/${risk.code}`}
                          className="font-medium text-avenida-violet hover:underline"
                        >
                          {risk.code}
                        </Link>
                      </td>
                      <td className="max-w-[280px] truncate px-4 py-3 text-avenida-black">{risk.description}</td>
                      <td className="px-4 py-3 text-muted">{area?.name ?? "Sin definir"}</td>
                      <td className="px-4 py-3">
                        <Badge tone={band.tone}>{score !== null ? `${score} — ${band.label}` : band.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted">{risk.responsible ?? "Sin definir"}</td>
                      <td className="px-4 py-3 text-muted">{risk.status}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted">
                        {risk.due_date ? formatDate(`${risk.due_date}T00:00:00`) : "Sin definir"}
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
