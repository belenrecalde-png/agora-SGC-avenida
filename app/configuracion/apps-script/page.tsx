import Link from "next/link";
import { ArrowRight, ScrollText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: `Apps Script | Ágora`,
};

/**
 * A diferencia del resto de Configuración, esta pantalla no tiene nada para
 * configurar desde acá — es solo una explicación. El Registro de Gestión en
 * Sheets es el sistema real de Calidad, corre en su propio proyecto de Apps
 * Script (`apps-script/plane-integracion-sgc.gs`), y el portal no tiene
 * forma de leer su estado ni su historial. Ver `claude/progreso-implementacion.md`
 * (Fase 5) para el detalle completo de esa integración.
 */
export default function Page() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-12">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-avenida-violet-light text-avenida-violet">
          <ScrollText className="h-6 w-6" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Configuración</p>
          <h1 className="text-2xl font-semibold text-avenida-black">Apps Script</h1>
        </div>
      </div>

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-avenida-black">Registro de Gestión en Google Sheets</p>
          <Badge tone="blue">Independiente del portal</Badge>
        </div>
        <p className="text-sm text-avenida-black">
          Esta pantalla no tiene nada para configurar acá adentro — a propósito, no es que falte
          construirla. El Registro de Gestión es el sistema real de Calidad y corre por completo
          afuera de Ágora, en un proyecto de Google Apps Script vinculado a esa planilla. Ya está
          conectado a Plane del lado de Sheets (trigger de entrada y salida cada cierto tiempo) y
          funcionando en producción.
        </p>
        <p className="text-sm text-avenida-black">
          Como corre en otro sistema, el portal no tiene forma de leer su estado, su historial de
          corridas ni sus errores en tiempo real — por eso esta pantalla no muestra números ni
          controles, a diferencia de Configuración → Plane. Es una integración separada de la de
          Plane: una sincroniza los reportes cargados en el portal, la otra sincroniza la planilla
          de Sheets — no se cruzan entre sí todavía.
        </p>
        <Link
          href="/configuracion/integraciones"
          className="inline-flex w-fit items-center gap-1 text-sm font-medium text-avenida-violet hover:underline"
        >
          Ver panel de Integraciones <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Card>
    </div>
  );
}
