/**
 * Datos para las pantallas "por tipo" de Gestión de Calidad (No Conformidades,
 * Acciones Correctivas, Acciones Preventivas, Oportunidades de Mejora, Quejas,
 * Sugerencias, Reclamos) — antes placeholders sin datos reales (`PlaceholderPage`),
 * ahora reutilizan el mismo Registro SGC pre-filtrado a un solo tipo, con la
 * misma autorización por rol/área que la pantalla general.
 */
import "server-only";
import { listAreas, listRecordTypes, listRecords } from "@/lib/db/queries";
import { filterByAreaAccess, requireGestionAccess } from "@/lib/auth/access";

export async function loadTipoRegistroData(typeCode: string) {
  const user = await requireGestionAccess();
  const types = listRecordTypes();
  const areas = listAreas();
  const type = types.find((t) => t.code === typeCode);
  const records = type ? filterByAreaAccess(listRecords(), user).filter((r) => r.type_id === type.id) : [];
  return { records, types, areas };
}
