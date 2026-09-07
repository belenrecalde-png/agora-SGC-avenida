import { GitCompare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CONCEPT_COMPARISONS } from "@/lib/comparisons-data";

export const metadata = {
  title: `Comparador de conceptos | Ágora`,
};

export default function ComparadorPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-12">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
          <GitCompare className="h-6 w-6" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Centro de Conocimiento</p>
          <h1 className="text-2xl font-semibold text-avenida-black">Comparador de conceptos</h1>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-avenida-black">
          Diferencias clave entre conceptos que suelen confundirse, con un ejemplo de Avenida+ y cuándo usar cada uno.
        </p>
        <Badge tone="amber" className="w-fit">
          Borrador — contenido a revisar por el equipo de Calidad
        </Badge>
      </div>

      <div className="flex flex-col gap-4">
        {CONCEPT_COMPARISONS.map((comparison) => (
          <Card key={comparison.id} className="flex flex-col gap-4 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="violet">{comparison.termA}</Badge>
              <span className="text-xs text-muted">vs.</span>
              <Badge tone="blue">{comparison.termB}</Badge>
            </div>

            <p className="text-sm text-avenida-black">
              <span className="font-semibold">Diferencia clave: </span>
              {comparison.keyDifference}
            </p>

            <p className="text-sm text-muted">
              <span className="font-medium text-avenida-black">En Avenida+: </span>
              {comparison.avenidaExample}
            </p>

            <div className="grid grid-cols-1 gap-3 rounded-xl bg-avenida-violet-light/30 p-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-avenida-violet">
                  Usá &ldquo;{comparison.termA}&rdquo; cuando
                </p>
                <p className="text-sm text-avenida-black">{comparison.whenToUseA}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-avenida-blue">
                  Usá &ldquo;{comparison.termB}&rdquo; cuando
                </p>
                <p className="text-sm text-avenida-black">{comparison.whenToUseB}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
