/**
 * Notificaciones reales de la campana del header (reemplaza
 * `MOCK_UNREAD_NOTIFICATIONS` en `components/layout/header.tsx`).
 *
 * No hay una tabla de notificaciones separada: se reutiliza `activity_log`
 * filtrado a lo relevante para el usuario (mismo criterio que "Mi SGC" →
 * Últimos movimientos, ver `lib/mi-sgc-data.ts` — reportante o responsable de
 * corrección/verificación de un registro), y se compara la fecha de cada
 * evento contra `users.notifications_last_seen_at` para decidir si está leído.
 */
import "server-only";
import { getRecordById, listRecentActivity, type PortalUser, type SgcRecord } from "@/lib/db/queries";
import { isRecordOwner } from "@/lib/auth/access";

export type NotificationItem = {
  id: string;
  text: string;
  time: string;
  href: string;
  read: boolean;
};

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
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

/** Notificaciones recientes relevantes para el usuario, más nuevas primero. */
export function getNotificationsForUser(user: PortalUser, limit = 15): NotificationItem[] {
  const entries = listRecentActivity(150);
  const result: NotificationItem[] = [];
  const recordCache = new Map<string, SgcRecord | undefined>();
  const lastSeen = user.notifications_last_seen_at;

  for (const entry of entries) {
    if (result.length >= limit) break;

    let record = recordCache.get(entry.record_id);
    if (record === undefined && !recordCache.has(entry.record_id)) {
      record = getRecordById(entry.record_id);
      recordCache.set(entry.record_id, record);
    }
    if (!record) continue;
    if (!isRecordOwner(record, user)) continue;

    result.push({
      id: entry.id,
      text: `${record.code} — ${entry.event}${entry.detail ? `: ${entry.detail}` : ""}`,
      time: formatRelativeTime(entry.created_at),
      href: `/gestion-calidad/registro/${record.code}`,
      read: lastSeen !== null && entry.created_at <= lastSeen,
    });
  }

  return result;
}

export function countUnreadNotifications(user: PortalUser): number {
  return getNotificationsForUser(user, 50).filter((n) => !n.read).length;
}
