/**
 * Agregaciones para el Home/Dashboard (Fase 14). Server-only — importa
 * libremente de `lib/db/queries.ts` (que abre `node:sqlite`), así que este
 * archivo nunca debe ser importado desde un componente "use client" (mismo
 * bug ya documentado dos veces en memoria: Fase 8 y Fase 11).
 *
 * No hay tabla ni columna nueva — todo se calcula en el momento a partir de
 * `listRecords`/`listRisks`/`listObjectives`/`listIndicators`, ya construidos
 * en fases anteriores.
 */
import { getRiskBand, getRiskScore } from "@/lib/risk-scoring";
import { getIndicatorToleranceStatus } from "@/lib/indicator-scoring";
import {
  getIndicatorById,
  getObjectiveById,
  getRecordById,
  getRiskById,
  listAreas,
  listIndicators,
  listObjectives,
  listRecentActivity,
  listRecords,
  listRecordTypes,
  listRisks,
  type SgcRecord,
  type SgcRisk,
} from "@/lib/db/queries";

const CLOSED_RECORD_STATUSES = new Set(["Cerrado", "Cerrada", "Rechazado"]);
const CLOSED_RISK_STATUSES = new Set(["Cerrado", "Cerrada", "Mitigado", "Aprovechada", "Descartada"]);

function isRecordOpen(record: SgcRecord): boolean {
  return !CLOSED_RECORD_STATUSES.has(record.status);
}

function isRiskOpen(risk: SgcRisk): boolean {
  return !CLOSED_RISK_STATUSES.has(risk.status);
}

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(`${dueDate}T00:00:00`) < new Date(new Date().toDateString());
}

export type DashboardStats = {
  registrosAbiertos: number;
  registrosVencidos: number;
  ncAbiertas: number;
  acAbiertasVencidas: number;
  riesgosAltosAbiertos: number;
  acEficaces: number | null; // porcentaje 0-100, null si no hay AC verificadas todavía
  objetivosEnRiesgoOIncumplidos: number;
  indicadoresFueraDeTolerancia: number;
};

export function getDashboardStats(): DashboardStats {
  const records = listRecords();
  const risks = listRisks({ kind: "riesgo" });
  const objectives = listObjectives();
  const indicators = listIndicators();
  const types = listRecordTypes();
  const typeById = new Map(types.map((t) => [t.id, t]));

  const openRecords = records.filter(isRecordOpen);
  const registrosVencidos = openRecords.filter((r) => isOverdue(r.due_date)).length;

  const ncRecords = records.filter((r) => typeById.get(r.type_id)?.code === "NC");
  const acRecords = records.filter((r) => typeById.get(r.type_id)?.code === "AC");
  const ncAbiertas = ncRecords.filter(isRecordOpen).length;
  const acAbiertasVencidas = acRecords.filter((r) => isRecordOpen(r) || isOverdue(r.due_date)).length;

  const acVerified = acRecords.filter((r) => r.effective !== null);
  const acEficaces =
    acVerified.length === 0 ? null : Math.round((acVerified.filter((r) => r.effective === true).length / acVerified.length) * 100);

  const riesgosAltosAbiertos = risks.filter((r) => {
    if (!isRiskOpen(r)) return false;
    const score = getRiskScore(r.probability_initial, r.impact_initial);
    return getRiskBand("riesgo", score).tone === "red";
  }).length;

  const objetivosEnRiesgoOIncumplidos = objectives.filter((o) => o.status === "En riesgo" || o.status === "Incumplido").length;
  const indicadoresFueraDeTolerancia = indicators.filter((i) => getIndicatorToleranceStatus(i).tone === "red").length;

  return {
    registrosAbiertos: openRecords.length,
    registrosVencidos,
    ncAbiertas,
    acAbiertasVencidas,
    riesgosAltosAbiertos,
    acEficaces,
    objetivosEnRiesgoOIncumplidos,
    indicadoresFueraDeTolerancia,
  };
}

export type AttentionItem = {
  code: string;
  href: string;
  type: string;
  title: string;
  area: string;
  owner: string;
  due: string;
  daysOverdue: number | null; // positivo = vencido hace N días, negativo = faltan N días, null = sin fecha
  status: string;
  priority: "Baja" | "Media" | "Alta";
};

function riskPriority(risk: SgcRisk): "Baja" | "Media" | "Alta" {
  const score = getRiskScore(risk.probability_initial, risk.impact_initial);
  const tone = getRiskBand("riesgo", score).tone;
  if (tone === "red") return "Alta";
  if (tone === "amber") return "Media";
  return "Baja";
}

function formatDue(dueDate: string, daysOverdue: number): string {
  if (daysOverdue > 0) return `Vencido hace ${daysOverdue} día${daysOverdue === 1 ? "" : "s"}`;
  if (daysOverdue === 0) return "Vence hoy";
  const remaining = Math.abs(daysOverdue);
  return `En ${remaining} día${remaining === 1 ? "" : "s"} (${dueDate})`;
}

function daysBetween(dueDate: string): number {
  const due = new Date(`${dueDate}T00:00:00`);
  const today = new Date(new Date().toDateString());
  return Math.round((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
}

function buildAttentionUniverse(): AttentionItem[] {
  const records = listRecords().filter((r) => isRecordOpen(r) && r.due_date);
  const risks = listRisks({ kind: "riesgo" }).filter((r) => isRiskOpen(r) && r.due_date);
  const types = listRecordTypes();
  const typeById = new Map(types.map((t) => [t.id, t]));
  const areas = listAreas();
  const areaById = new Map(areas.map((a) => [a.id, a]));

  const fromRecords: AttentionItem[] = records.map((record) => {
    const daysOverdue = daysBetween(record.due_date!);
    return {
      code: record.code,
      href: `/gestion-calidad/registro/${record.code}`,
      type: typeById.get(record.type_id)?.code ?? "—",
      title: record.title,
      area: record.area_id ? (areaById.get(record.area_id)?.name ?? "Sin definir") : "Sin definir",
      owner: record.reporter_name,
      due: formatDue(record.due_date!, daysOverdue),
      daysOverdue,
      status: record.status,
      priority: record.priority,
    };
  });

  const fromRisks: AttentionItem[] = risks.map((risk) => {
    const daysOverdue = daysBetween(risk.due_date!);
    return {
      code: risk.code,
      href: `/planificacion/riesgos-y-oportunidades/${risk.code}`,
      type: "Riesgo",
      title: risk.description,
      area: risk.area_id ? (areaById.get(risk.area_id)?.name ?? "Sin definir") : "Sin definir",
      owner: risk.responsible ?? "Sin definir",
      due: formatDue(risk.due_date!, daysOverdue),
      daysOverdue,
      status: risk.status,
      priority: riskPriority(risk),
    };
  });

  return [...fromRecords, ...fromRisks];
}

const PRIORITY_WEIGHT: Record<AttentionItem["priority"], number> = { Alta: 0, Media: 1, Baja: 2 };

/** Vencidos primero (más vencido primero), después por prioridad, después por fecha más próxima — tal como pide la spec. */
export function getAttentionItems(limit = 8): AttentionItem[] {
  return buildAttentionUniverse()
    .sort((a, b) => {
      const aOverdue = (a.daysOverdue ?? -Infinity) > 0;
      const bOverdue = (b.daysOverdue ?? -Infinity) > 0;
      if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
      if (aOverdue && bOverdue) return (b.daysOverdue ?? 0) - (a.daysOverdue ?? 0);
      if (PRIORITY_WEIGHT[a.priority] !== PRIORITY_WEIGHT[b.priority]) return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
      return (a.daysOverdue ?? 0) - (b.daysOverdue ?? 0);
    })
    .slice(0, limit);
}

/** Reemplaza "Mis pendientes" (no hay auth real, no se puede filtrar por usuario) — próximos 7 días, sin vencer todavía. */
export function getUpcomingDueItems(limit = 6): AttentionItem[] {
  return buildAttentionUniverse()
    .filter((item) => item.daysOverdue !== null && item.daysOverdue <= 0 && item.daysOverdue >= -7)
    .sort((a, b) => (a.daysOverdue ?? 0) - (b.daysOverdue ?? 0))
    .slice(0, limit);
}

export type BarDatum = { label: string; value: number };

export function getRecordsByType(): BarDatum[] {
  const records = listRecords();
  const types = listRecordTypes();
  return types
    .map((type) => ({ label: type.code, value: records.filter((r) => r.type_id === type.id).length }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);
}

export function getRecordsByArea(): BarDatum[] {
  const records = listRecords();
  const areas = listAreas();
  const areaById = new Map(areas.map((a) => [a.id, a]));
  const counts = new Map<string, number>();
  for (const record of records) {
    const label = record.area_id ? (areaById.get(record.area_id)?.name ?? "Sin definir") : "Sin definir";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

export type MonthlyPoint = { period: string; actual: number | null; target: number | null };

/** "Creados" (actual) vs. "Cerrados" (target) por mes — reutiliza `TrendChart` con leyendas propias. */
export function getMonthlyEvolution(months = 6): MonthlyPoint[] {
  const records = listRecords();
  const now = new Date();
  const buckets: { key: string; created: number; closed: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, created: 0, closed: 0 });
  }
  const bucketByKey = new Map(buckets.map((b) => [b.key, b]));

  for (const record of records) {
    const createdKey = record.created_at.slice(0, 7);
    const bucket = bucketByKey.get(createdKey);
    if (bucket) bucket.created += 1;
    if (record.closed_at) {
      const closedBucket = bucketByKey.get(record.closed_at.slice(0, 7));
      if (closedBucket) closedBucket.closed += 1;
    }
  }

  return buckets.map((b) => ({ period: b.key, actual: b.created, target: b.closed }));
}

export type ActivityFeedItem = {
  id: string;
  event: string;
  detail: string | null;
  createdAt: string;
  entityLabel: string;
  href: string;
};

/**
 * Feed de actividad reciente con la entidad de origen ya resuelta (probando
 * registro → riesgo → objetivo → indicador, mismo `id` genérico sin FK real
 * desde la Fase 8). Sin actor (`activity_log` no guarda quién hizo la
 * acción — no hay auth real, ver nota de la Fase 14 en el progreso).
 */
export function getRecentActivityFeed(limit = 6): ActivityFeedItem[] {
  const entries = listRecentActivity(limit * 2);
  const resolved: ActivityFeedItem[] = [];

  for (const entry of entries) {
    if (resolved.length >= limit) break;
    const record = getRecordById(entry.record_id);
    if (record) {
      resolved.push({
        id: entry.id,
        event: entry.event,
        detail: entry.detail,
        createdAt: entry.created_at,
        entityLabel: `${record.code} — ${record.title}`,
        href: `/gestion-calidad/registro/${record.code}`,
      });
      continue;
    }
    const risk = getRiskById(entry.record_id);
    if (risk) {
      resolved.push({
        id: entry.id,
        event: entry.event,
        detail: entry.detail,
        createdAt: entry.created_at,
        entityLabel: `${risk.code} — ${risk.description}`,
        href: `/planificacion/riesgos-y-oportunidades/${risk.code}`,
      });
      continue;
    }
    const objective = getObjectiveById(entry.record_id);
    if (objective) {
      resolved.push({
        id: entry.id,
        event: entry.event,
        detail: entry.detail,
        createdAt: entry.created_at,
        entityLabel: `${objective.code} — ${objective.title}`,
        href: `/planificacion/objetivos-de-calidad/${objective.code}`,
      });
      continue;
    }
    const indicator = getIndicatorById(entry.record_id);
    if (indicator) {
      resolved.push({
        id: entry.id,
        event: entry.event,
        detail: entry.detail,
        createdAt: entry.created_at,
        entityLabel: `${indicator.code} — ${indicator.name}`,
        href: `/evaluacion/indicadores/${indicator.code}`,
      });
    }
  }

  return resolved;
}
