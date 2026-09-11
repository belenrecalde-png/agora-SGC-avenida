/**
 * Datos reales para "Mi SGC" (reemplaza `lib/mock-mi-sgc.ts`, mock desde la
 * Fase 1). Server-only — importa de `lib/db/queries.ts`, así que este
 * archivo nunca debe importarse desde un componente "use client" (mismo bug
 * ya documentado dos veces: Fases 8 y 11).
 *
 * No hay ninguna columna "assignee" real en `records` — `reporter_name`,
 * `correction_responsible` y `effectiveness_responsible` son texto libre
 * (a propósito, ver Fase 7/auth: se permite reportar o asignar en nombre de
 * otra persona). Por eso el cruce con el usuario logueado es por nombre
 * (normalizado: sin tildes, sin mayúsculas), no por un ID exacto — funciona
 * bien mientras el nombre cargado coincida con el nombre real de la cuenta
 * de Google, que es el caso normal.
 */
import {
  getRecordById,
  listRecentActivity,
  listRecords,
  type SgcRecord,
} from "@/lib/db/queries";

const CLOSED_STATUSES = new Set(["Cerrado", "Cerrada", "Rechazado"]);

function isOpen(record: SgcRecord): boolean {
  return !CLOSED_STATUSES.has(record.status);
}

const DIACRITICS_PATTERN = new RegExp("[\\u0300-\\u036f]", "g");

function normalizeName(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(DIACRITICS_PATTERN, "")
    .trim()
    .toLowerCase();
}

function isSamePerson(value: string | null | undefined, userName: string): boolean {
  const normalized = normalizeName(value);
  return normalized.length > 0 && normalized === normalizeName(userName);
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const date = value.length <= 10 ? new Date(`${value}T00:00:00`) : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "recién";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} hora${hours === 1 ? "" : "s"}`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ayer";
  if (days < 30) return `hace ${days} días`;
  return formatDate(iso) ?? iso;
}

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(`${dueDate}T00:00:00`) < new Date(new Date().toDateString());
}

export type MiReporte = {
  code: string;
  title: string;
  status: string;
  date: string;
  href: string;
};

/** Reportes hechos por el usuario logueado (cruce por `reporter_name`). */
export function getMisReportes(user: { name: string }, limit = 6): MiReporte[] {
  return listRecords()
    .filter((r) => isSamePerson(r.reporter_name, user.name))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit)
    .map((r) => ({
      code: r.code,
      title: r.title,
      status: r.status,
      date: formatDate(r.created_at) ?? r.created_at,
      href: `/gestion-calidad/registro/${r.code}`,
    }));
}

export type MiAccion = {
  code: string;
  title: string;
  due: string | null;
  status: string;
  href: string;
};

/**
 * Registros abiertos donde el usuario figura como responsable — de la
 * corrección (`correction_responsible`) o de verificar la eficacia
 * (`effectiveness_responsible`). Es lo más parecido a "asignado a mí" que
 * existe hoy en el esquema.
 */
export function getMisAccionesAsignadas(user: { name: string }, limit = 6): MiAccion[] {
  return listRecords()
    .filter(
      (r) =>
        isOpen(r) &&
        (isSamePerson(r.correction_responsible, user.name) || isSamePerson(r.effectiveness_responsible, user.name)),
    )
    .map((r) => {
      const due = r.effective === null && r.correction_date && isSamePerson(r.effectiveness_responsible, user.name)
        ? r.effectiveness_due_date
        : r.due_date;
      return { record: r, due };
    })
    .sort((a, b) => {
      if (!a.due && !b.due) return 0;
      if (!a.due) return 1;
      if (!b.due) return -1;
      return a.due.localeCompare(b.due);
    })
    .slice(0, limit)
    .map(({ record, due }) => ({
      code: record.code,
      title: record.title,
      due: formatDate(due),
      status: record.status,
      href: `/gestion-calidad/registro/${record.code}`,
    }));
}

export type MiVencimiento = {
  code: string;
  label: string;
  due: string;
  overdue: boolean;
  href: string;
};

/** Une reportes propios y acciones asignadas que tengan fecha de vencimiento, ordenados por urgencia. */
export function getMisVencimientos(user: { name: string }, limit = 6): MiVencimiento[] {
  const records = listRecords().filter((r) => isOpen(r));

  const items: { code: string; label: string; due: string; href: string }[] = [];
  for (const r of records) {
    const isReporter = isSamePerson(r.reporter_name, user.name);
    const isCorrectionOwner = isSamePerson(r.correction_responsible, user.name);
    const isEffectivenessOwner = isSamePerson(r.effectiveness_responsible, user.name);
    if (!isReporter && !isCorrectionOwner && !isEffectivenessOwner) continue;

    const due =
      isEffectivenessOwner && r.correction_date && r.effective === null
        ? r.effectiveness_due_date
        : r.due_date;
    if (!due) continue;

    items.push({ code: r.code, label: r.title, due, href: `/gestion-calidad/registro/${r.code}` });
  }

  return items
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, limit)
    .map((item) => ({
      code: item.code,
      label: item.label,
      due: formatDate(item.due) ?? item.due,
      overdue: isOverdue(item.due),
      href: item.href,
    }));
}

export type MiMovimiento = {
  text: string;
  time: string;
  href: string;
};

/** Actividad reciente sobre registros donde el usuario es reportante o responsable. */
export function getMisMovimientosRecientes(user: { name: string }, limit = 6): MiMovimiento[] {
  const entries = listRecentActivity(150);
  const result: MiMovimiento[] = [];
  const recordCache = new Map<string, SgcRecord | undefined>();

  for (const entry of entries) {
    if (result.length >= limit) break;

    let record = recordCache.get(entry.record_id);
    if (record === undefined && !recordCache.has(entry.record_id)) {
      record = getRecordById(entry.record_id);
      recordCache.set(entry.record_id, record);
    }
    if (!record) continue;

    const isRelated =
      isSamePerson(record.reporter_name, user.name) ||
      isSamePerson(record.correction_responsible, user.name) ||
      isSamePerson(record.effectiveness_responsible, user.name);
    if (!isRelated) continue;

    result.push({
      text: `${record.code} — ${entry.event}${entry.detail ? `: ${entry.detail}` : ""}`,
      time: formatRelativeTime(entry.created_at),
      href: `/gestion-calidad/registro/${record.code}`,
    });
  }

  return result;
}
