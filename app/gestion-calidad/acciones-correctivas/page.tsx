import { Wrench } from "lucide-react";
import { TipoRegistroView } from "@/components/gestion-calidad/tipo-registro-view";
import { loadTipoRegistroData } from "@/lib/gestion-tipo";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Acciones Correctivas | Ágora`,
};

export default async function Page() {
  const { records, types, areas } = await loadTipoRegistroData("AC");
  return (
    <TipoRegistroView
      title="Acciones Correctivas"
      description="Acciones para eliminar la causa raíz de una No Conformidad y evitar su recurrencia, con seguimiento de estado hasta el cierre verificado."
      icon={Wrench}
      records={records}
      types={types}
      areas={areas}
    />
  );
}
