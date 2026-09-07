import { LineChart, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { IndicadoresTable } from "@/components/indicadores/indicadores-table";
import { getIndicatorToleranceStatus, listAreas, listIndicators } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Indicadores | Ágora",
};

export default function IndicadoresPage() {
  const indicators = listIndicators();
  const areas = listAreas();

  const statuses = indicators.map(getIndicatorToleranceStatus);
  const dentro = statuses.filter((s) => s.tone === "green").length;
  const fuera = statuses.filter((s) => s.tone === "red").length;
  const sinDatos = statuses.filter((s) => s.tone === "gray").length;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
            <LineChart className="h-6 w-6" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Evaluación</p>
            <h1 className="text-2xl font-semibold text-avenida-black">Indicadores</h1>
          </div>
        </div>
        <LinkButton href="/evaluacion/indicadores/nuevo" className="shrink-0">
          Nuevo indicador
        </LinkButton>
      </div>

      <p className="text-sm text-avenida-black">
        Indicadores de desempeño con fórmula, meta, tolerancia y tendencia histórica por proceso.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Card className="flex flex-1 flex-col gap-3 p-4">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-avenida-violet-light text-avenida-violet">
            <LineChart className="h-4 w-4" />
          </span>
          <div>
            <p className="text-2xl font-semibold text-avenida-black">{indicators.length}</p>
            <p className="text-xs text-muted">Indicadores totales</p>
          </div>
        </Card>
        <Card className="flex flex-1 flex-col gap-3 p-4">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-2xl font-semibold text-avenida-black">{dentro}</p>
            <p className="text-xs text-muted">Dentro de tolerancia</p>
          </div>
        </Card>
        <Card className="flex flex-1 flex-col gap-3 p-4">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <XCircle className="h-4 w-4" />
          </span>
          <div>
            <p className="text-2xl font-semibold text-avenida-black">{fuera}</p>
            <p className="text-xs text-muted">Fuera de tolerancia</p>
          </div>
        </Card>
        <Card className="flex flex-1 flex-col gap-3 p-4">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-avenida-gray/40 text-avenida-black">
            <HelpCircle className="h-4 w-4" />
          </span>
          <div>
            <p className="text-2xl font-semibold text-avenida-black">{sinDatos}</p>
            <p className="text-xs text-muted">Sin datos todavía</p>
          </div>
        </Card>
      </div>

      <IndicadoresTable indicators={indicators} areas={areas} />
    </div>
  );
}
