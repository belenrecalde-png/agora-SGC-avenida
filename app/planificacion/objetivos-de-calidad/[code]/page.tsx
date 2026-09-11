import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { ObjectiveTabs, type ObjectiveTabDef, type ObjectiveTabKey } from "@/components/objetivos/objective-tabs";
import { ResumenTab } from "@/components/objetivos/resumen-tab";
import { ResultadosTab } from "@/components/objetivos/resultados-tab";
import {
  getObjectiveByCode,
  listActivityLog,
  listAreas,
  listIndicators,
  listObjectiveResults,
} from "@/lib/db/queries";
import { canEditAreaScoped, canViewAreaScoped } from "@/lib/auth/access";
import { requireUser } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return { title: `${code} | Ágora` };
}

function statusTone(status: string): BadgeTone {
  if (status === "Cumplido") return "green";
  if (status === "Incumplido") return "red";
  if (status === "En riesgo") return "amber";
  return "blue";
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ObjetivoDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { code } = await params;
  const { tab } = await searchParams;
  const objective = getObjectiveByCode(code);
  if (!objective) notFound();

  const user = await requireUser();
  if (!canViewAreaScoped(objective, user)) redirect("/mi-sgc");
  const canEdit = canEditAreaScoped(objective, user);

  const areas = listAreas();
  const indicators = listIndicators();
  const area = objective.area_id ? areas.find((a) => a.id === objective.area_id) : undefined;
  const results = listObjectiveResults(objective.id);
  const history = listActivityLog(objective.id);

  const tabs: ObjectiveTabDef[] = [
    { key: "resumen", label: "Resumen" },
    { key: "resultados", label: `Resultados${results.length ? ` (${results.length})` : ""}` },
    { key: "historial", label: "Historial" },
  ];

  const validTabKeys = new Set<string>(tabs.map((t) => t.key));
  const activeTab = (validTabKeys.has(tab ?? "") ? tab : "resumen") as ObjectiveTabKey;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-12">
      <Link
        href="/planificacion/objetivos-de-calidad"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-avenida-violet hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Objetivos de Calidad
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={statusTone(objective.status)}>{objective.status}</Badge>
            {objective.sheet_row !== null && (
              <Badge tone="blue">Sincronizado con Sheets (fila {objective.sheet_row})</Badge>
            )}
          </div>
          <h1 className="text-2xl font-semibold text-avenida-black">{objective.title}</h1>
          <p className="text-sm text-muted">
            {objective.code} · {area?.name ?? "Sin área definida"} · Creado el {formatDateTime(objective.created_at)}
          </p>
        </div>
      </div>

      <ObjectiveTabs code={objective.code} active={activeTab} tabs={tabs} />

      {activeTab === "resumen" && (
        <ResumenTab objective={objective} areas={areas} indicators={indicators} canEdit={canEdit} />
      )}
      {activeTab === "resultados" && <ResultadosTab objective={objective} results={results} canEdit={canEdit} />}

      {activeTab === "historial" && (
        <Card className="flex flex-col divide-y divide-border p-0">
          {history.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 p-4">
              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-avenida-violet-light text-avenida-violet">
                <Clock className="h-3.5 w-3.5" />
              </span>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium text-avenida-black">{entry.event}</p>
                {entry.detail && <p className="text-sm text-muted">{entry.detail}</p>}
                <p className="text-xs text-muted">{formatDateTime(entry.created_at)}</p>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
