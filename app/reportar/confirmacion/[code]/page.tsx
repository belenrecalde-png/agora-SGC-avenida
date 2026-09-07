import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ArrowRight, ExternalLink, Flag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { getPlaneProjectMappingByArea, getRecordByCode, getRecordTypeByCode, listRecordTypes } from "@/lib/db/queries";
import { isPlaneConfigured } from "@/lib/plane/client";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return { title: `Reporte ${code} | Ágora` };
}

export default async function ConfirmacionPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const record = getRecordByCode(code);
  if (!record) notFound();

  const type = listRecordTypes().find((t) => t.id === record.type_id) ?? getRecordTypeByCode(code.split("-")[0]);

  const planeNote = record.plane_url
    ? null
    : !isPlaneConfigured()
      ? "Plane no está configurado en este entorno todavía — el seguimiento vive acá, en Ágora."
      : !record.area_id || !getPlaneProjectMappingByArea(record.area_id)?.active
        ? "El área de este reporte todavía no tiene un proyecto de Plane asociado (se puede mapear en Configuración → Plane)."
        : "No se pudo crear el ticket en Plane automáticamente — ver el detalle en Configuración → Logs.";

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 pb-12">
      <Card className="flex flex-col items-center gap-4 p-8 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-avenida-black">¡Recibimos tu reporte!</h1>
          <p className="text-sm text-muted">Quedó registrado y ya podés hacerle seguimiento cuando quieras.</p>
        </div>

        <div className="flex flex-col gap-3 rounded-xl bg-avenida-violet-light/40 p-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Código SGC</p>
            <p className="text-lg font-semibold text-avenida-violet">{record.code}</p>
          </div>
          <div className="hidden h-8 w-px bg-avenida-violet/20 sm:block" />
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Estado</p>
            <Badge tone="blue">{record.status}</Badge>
          </div>
          {type && (
            <>
              <div className="hidden h-8 w-px bg-avenida-violet/20 sm:block" />
              <div className="flex flex-col items-center gap-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Tipo</p>
                <Badge tone="violet">{type.code}</Badge>
              </div>
            </>
          )}
        </div>

        {record.plane_url && (
          <a
            href={record.plane_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-avenida-violet hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Ver ticket en Plane{record.plane_sequence_id ? ` (#${record.plane_sequence_id})` : ""}
          </a>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <LinkButton href={`/gestion-calidad/registro/${record.code}`} className="shrink-0">
            Ver seguimiento <ArrowRight className="h-4 w-4" />
          </LinkButton>
          <LinkButton href="/reportar" variant="secondary" className="shrink-0">
            <Flag className="h-4 w-4" />
            Reportar otra situación
          </LinkButton>
        </div>
      </Card>

      <p className="text-center text-xs text-muted">
        {planeNote ?? "El reporte también se creó como ticket en Plane para el seguimiento operativo."}{" "}
        <Link href="/mi-sgc" className="text-avenida-violet hover:underline">
          Ver Mi SGC
        </Link>
        .
      </p>
    </div>
  );
}
