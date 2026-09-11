import { Lightbulb } from "lucide-react";
import { TipoRegistroView } from "@/components/gestion-calidad/tipo-registro-view";
import { loadTipoRegistroData } from "@/lib/gestion-tipo";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Oportunidades de Mejora | Ágora`,
};

export default async function Page() {
  const { records, types, areas } = await loadTipoRegistroData("OM");
  return (
    <TipoRegistroView
      title="Oportunidades de Mejora"
      description="Ideas para hacer más simple, rápido o eficiente un proceso, evaluadas con la matriz Impacto/Esfuerzo."
      icon={Lightbulb}
      records={records}
      types={types}
      areas={areas}
    />
  );
}
