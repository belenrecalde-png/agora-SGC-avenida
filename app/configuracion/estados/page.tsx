import type { ComponentType } from "react";
import { CircleDot, FileWarning, Wrench, ShieldAlert, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import {
  AC_STATUS_FLOW,
  GENERIC_STATUS_FLOW,
  OBJECTIVE_STATUS_FLOW,
  OPPORTUNITY_STATUS_FLOW,
  RISK_STATUS_FLOW,
} from "@/lib/db/queries";

export const metadata = {
  title: `Estados | Ágora`,
};

function statusTone(status: string): BadgeTone {
  if (["Cerrado", "Cerrada", "Eficaz", "Cumplido", "Aprovechada", "Resuelto", "Mitigado"].includes(status)) return "green";
  if (["Rechazado", "No eficaz", "Incumplido", "Materializado", "Descartada"].includes(status)) return "red";
  if (["En análisis", "En curso", "En tratamiento", "En seguimiento", "En evaluación", "En riesgo", "Pendiente de verificación"].includes(status))
    return "violet";
  return "blue";
}

type FlowBlock = {
  id: string;
  label: string;
  appliesTo: string;
  icon: ComponentType<{ className?: string }>;
  flow: readonly string[];
  closingRule: string;
};

const FLOW_BLOCKS: FlowBlock[] = [
  {
    id: "generico",
    label: "Flujo general",
    appliesTo: "No Conformidades, Acciones Preventivas, Oportunidades de Mejora, Quejas, Sugerencias y Reclamos",
    icon: FileWarning,
    flow: GENERIC_STATUS_FLOW,
    closingRule: "Sin bloqueo — se puede cerrar o rechazar en cualquier momento.",
  },
  {
    id: "ac",
    label: "Acciones Correctivas",
    appliesTo: "Acciones Correctivas (AC)",
    icon: Wrench,
    flow: AC_STATUS_FLOW,
    closingRule:
      "Bloqueado: no se puede pasar a \"Cerrada\" si no hay una verificación de eficacia registrada con resultado \"Eficaz\".",
  },
  {
    id: "riesgos",
    label: "Riesgos",
    appliesTo: "Riesgos, desde Planificación → Riesgos y Oportunidades",
    icon: ShieldAlert,
    flow: RISK_STATUS_FLOW,
    closingRule:
      "Bloqueado: no se puede pasar a un estado de cierre (Cerrado, Mitigado) sin haber cargado la valoración residual o una verificación.",
  },
  {
    id: "oportunidades",
    label: "Oportunidades",
    appliesTo: "Oportunidades, desde Planificación → Riesgos y Oportunidades",
    icon: ShieldAlert,
    flow: OPPORTUNITY_STATUS_FLOW,
    closingRule:
      "Bloqueado: no se puede pasar a un estado de cierre (Cerrada, Aprovechada) sin haber cargado la valoración residual o una verificación.",
  },
  {
    id: "objetivos",
    label: "Objetivos de Calidad",
    appliesTo: "Objetivos, desde Planificación → Objetivos de Calidad",
    icon: Target,
    flow: OBJECTIVE_STATUS_FLOW,
    closingRule: "Sin bloqueo — son 4 estados posibles, no hay un orden fijo entre ellos.",
  },
];

export default function EstadosPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-12">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
          <CircleDot className="h-6 w-6" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Configuración</p>
          <h1 className="text-2xl font-semibold text-avenida-black">Estados</h1>
        </div>
      </div>

      <p className="text-sm text-avenida-black">
        Cada tipo de registro tiene su propio flujo de estados posibles, ya definido en el portal —
        se elige desde el detalle de cada registro, riesgo/oportunidad u objetivo (pestaña
        correspondiente), no desde acá. Esta pantalla es de referencia, para saber qué opciones hay y
        qué las bloquea.
      </p>

      <div className="flex flex-col gap-4">
        {FLOW_BLOCKS.map((block) => {
          const Icon = block.icon;
          return (
            <Card key={block.id} className="flex flex-col gap-4 p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-avenida-blue-light text-avenida-blue">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex flex-col">
                  <h3 className="text-base font-semibold text-avenida-black">{block.label}</h3>
                  <p className="text-xs text-muted">{block.appliesTo}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {block.flow.map((status) => (
                  <Badge key={status} tone={statusTone(status)}>
                    {status}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-col gap-1 rounded-xl bg-avenida-violet-light/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-avenida-violet">Regla de cierre</p>
                <p className="text-sm text-avenida-black">{block.closingRule}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
