import Link from "next/link";
import { cn } from "@/lib/utils";

export type RiskTabKey = "resumen" | "controles" | "valoracion" | "relaciones" | "historial";

export type RiskTabDef = { key: RiskTabKey; label: string };

/**
 * Navegación de tabs del detalle de un riesgo/oportunidad (Fase 8) — mismo
 * patrón que `RecordTabs` de la Fase 7 (Server Component simple, tab activa
 * por `searchParams.tab`), con base de ruta propia. No se generaliza
 * `RecordTabs` para no tocar código de la Fase 7 que ya funciona.
 */
export function RiskTabs({ code, active, tabs }: { code: string; active: RiskTabKey; tabs: RiskTabDef[] }) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-border">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        const href =
          tab.key === "resumen"
            ? `/planificacion/riesgos-y-oportunidades/${code}`
            : `/planificacion/riesgos-y-oportunidades/${code}?tab=${tab.key}`;
        return (
          <Link
            key={tab.key}
            href={href}
            className={cn(
              "-mb-px inline-flex items-center border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-avenida-violet text-avenida-violet"
                : "border-transparent text-muted hover:text-avenida-black",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
