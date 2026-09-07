import { ExternalLink, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { RecordEvidence, SgcRecord } from "@/lib/db/queries";
import { agregarEvidenciaAction } from "@/lib/actions/gestion";

const inputClass =
  "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-avenida-black placeholder:text-muted focus:border-avenida-violet focus:outline-none focus:ring-2 focus:ring-avenida-violet/20";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function EvidenciasTab({ record, evidence }: { record: SgcRecord; evidence: RecordEvidence[] }) {
  return (
    <div className="flex flex-col gap-6">
      {record.evidence_note && (
        <Card className="flex flex-col gap-1 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Evidencia del reporte original</p>
          <p className="text-sm text-avenida-black">{record.evidence_note}</p>
        </Card>
      )}

      {evidence.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-8 text-center">
          <p className="text-sm text-muted">Todavía no se agregó evidencia adicional a este registro.</p>
        </Card>
      ) : (
        <Card className="flex flex-col divide-y divide-border p-0">
          {evidence.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-4">
              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-avenida-violet-light text-avenida-violet">
                <FileText className="h-3.5 w-3.5" />
              </span>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm text-avenida-black">{item.description}</p>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-fit items-center gap-1 text-xs font-medium text-avenida-violet hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {item.link}
                  </a>
                )}
                <p className="text-xs text-muted">
                  {item.created_by ? `${item.created_by} · ` : ""}
                  {formatDateTime(item.created_at)}
                </p>
              </div>
            </div>
          ))}
        </Card>
      )}

      <Card className="flex flex-col gap-3 p-5">
        <p className="text-sm font-semibold text-avenida-black">Agregar evidencia</p>
        <form action={agregarEvidenciaAction} className="flex flex-col gap-3">
          <input type="hidden" name="code" value={record.code} />
          <textarea name="description" required rows={2} placeholder="Describí la evidencia" className={inputClass} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input name="link" placeholder="Link (opcional)" className={inputClass} />
            <input name="createdBy" placeholder="Quién la agrega (opcional)" className={inputClass} />
          </div>
          <div>
            <Button type="submit" variant="secondary" size="sm">
              Guardar evidencia
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
