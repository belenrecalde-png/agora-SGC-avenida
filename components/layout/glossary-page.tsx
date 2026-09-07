import Link from "next/link";
import type { ComponentType } from "react";
import { ArrowLeft, Flag, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { getConceptById } from "@/lib/concepts-data";

/**
 * Reemplaza a `PlaceholderPage` en las secciones que el usuario decidió
 * excluir de Ágora por ser gestión interna de Calidad (Contexto, Partes
 * interesadas, Procesos, Documentación, Auditorías — decisión 2026-09-07,
 * ver `claude/progreso-implementacion.md`). En vez de "esto se implementa en
 * la Fase X" (que ya no aplica, porque esa fase no se va a construir en el
 * portal), muestra un glosario: qué es cada cosa, en lenguaje simple,
 * reutilizando los conceptos ya redactados en el Centro de Conocimiento
 * (Fase 2) — sin duplicar contenido.
 */
export function GlossaryPage({
  title,
  description,
  icon: Icon,
  sectionLabel,
  conceptIds,
}: {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  sectionLabel?: string;
  conceptIds: string[];
}) {
  const concepts = conceptIds.map(getConceptById).filter((c) => c !== undefined);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-12">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
          <Icon className="h-6 w-6" />
        </span>
        <div className="flex flex-col gap-1">
          {sectionLabel && (
            <p className="text-xs font-medium uppercase tracking-wide text-muted">{sectionLabel}</p>
          )}
          <h1 className="text-2xl font-semibold text-avenida-black">{title}</h1>
        </div>
      </div>

      <Card className="flex flex-col gap-4 p-6">
        <p className="text-sm text-avenida-black">{description}</p>
        <div className="flex items-start gap-2 rounded-xl border border-dashed border-avenida-violet/30 bg-avenida-violet-light/40 p-4 text-sm text-avenida-black">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-avenida-violet" />
          <span>
            Esta gestión la lleva el área de Calidad puertas adentro — no es una herramienta de este
            portal. Te dejamos las definiciones para que entiendas de qué se trata.
          </span>
        </div>
      </Card>

      {concepts.length > 0 && (
        <div className="flex flex-col gap-3">
          {concepts.map((concept) => (
            <Card key={concept.id} className="flex flex-col gap-2 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-avenida-black">
                  {concept.term}
                  {concept.acronym && <span className="ml-1.5 font-normal text-muted">({concept.acronym})</span>}
                </p>
                <Link
                  href={`/centro-de-conocimiento/conceptos/${concept.id}`}
                  className="text-xs font-medium text-avenida-violet hover:underline"
                >
                  Ver más
                </Link>
              </div>
              <p className="text-sm text-muted">{concept.simpleDefinition}</p>
            </Card>
          ))}
        </div>
      )}

      <Card className="flex flex-col items-start gap-3 bg-avenida-violet-light/50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-avenida-black">¿Detectaste algo relacionado?</p>
        <LinkButton href="/reportar" size="sm" className="shrink-0">
          <Flag className="h-4 w-4" />
          Reportar algo relacionado
        </LinkButton>
      </Card>

      <Link
        href="/"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-avenida-violet hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Link>
    </div>
  );
}
