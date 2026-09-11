import { MessageSquareWarning } from "lucide-react";
import { TipoRegistroView } from "@/components/gestion-calidad/tipo-registro-view";
import { loadTipoRegistroData } from "@/lib/gestion-tipo";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Quejas | Ágora`,
};

export default async function Page() {
  const { records, types, areas } = await loadTipoRegistroData("Q");
  return (
    <TipoRegistroView
      title="Quejas"
      description="Manifestaciones de insatisfacción sobre un servicio, proceso o atención, con posibilidad de vincularlas a una NC o AC."
      icon={MessageSquareWarning}
      records={records}
      types={types}
      areas={areas}
    />
  );
}
