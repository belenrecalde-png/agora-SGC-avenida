/**
 * Evaluación → Seguimiento. Vista detallada y filtrable de vencimientos,
 * reincidencias y cumplimiento por área — el Home (Fase 14) ya muestra un
 * resumen ejecutivo de esto mismo (Vencimientos próximos, Evolución
 * mensual); esta pantalla es la versión completa/filtrable que el Home no
 * tiene, no un duplicado (ver `lib/dashboard-data.ts` para el resumen).
 */
import "server-only";
import { listAreas, listRecordTypes, listRecords, listRisks, type PortalUser } from "@/lib/db/queries";
import { filterByAreaAccess } from "@/lib/auth/access";

const CLOSED_RECORD_STATUSES = new Set(["Cerrado", "Cerrada", "Rechazado"]);
const CLOSED_RISK_STATUSES = new Set(["Cerrado", "Cerrada", "Mitigado", "Aprovechada", "Descartada"]);

function daysBetween(dueDate: string): number {
  const due = new Date(`${dueDate}T00:00:00`);
  const today = new Date(new Date().toDateString());
  return Math.round((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
}

export type SeguimientoItem = {
  code: string;
  href: string;
  type: string;
  title: string;
  areaId: string | null;
  area: string;
  owner: string;
  dueDate: string;
  daysOverdue: number;
  overdue: boolean;
  status: string;
};

/** Todos los registros y riesgos abiertos con vencimiento cargado (sin límite — a diferencia del Home). */
export function getSeguimientoItems(user: PortalUser): SeguimientoItem[] {
  const areas = listAreas();
  const areaById = new Map(areas.map((a) => [a.id, a]));
  const types = listRecordTypes();
  const typeById = new Map(types.map((t) => [t.id, t]));

  const records = filterByAreaAccess(listRecords(), user).filter(
    (r) => !CLOSED_RECORD_STATUSES.has(r.status) && r.due_date,
  );
  const risks = filterByAreaAccess(listRisks({ kind: "riesgo" }), user).filter(
    (r) => !CLOSED_RISK_STATUSES.has(r.status) && r.due_date,
  );

  const fromRecords: SeguimientoItem[] = records.map((r) => {
    const daysOverdue = daysBetween(r.due_date!);
    return {
      code: r.code,
      href: `/gestion-calidad/registro/${r.code}`,
      type: typeById.get(r.type_id)?.code ?? "—",
      title: r.title,
      areaId: r.area_id,
      area: r.area_id ? (areaById.get(r.area_id)?.name ?? "Sin definir") : "Sin definir",
      owner: r.reporter_name,
      dueDate: r.due_date!,
      daysOverdue,
      overdue: daysOverdue > 0,
      status: r.status,
    };
  });

  const fromRisks: SeguimientoItem[] = risks.map((r) => {
    const daysOverdue = daysBetween(r.due_date!);
    return {
      code: r.code,
      href: `/planificacion/riesgos-y-oportunidades/${r.code}`,
      type: "Riesgo",
      title: r.description,
      areaId: r.area_id,
      area: r.area_id ? (areaById.get(r.area_id)?.name ?? "Sin definir") : "Sin definir",
      owner: r.responsible ?? "Sin definir",
      dueDate: r.due_date!,
      daysOverdue,
      overdue: daysOverdue > 0,
      status: r.status,
    };
  });

  return [...fromRecords, ...fromRisks].sort((a, b) => b.daysOverdue - a.daysOverdue);
}

export type ReincidenciaItem = {
  processName: string;
  count: number;
  codes: { code: string; href: string }[];
};

/**
 * Procesos con más de una No Conformidad registrada — la definición más
 * simple y verificable de "reincidencia" con los datos que ya existen (no
 * hay un campo explícito "es reincidente" en el registro).
 */
export function getReincidencias(user: PortalUser, minCount = 2): ReincidenciaItem[] {
  const types = listRecordTypes();
  const ncType = types.find((t) => t.code === "NC");
  if (!ncType) return [];

  const records = filterByAreaAccess(listRecords(), user).filter(
    (r) => r.type_id === ncType.id && r.process_name && r.process_name.trim(),
  );

  const groups = new Map<string, { code: string; href: string }[]>();
  for (const r of records) {
    const key = r.process_name!.trim();
    const list = groups.get(key) ?? [];
    list.push({ code: r.code, href: `/gestion-calidad/registro/${r.code}` });
    groups.set(key, list);
  }

  return [...groups.entries()]
    .map(([processName, codes]) => ({ processName, count: codes.length, codes }))
    .filter((g) => g.count >= minCount)
    .sort((a, b) => b.count - a.count);
}

export type CumplimientoPorArea = {
  areaName: string;
  total: number;
  cerrados: number;
  vencidos: number;
  pctCerrado: number;
};

export function getCumplimientoPorArea(user: PortalUser): CumplimientoPorArea[] {
  const areas = listAreas();
  const records = filterByAreaAccess(listRecords(), user);

  return areas
    .map((area) => {
      const areaRecords = records.filter((r) => r.area_id === area.id);
      const total = areaRecords.length;
      const cerrados = areaRecords.filter((r) => CLOSED_RECORD_STATUSES.has(r.status)).length;
      const vencidos = areaRecords.filter(
        (r) => r.due_date && !CLOSED_RECORD_STATUSES.has(r.status) && daysBetween(r.due_date) > 0,
      ).length;
      return {
        areaName: area.name,
        total,
        cerrados,
        vencidos,
        pctCerrado: total > 0 ? Math.round((cerrados / total) * 100) : 0,
      };
    })
    .filter((a) => a.total > 0)
    .sort((a, b) => b.total - a.total);
}
