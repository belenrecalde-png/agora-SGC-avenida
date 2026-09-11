import { FileWarning } from "lucide-react";
import { TipoRegistroView } from "@/components/gestion-calidad/tipo-registro-view";
import { loadTipoRegistroData } from "@/lib/gestion-tipo";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Reclamos | Ágora`,
};

export default async function Page() {
  const { records, types, areas } = await loadTipoRegistroData("R");
  return (
    <TipoRegistroView
      title="Reclamos"
      description="Solicitudes formales de resolución ante un incumplimiento, con fecha compromiso y respuesta, vinculables a NC o AC."
      icon={FileWarning}
      records={records}
      types={types}
      areas={areas}
    />
  );
}
