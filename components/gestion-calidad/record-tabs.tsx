import Link from "next/link";
import { cn } from "@/lib/utils";

export type RecordTabKey = "resumen" | "analisis" | "verificacion" | "evidencias" | "relaciones" | "historial";

export type RecordTabDef = { key: RecordTabKey; label: string };

/**
 * Navegación de tabs de la pantalla de detalle de un registro (Fase 7).
 * Server Component simple, sin estado de cliente: la tab activa se decide
 * por `searchParams.tab` en la propia page, así los formularios de cada tab
 * pueden ser Server Actions comunes (sin tener que sincronizar estado con
 * un tab-switcher client-side).
 */
export function RecordTabs({ code, active, tabs }: { code: string; active: RecordTabKey; tabs: RecordTabDef[] }) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-border">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        const href = tab.key === "resumen" ? `/gestion-calidad/registro/${code}` : `/gestion-calidad/registro/${code}?tab=${tab.key}`;
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
