import { HelpCircle, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { FaqAccordion } from "./faq-accordion";

export const metadata = {
  title: `Preguntas frecuentes | Ágora`,
};

export default function FaqPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-12">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
          <HelpCircle className="h-6 w-6" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Centro de Conocimiento</p>
          <h1 className="text-2xl font-semibold text-avenida-black">Preguntas frecuentes</h1>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-avenida-black">
          Respuestas directas a las dudas más habituales de cualquier colaborador sobre el SGC — no solo
          definiciones, sino preguntas del día a día.
        </p>
        <Badge tone="amber" className="w-fit">
          Borrador — contenido a revisar por el equipo de Calidad
        </Badge>
      </div>

      <FaqAccordion />

      <Card className="flex flex-col items-start gap-3 bg-avenida-violet-light/50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-avenida-black">¿No encontraste la respuesta que buscabas?</p>
        <LinkButton href="/reportar" size="sm" className="shrink-0">
          <Flag className="h-4 w-4" />
          Reportar una situación
        </LinkButton>
      </Card>
    </div>
  );
}
