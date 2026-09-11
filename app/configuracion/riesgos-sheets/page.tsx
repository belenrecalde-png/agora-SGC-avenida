import Link from "next/link";
import { Sheet, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRisksSheetsConfigStatus } from "@/lib/google-sheets/client";
import { probarConexionRiesgosSheetsAction, importarRiesgosDesdeSheetsAction } from "@/lib/actions/risk-sheets";
import { listRisks } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Riesgos en Sheets | Ágora`,
};

export default async function RiesgosSheetsPage({
  searchParams,
}: {
  searchParams: Promise<{ testOk?: string; testError?: string; importOk?: string; importError?: string }>;
}) {
  const { testOk, testError, importOk, importError } = await searchParams;
  const configStatus = getRisksSheetsConfigStatus();
  const risks = listRisks();
  const synced = risks.filter((r) => r.sheet_row !== null).length;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-12">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
          <Sheet className="h-6 w-6" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Configuración</p>
          <h1 className="text-2xl font-semibold text-avenida-black">Riesgos en Sheets</h1>
        </div>
      </div>

      <p className="text-sm text-avenida-black">
        Cada riesgo u oportunidad que se crea o edita en Planificación → Riesgos y Oportunidades se
        escribe (o actualiza) automáticamente en tu planilla real — pestaña &ldquo;Riesgos&rdquo;
        o &ldquo;Oportunidades&rdquo; según corresponda, mismo archivo. Usa la misma cuenta de
        servicio que Objetivos en Sheets (ver{" "}
        <Link href="/configuracion/objetivos-sheets" className="text-avenida-violet hover:underline">
          Configuración → Objetivos en Sheets
        </Link>
        ) — no hace falta cargar credenciales nuevas, solo el ID de esta otra planilla.
      </p>

      {(testOk || testError || importOk || importError) && (
        <Card className={`flex items-start gap-2 p-4 ${testError || importError ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"}`}>
          {testError || importError ? (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          )}
          <p className={`text-sm ${testError || importError ? "text-red-700" : "text-emerald-700"}`}>
            {testOk && `Conexión OK — planilla "${testOk}".`}
            {testError}
            {importOk && `Importación terminada — ${importOk}.`}
            {importError}
          </p>
        </Card>
      )}

      <Card className="flex flex-col gap-3 p-5">
        <p className="text-sm font-semibold text-avenida-black">Estado de la configuración</p>
        <div className="flex flex-col gap-2 text-sm">
          {[
            { label: "GOOGLE_SHEETS_CLIENT_EMAIL", ok: configStatus.clientEmail },
            { label: "GOOGLE_SHEETS_PRIVATE_KEY", ok: configStatus.privateKey },
            { label: "GOOGLE_SHEETS_RISKS_SPREADSHEET_ID", ok: configStatus.spreadsheetId },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <code className="text-xs text-avenida-black">{row.label}</code>
              <Badge tone={row.ok ? "green" : "gray"}>{row.ok ? "Configurada" : "Falta configurar"}</Badge>
            </div>
          ))}
        </div>
        {!configStatus.configured && (
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
            Todavía falta completar alguna variable — hasta que estén las tres, los riesgos y
            oportunidades se siguen creando normalmente en el portal, pero no se sincroniza nada con
            Sheets.
          </p>
        )}
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-avenida-black">Estado de la sincronización</p>
          <Badge tone="blue">
            {synced} de {risks.length} vinculado{synced === 1 ? "" : "s"} a una fila
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3">
          <form action={probarConexionRiesgosSheetsAction}>
            <Button type="submit" variant="secondary" size="sm">
              Probar conexión
            </Button>
          </form>
          <form action={importarRiesgosDesdeSheetsAction}>
            <Button type="submit" variant="secondary" size="sm">
              Importar desde Sheets
            </Button>
          </form>
        </div>
        <p className="text-xs text-muted">
          &ldquo;Importar desde Sheets&rdquo; trae los riesgos y oportunidades que ya estén cargados
          en las 2 pestañas y todavía no existan en el portal — es seguro correrlo más de una vez, no
          duplica los que ya se importaron.
        </p>
        <Link href="/planificacion/riesgos-y-oportunidades" className="text-xs font-medium text-avenida-violet hover:underline">
          Ver Riesgos y Oportunidades →
        </Link>
      </Card>
    </div>
  );
}
