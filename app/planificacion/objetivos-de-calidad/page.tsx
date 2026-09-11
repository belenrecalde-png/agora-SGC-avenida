import { Award, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { DocumentReferenceCard } from "@/components/ui/document-reference-card";
import { ObjetivosTable } from "@/components/objetivos/objetivos-table";
import { listAreas, listObjectives } from "@/lib/db/queries";
import { filterByAreaAccess, requireGestionAccess } from "@/lib/auth/access";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Objetivos de Calidad | Ágora",
};

export default async function ObjetivosDeCalidadPage() {
  const user = await requireGestionAccess();
  const objectives = filterByAreaAccess(listObjectives(), user);
  const areas = listAreas();

  const cumplidos = objectives.filter((o) => o.status === "Cumplido").length;
  const enRiesgo = objectives.filter((o) => o.status === "En riesgo").length;
  const incumplidos = objectives.filter((o) => o.status === "Incumplido").length;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
            <Award className="h-6 w-6" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Planificación</p>
            <h1 className="text-2xl font-semibold text-avenida-black">Objetivos de Calidad</h1>
          </div>
        </div>
        <LinkButton href="/planificacion/objetivos-de-calidad/nuevo" className="shrink-0">
          Nuevo objetivo
        </LinkButton>
      </div>

      <p className="text-sm text-avenida-black">
        Objetivos con meta, indicador asociado, responsable y frecuencia de seguimiento, con vista de
        cumplimiento mensual.
      </p>

      <DocumentReferenceCard
        code="AV-CAL-OD:0001"
        label="Objetivos de Calidad"
        url="https://docs.google.com/document/d/1stbAd0A2MOc1vE-aIHTlZCS9mGFgltWQflG4WLCwAgg/edit?usp=sharing"
      />

      <div className="flex flex-col gap-4 sm:flex-row">
        <Card className="flex flex-1 flex-col gap-3 p-4">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-avenida-violet-light text-avenida-violet">
            <Award className="h-4 w-4" />
          </span>
          <div>
            <p className="text-2xl font-semibold text-avenida-black">{objectives.length}</p>
            <p className="text-xs text-muted">Objetivos totales</p>
          </div>
        </Card>
        <Card className="flex flex-1 flex-col gap-3 p-4">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-2xl font-semibold text-avenida-black">{cumplidos}</p>
            <p className="text-xs text-muted">Cumplidos</p>
          </div>
        </Card>
        <Card className="flex flex-1 flex-col gap-3 p-4">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div>
            <p className="text-2xl font-semibold text-avenida-black">{enRiesgo}</p>
            <p className="text-xs text-muted">En riesgo</p>
          </div>
        </Card>
        <Card className="flex flex-1 flex-col gap-3 p-4">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <XCircle className="h-4 w-4" />
          </span>
          <div>
            <p className="text-2xl font-semibold text-avenida-black">{incumplidos}</p>
            <p className="text-xs text-muted">Incumplidos</p>
          </div>
        </Card>
      </div>

      <ObjetivosTable objectives={objectives} areas={areas} />
    </div>
  );
}
