import { MessageSquare } from "lucide-react";
import { TipoRegistroView } from "@/components/gestion-calidad/tipo-registro-view";
import { loadTipoRegistroData } from "@/lib/gestion-tipo";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Sugerencias | Ágora`,
};

export default async function Page() {
  const { records, types, areas } = await loadTipoRegistroData("S");
  return (
    <TipoRegistroView
      title="Sugerencias"
      description="Propuestas o recomendaciones de cualquier colaborador, con seguimiento de evaluación hasta su implementación."
      icon={MessageSquare}
      records={records}
      types={types}
      areas={areas}
    />
  );
}
