"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { REPORT_CATEGORIES } from "@/lib/report-categories";
import { cn } from "@/lib/utils";

const VALID_TYPE_CODES = new Set(["NC", "AC", "AP", "OM", "Q", "S", "R"]);

export function ReportCategoryPicker() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = REPORT_CATEGORIES.find((c) => c.id === selectedId) ?? null;
  const defaultType = selected?.suggestedTypes.find((type) => VALID_TYPE_CODES.has(type));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORT_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isSelected = category.id === selectedId;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedId(category.id)}
              className="text-left"
            >
              <Card
                className={cn(
                  "flex h-full flex-col gap-3 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-avenida-violet/10",
                  isSelected
                    ? "border-avenida-violet ring-2 ring-avenida-violet/20"
                    : "hover:border-avenida-violet/40",
                )}
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-avenida-violet-light text-avenida-violet">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-avenida-black">{category.title}</p>
                  <p className="mt-1 text-sm text-muted">{category.description}</p>
                </div>
              </Card>
            </button>
          );
        })}
      </div>

      {selected && (
        <Card className="flex flex-col gap-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Seleccionaste
              </p>
              <h3 className="text-lg font-semibold text-avenida-black">{selected.title}</h3>
            </div>
            {selected.suggestedTypes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selected.suggestedTypes.map((type) => (
                  <Badge key={type} tone="blue">
                    Orientativo: {type}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <p className="text-sm text-muted">{selected.description}</p>

          {selected.examples.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                Algunos ejemplos
              </p>
              <div className="flex flex-wrap gap-2">
                {selected.examples.map((example) => (
                  <Badge key={example} tone="gray">
                    {example}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 rounded-xl border border-dashed border-avenida-violet/30 bg-avenida-violet-light/40 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-avenida-black">
              Completá el formulario y te damos un código de seguimiento al instante. La creación
              del ticket en Plane se conecta en la <strong>Fase 4</strong>.
            </p>
            <LinkButton
              href={`/reportar/nuevo?categoria=${selected.id}${defaultType ? `&tipo=${defaultType}` : ""}`}
              className="shrink-0"
            >
              Continuar con el reporte
            </LinkButton>
          </div>

          <p className="text-xs text-muted">
            La clasificación mostrada acá es orientativa — la clasificación final siempre queda a
            cargo del área de Calidad.
          </p>
        </Card>
      )}
    </div>
  );
}
