import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Flag, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import {
  CONCEPTS,
  CONCEPT_CATEGORIES,
  getConceptById,
  getRelatedConcepts,
  type Concept,
} from "@/lib/concepts-data";

export function generateStaticParams() {
  return CONCEPTS.map((concept) => ({ id: concept.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const concept = getConceptById(id);
  return { title: `${concept ? concept.term : "Concepto"} | Ágora` };
}

const FIELDS: { key: keyof Concept; label: string }[] = [
  { key: "technicalDefinition", label: "Definición técnica" },
  { key: "simpleDefinition", label: "En términos simples" },
  { key: "avenidaExample", label: "Ejemplo en Avenida+" },
  { key: "whyItMatters", label: "¿Por qué es importante?" },
  { key: "whatToDoIfDetected", label: "¿Qué tengo que hacer si detecto esto?" },
];

export default async function ConceptoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const concept = getConceptById(id);
  if (!concept) notFound();

  const related = getRelatedConcepts(concept);
  const categoryMeta = CONCEPT_CATEGORIES[concept.category];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-12">
      <Link
        href="/centro-de-conocimiento/conceptos"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-avenida-violet hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Conceptos
      </Link>

      <div className="flex items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
          <Layers className="h-6 w-6" />
        </span>
        <div className="flex flex-col gap-2">
          <Badge tone={categoryMeta.tone} className="w-fit">
            {categoryMeta.label}
          </Badge>
          <h1 className="text-2xl font-semibold text-avenida-black">
            {concept.term}
            {concept.acronym && <span className="ml-2 text-lg font-normal text-muted">({concept.acronym})</span>}
          </h1>
        </div>
      </div>

      <Badge tone="amber" className="w-fit">
        Borrador — contenido a revisar por el equipo de Calidad
      </Badge>

      <Card className="flex flex-col divide-y divide-border p-0">
        {FIELDS.map((field) => (
          <div key={field.key} className="flex flex-col gap-1.5 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{field.label}</p>
            <p className="text-sm leading-relaxed text-avenida-black">{concept[field.key] as string}</p>
          </div>
        ))}
      </Card>

      {related.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-avenida-black">Relacionado con</p>
          <div className="flex flex-wrap gap-2">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/centro-de-conocimiento/conceptos/${item.id}`}
                className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-avenida-black hover:border-avenida-violet hover:text-avenida-violet"
              >
                {item.term}
              </Link>
            ))}
          </div>
        </div>
      )}

      <Card className="flex flex-col items-start gap-3 bg-avenida-violet-light/50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-avenida-black">¿Detectaste algo relacionado con {concept.term.toLowerCase()}?</p>
        <LinkButton href="/reportar" size="sm" className="shrink-0">
          <Flag className="h-4 w-4" />
          Reportar algo relacionado
        </LinkButton>
      </Card>
    </div>
  );
}
