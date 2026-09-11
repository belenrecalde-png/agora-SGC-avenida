import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { RiskTabs, type RiskTabDef, type RiskTabKey } from "@/components/riesgos/risk-tabs";
import { TratamientoTab } from "@/components/riesgos/tratamiento-tab";
import { ControlesTab } from "@/components/riesgos/controles-tab";
import { ValoracionTab } from "@/components/riesgos/valoracion-tab";
import { RiesgoRelacionesTab } from "@/components/riesgos/riesgo-relaciones-tab";
import {
  getRiskBand,
  getRiskByCode,
  getRiskScore,
  listActivityLog,
  listAreas,
  listRiskControls,
  listRiskRelationshipsForRisk,
} from "@/lib/db/queries";
import { canEditAreaScoped, canViewAreaScoped } from "@/lib/auth/access";
import { requireUser } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return { title: `${code} | Ágora` };
}

function statusTone(status: string): BadgeTone {
  if (["Cerrado", "Cerrada", "Mitigado", "Aprovechada"].includes(status)) return "green";
  if (status === "Descartada" || status === "Materializado") return "red";
  if (["En tratamiento", "En seguimiento", "En evaluación", "En curso"].includes(status)) return "violet";
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

export default async function RiesgoDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ tab?: string; estadoError?: string }>;
}) {
  const { code } = await params;
  const { tab, estadoError } = await searchParams;
  const risk = getRiskByCode(code);
  if (!risk) notFound();

  const user = await requireUser();
  if (!canViewAreaScoped(risk, user)) redirect("/mi-sgc");
  const canEdit = canEditAreaScoped(risk, user);

  const areas = listAreas();
  const area = risk.area_id ? areas.find((a) => a.id === risk.area_id) : undefined;
  const controls = listRiskControls(risk.id);
  const relationships = listRiskRelationshipsForRisk(risk.id);
  const history = listActivityLog(risk.id);
  const score = getRiskScore(risk.probability_initial, risk.impact_initial);
  const band = getRiskBand(risk.kind, score);

  const tabs: RiskTabDef[] = [
    { key: "resumen", label: "Resumen" },
    { key: "controles", label: `Controles${controls.length ? ` (${controls.length})` : ""}` },
    { key: "valoracion", label: "Valoración residual" },
    { key: "relaciones", label: `Relaciones${relationships.length ? ` (${relationships.length})` : ""}` },
    { key: "historial", label: "Historial" },
  ];

  const validTabKeys = new Set<string>(tabs.map((t) => t.key));
  const activeTab = (validTabKeys.has(tab ?? "") ? tab : "resumen") as RiskTabKey;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-12">
      <Link
        href="/planificacion/riesgos-y-oportunidades"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-avenida-violet hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Riesgos y oportunidades
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={risk.kind === "oportunidad" ? "blue" : "violet"}>
              {risk.kind === "oportunidad" ? "Oportunidad" : "Riesgo"}
            </Badge>
            <Badge tone={statusTone(risk.status)}>{risk.status}</Badge>
            <Badge tone={band.tone}>{score !== null ? `${score} — ${band.label}` : band.label}</Badge>
          </div>
          <h1 className="text-2xl font-semibold text-avenida-black">{risk.description}</h1>
          <p className="text-sm text-muted">
            {risk.code} · {area?.name ?? "Sin área definida"} · Creado el {formatDateTime(risk.created_at)}
          </p>
        </div>
      </div>

      <RiskTabs code={risk.code} active={activeTab} tabs={tabs} />

      {activeTab === "resumen" && <TratamientoTab risk={risk} areas={areas} canEdit={canEdit} />}
      {activeTab === "controles" && <ControlesTab risk={risk} controls={controls} canEdit={canEdit} />}
      {activeTab === "valoracion" && <ValoracionTab risk={risk} estadoError={estadoError} canEdit={canEdit} />}
      {activeTab === "relaciones" && <RiesgoRelacionesTab risk={risk} links={relationships} canEdit={canEdit} />}

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
