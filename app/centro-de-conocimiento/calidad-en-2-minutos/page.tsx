import Link from "next/link";
import { Sparkles, ArrowRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TWO_MINUTE_CAPSULES } from "@/lib/two-minutes-data";
import { getConceptById } from "@/lib/concepts-data";

export const metadata = {
  title: `Calidad en 2 minutos | Ágora`,
};

export default function CalidadEnDosMinutosPage() {
  const capsules = TWO_MINUTE_CAPSULES.map((capsule) => ({
    ...capsule,
    concept: getConceptById(capsule.conceptId),
  })).filter((capsule) => capsule.concept);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-12">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
          <Sparkles className="h-6 w-6" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Centro de Conocimiento</p>
          <h1 className="text-2xl font-semibold text-avenida-black">Calidad en 2 minutos</h1>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-avenida-black">
          Cápsulas breves que responden, en menos de 2 minutos, las preguntas más comunes sobre Calidad.
        </p>
        <Badge tone="amber" className="w-fit">
          Borrador — contenido a revisar por el equipo de Calidad
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {capsules.map(({ question, concept }) => (
          <Card key={question} className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-avenida-violet">
              <Clock className="h-3.5 w-3.5" />
              &lt; 2 min
            </div>
            <h3 className="text-sm font-semibold text-avenida-black">{question}</h3>
            <p className="flex-1 text-sm text-muted">{concept!.simpleDefinition}</p>
            <p className="text-xs text-muted">
              <span className="font-medium text-avenida-black">En Avenida+: </span>
              {concept!.avenidaExample}
            </p>
            <Link
              href={`/centro-de-conocimiento/conceptos/${concept!.id}`}
              className="flex items-center gap-1 text-xs font-medium text-avenida-violet hover:underline"
            >
              Ver el concepto completo <ArrowRight className="h-3 w-3" />
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
