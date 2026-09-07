import Link from "next/link";
import type { ComponentType } from "react";
import { ArrowLeft, Construction } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PlaceholderPage({
  title,
  description,
  phase,
  icon: Icon,
  sectionLabel,
}: {
  title: string;
  description: string;
  phase?: string;
  icon: ComponentType<{ className?: string }>;
  sectionLabel?: string;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-12">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
          <Icon className="h-6 w-6" />
        </span>
        <div className="flex flex-col gap-1">
          {sectionLabel && (
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              {sectionLabel}
            </p>
          )}
          <h1 className="text-2xl font-semibold text-avenida-black">{title}</h1>
        </div>
      </div>

      <Card className="flex flex-col gap-4 p-6">
        <p className="text-sm text-avenida-black">{description}</p>

        <div className="flex flex-col gap-3 rounded-xl border border-dashed border-avenida-violet/30 bg-avenida-violet-light/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-avenida-black">
            <Construction className="h-4 w-4 text-avenida-violet" />
            <span>Esta sección todavía no tiene funcionalidad conectada.</span>
          </div>
          {phase && <Badge tone="violet">Se implementa en {phase}</Badge>}
        </div>
      </Card>

      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-avenida-violet hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Link>
    </div>
  );
}
