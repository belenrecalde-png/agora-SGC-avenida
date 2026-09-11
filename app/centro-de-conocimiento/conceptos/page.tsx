"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Layers, Search, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CONCEPTS, CONCEPT_CATEGORIES, type ConceptCategory } from "@/lib/concepts-data";

export default function ConceptosPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ConceptCategory | "todas">("todas");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CONCEPTS.filter((concept) => {
      const matchesCategory = category === "todas" || concept.category === category;
      const matchesQuery =
        !q ||
        concept.term.toLowerCase().includes(q) ||
        concept.simpleDefinition.toLowerCase().includes(q) ||
        concept.acronym?.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-12">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
          <Layers className="h-6 w-6" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Centro de Conocimiento</p>
          <h1 className="text-2xl font-semibold text-avenida-black">Conceptos</h1>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-avenida-black">
          Glosario vivo de Calidad: qué es cada concepto, en términos simples, con un ejemplo de Avenida+, por qué
          importa y qué hacer si lo detectás. Basado en el Diccionario Corporativo de Términos del Sistema de Gestión.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="text"
            placeholder="Buscar un concepto (ej: riesgo, NC, indicador)"
            className="h-10 w-full rounded-xl border border-border bg-white pl-9 pr-3 text-sm text-avenida-black placeholder:text-muted focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory("todas")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            category === "todas"
              ? "bg-avenida-black text-white"
              : "bg-avenida-gray/30 text-avenida-black hover:bg-avenida-gray/50",
          )}
        >
          Todas ({CONCEPTS.length})
        </button>
        {(Object.keys(CONCEPT_CATEGORIES) as ConceptCategory[]).map((key) => {
          const count = CONCEPTS.filter((c) => c.category === key).length;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                category === key
                  ? "bg-avenida-black text-white"
                  : "bg-avenida-gray/30 text-avenida-black hover:bg-avenida-gray/50",
              )}
            >
              {CONCEPT_CATEGORIES[key].label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-8 text-center">
          <p className="text-sm text-muted">No encontramos conceptos para &ldquo;{query}&rdquo;.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((concept) => (
            <Link key={concept.id} href={`/centro-de-conocimiento/conceptos/${concept.id}`}>
              <Card className="flex h-full flex-col gap-3 p-5 transition-shadow hover:shadow-md hover:shadow-black/[0.06]">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-avenida-black">
                    {concept.term}
                    {concept.acronym && <span className="ml-1.5 text-muted">({concept.acronym})</span>}
                  </h3>
                  <Badge tone={CONCEPT_CATEGORIES[concept.category].tone}>
                    {CONCEPT_CATEGORIES[concept.category].label}
                  </Badge>
                </div>
                <p className="flex-1 text-sm text-muted">{concept.simpleDefinition}</p>
                <span className="flex items-center gap-1 text-xs font-medium text-avenida-violet">
                  Ver más <ArrowRight className="h-3 w-3" />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
