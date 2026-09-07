import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RecordTabs, type RecordTabDef, type RecordTabKey } from "@/components/gestion-calidad/record-tabs";
import { AnalisisTab } from "@/components/gestion-calidad/analisis-tab";
import { VerificacionTab } from "@/components/gestion-calidad/verificacion-tab";
import { EvidenciasTab } from "@/components/gestion-calidad/evidencias-tab";
import { RelacionesTab } from "@/components/gestion-calidad/relaciones-tab";
import { actualizarVencimientoAction } from "@/lib/actions/gestion";
import {
  getPlaneProjectMappingByArea,
  getRecordByCode,
  listActivityLog,
  listAreas,
  listEvidence,
  listRecordTypes,
  listRelationshipsForRecord,
} from "@/lib/db/queries";
import { isPlaneConfigured } from "@/lib/plane/client";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return { title: `${code} | Ágora` };
}

function statusTone(status: string): BadgeTone {
  if (status === "Cerrado" || status === "Cerrada" || status === "Eficaz") return "green";
  if (status === "Rechazado" || status === "No eficaz") return "red";
  if (status === "En análisis" || status === "En curso" || status === "Pendiente de verificación") return "violet";
  return "blue";
}

function priorityTone(priority: string): BadgeTone {
  if (priority === "Alta") return "red";
  if (priority === "Media") return "amber";
  return "green";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
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

export default async function RegistroDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ tab?: string; estadoError?: string }>;
}) {
  const { code } = await params;
  const { tab, estadoError } = await searchParams;
  const record = getRecordByCode(code);
  if (!record) notFound();

  const type = listRecordTypes().find((t) => t.id === record.type_id);
  const area = record.area_id ? listAreas().find((a) => a.id === record.area_id) : undefined;
  const history = listActivityLog(record.id);
  const relationships = listRelationshipsForRecord(record.id);
  const evidence = listEvidence(record.id);

  const isNc = type?.code === "NC";
  const isAc = type?.code === "AC";
  const correctiveActions = relationships.filter((rel) => rel.direction === "from" && rel.other.type_id === "ac");
  const acSource = relationships.find((rel) => rel.direction === "to" && rel.label?.startsWith("Acción Correctiva de"));

  const tabs: RecordTabDef[] = [{ key: "resumen", label: "Resumen" }];
  if (isNc) tabs.push({ key: "analisis", label: "Análisis y corrección" });
  if (isAc) tabs.push({ key: "verificacion", label: "Verificación y cierre" });
  tabs.push({ key: "evidencias", label: `Evidencias${evidence.length ? ` (${evidence.length})` : ""}` });
  tabs.push({ key: "relaciones", label: `Relaciones${relationships.length ? ` (${relationships.length})` : ""}` });
  tabs.push({ key: "historial", label: "Historial" });

  const validTabKeys = new Set<string>(tabs.map((t) => t.key));
  const activeTab = (validTabKeys.has(tab ?? "") ? tab : "resumen") as RecordTabKey;

  const planeNote = record.plane_url
    ? null
    : !isPlaneConfigured()
      ? "Plane no está configurado en este entorno."
      : !record.area_id || !getPlaneProjectMappingByArea(record.area_id)?.active
        ? "El área no tiene un proyecto de Plane asociado."
        : "No se pudo crear el ticket — ver Configuración → Logs.";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-12">
      <Link
        href="/gestion-calidad/registro"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-avenida-violet hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al Registro SGC
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {type && <Badge tone={type.color as BadgeTone}>{type.code}</Badge>}
            <Badge tone={statusTone(record.status)}>{record.status}</Badge>
            <Badge tone={priorityTone(record.priority)}>Prioridad {record.priority}</Badge>
            {record.urgent && <Badge tone="red">Urgente</Badge>}
          </div>
          <h1 className="text-2xl font-semibold text-avenida-black">{record.title}</h1>
          <p className="text-sm text-muted">
            {record.code} · Reportado por {record.reporter_name} el {formatDateTime(record.created_at)}
          </p>
        </div>
      </div>

      <RecordTabs code={record.code} active={activeTab} tabs={tabs} />

      {activeTab === "resumen" && (
        <>
          <Card className="flex flex-col divide-y divide-border p-0">
            <div className="flex flex-col gap-1.5 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">¿Qué ocurrió?</p>
              <p className="text-sm leading-relaxed text-avenida-black">{record.description}</p>
            </div>
            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Área relacionada</p>
                <p className="text-sm text-avenida-black">{area?.name ?? "Sin definir"}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Proceso relacionado</p>
                <p className="text-sm text-avenida-black">{record.process_name ?? "Sin definir"}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Fecha del hecho</p>
                <p className="text-sm text-avenida-black">{record.event_date ?? "No informada"}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Impacto observado</p>
                <p className="text-sm text-avenida-black">{record.impact ?? "No informado"}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Ticket en Plane</p>
                {record.plane_url ? (
                  <a
                    href={record.plane_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-avenida-violet hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Abrir en Plane{record.plane_sequence_id ? ` (#${record.plane_sequence_id})` : ""}
                    {record.plane_status ? ` — ${record.plane_status}` : ""}
                  </a>
                ) : (
                  <p className="text-sm text-muted">Sin vincular · {planeNote}</p>
                )}
              </div>
            </div>
            {(record.evidence_note || record.comments) && (
              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
                {record.evidence_note && (
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Evidencia</p>
                    <p className="text-sm text-avenida-black">{record.evidence_note}</p>
                  </div>
                )}
                {record.comments && (
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Comentarios</p>
                    <p className="text-sm text-avenida-black">{record.comments}</p>
                  </div>
                )}
              </div>
            )}
          </Card>

          <Card className="flex flex-wrap items-end gap-3 p-4">
            <form action={actualizarVencimientoAction} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="code" value={record.code} />
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">Vencimiento / compromiso</span>
                <input
                  type="date"
                  name="dueDate"
                  defaultValue={record.due_date ?? ""}
                  className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-avenida-black focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20"
                />
              </label>
              <Button type="submit" variant="secondary" size="sm">
                Guardar
              </Button>
            </form>
            {record.due_date && (
              <p className="text-xs text-muted">
                {new Date(`${record.due_date}T00:00:00`) < new Date() && !["Cerrado", "Cerrada"].includes(record.status)
                  ? "Vencido"
                  : `Vence el ${formatDate(`${record.due_date}T00:00:00`)}`}
              </p>
            )}
          </Card>
        </>
      )}

      {activeTab === "analisis" && isNc && <AnalisisTab record={record} correctiveActions={correctiveActions} />}

      {activeTab === "verificacion" && isAc && (
        <VerificacionTab record={record} source={acSource} estadoError={estadoError} />
      )}

      {activeTab === "evidencias" && <EvidenciasTab record={record} evidence={evidence} />}

      {activeTab === "relaciones" && <RelacionesTab record={record} relationships={relationships} />}

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
