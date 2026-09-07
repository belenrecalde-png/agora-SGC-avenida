import { AlertOctagon, Lightbulb, ShieldAlert, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { RiesgosExplorer } from "@/components/riesgos/riesgos-explorer";
import { getRiskBand, getRiskScore, listAreas, listRisks } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Riesgos y oportunidades | Ágora",
};

export default function RiesgosYOportunidadesPage() {
  const risks = listRisks();
  const areas = listAreas();

  const riesgos = risks.filter((r) => r.kind === "riesgo");
  const oportunidades = risks.filter((r) => r.kind === "oportunidad");
  const CLOSING = new Set(["Cerrado", "Cerrada", "Mitigado", "Aprovechada", "Descartada"]);

  const riesgosAltosAbiertos = riesgos.filter((r) => {
    if (CLOSING.has(r.status)) return false;
    const score = getRiskScore(r.probability_initial, r.impact_initial);
    return getRiskBand("riesgo", score).tone === "red";
  }).length;

  const oportunidadesEnCurso = oportunidades.filter((r) => !CLOSING.has(r.status)).length;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
            <AlertOctagon className="h-6 w-6" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Planificación</p>
            <h1 className="text-2xl font-semibold text-avenida-black">Riesgos y oportunidades</h1>
          </div>
        </div>
        <LinkButton href="/planificacion/riesgos-y-oportunidades/nuevo" className="shrink-0">
          Registrar riesgo u oportunidad
        </LinkButton>
      </div>

      <p className="text-sm text-avenida-black">
        Identificación, valoración (probabilidad × impacto) y tratamiento de riesgos y oportunidades, con
        matriz de criticidad inicial y residual.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Card className="flex flex-1 flex-col gap-3 p-4">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-avenida-violet-light text-avenida-violet">
            <ShieldAlert className="h-4 w-4" />
          </span>
          <div>
            <p className="text-2xl font-semibold text-avenida-black">{riesgos.length}</p>
            <p className="text-xs text-muted">Riesgos identificados</p>
          </div>
        </Card>
        <Card className="flex flex-1 flex-col gap-3 p-4">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <AlertOctagon className="h-4 w-4" />
          </span>
          <div>
            <p className="text-2xl font-semibold text-avenida-black">{riesgosAltosAbiertos}</p>
            <p className="text-xs text-muted">Riesgos altos/críticos abiertos</p>
          </div>
        </Card>
        <Card className="flex flex-1 flex-col gap-3 p-4">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-avenida-blue-light text-avenida-blue">
            <Lightbulb className="h-4 w-4" />
          </span>
          <div>
            <p className="text-2xl font-semibold text-avenida-black">{oportunidades.length}</p>
            <p className="text-xs text-muted">Oportunidades identificadas</p>
          </div>
        </Card>
        <Card className="flex flex-1 flex-col gap-3 p-4">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <TrendingUp className="h-4 w-4" />
          </span>
          <div>
            <p className="text-2xl font-semibold text-avenida-black">{oportunidadesEnCurso}</p>
            <p className="text-xs text-muted">Oportunidades en curso</p>
          </div>
        </Card>
      </div>

      <RiesgosExplorer risks={risks} areas={areas} />
    </div>
  );
}
