import { ShieldAlert } from "lucide-react";
import { TipoRegistroView } from "@/components/gestion-calidad/tipo-registro-view";
import { loadTipoRegistroData } from "@/lib/gestion-tipo";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Acciones Preventivas | Ágora`,
};

export default async function Page() {
  const { records, types, areas } = await loadTipoRegistroData("AP");
  return (
    <TipoRegistroView
      title="Acciones Preventivas"
      description="Acciones tomadas ante situaciones potenciales, antes de que el problema ocurra, relacionadas con riesgos, oportunidades y controles."
      icon={ShieldAlert}
      records={records}
      types={types}
      areas={areas}
    />
  );
}
