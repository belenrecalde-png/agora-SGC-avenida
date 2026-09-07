import Link from "next/link";
import { cn } from "@/lib/utils";

export type IndicatorTabKey = "resumen" | "resultados" | "historial";

export type IndicatorTabDef = { key: IndicatorTabKey; label: string };

/** Mismo patrón que `ObjectiveTabs`, con base de ruta propia. */
export function IndicatorTabs({
  code,
  active,
  tabs,
}: {
  code: string;
  active: IndicatorTabKey;
  tabs: IndicatorTabDef[];
}) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-border">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        const href =
          tab.key === "resumen" ? `/evaluacion/indicadores/${code}` : `/evaluacion/indicadores/${code}?tab=${tab.key}`;
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
