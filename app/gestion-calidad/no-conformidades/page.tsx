import { AlertTriangle } from "lucide-react";
import { TipoRegistroView } from "@/components/gestion-calidad/tipo-registro-view";
import { loadTipoRegistroData } from "@/lib/gestion-tipo";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `No Conformidades | Ágora`,
};

export default async function Page() {
  const { records, types, areas } = await loadTipoRegistroData("NC");
  return (
    <TipoRegistroView
      title="No Conformidades"
      description="Incumplimientos de requisitos: corrección inmediata, análisis de causa raíz (5 Por Qué, Ishikawa), Acción Correctiva asociada y verificación de eficacia."
      icon={AlertTriangle}
      records={records}
      types={types}
      areas={areas}
    />
  );
}
