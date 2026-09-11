"use server";

import { requireUser } from "@/lib/auth/dal";
import { updateNotificationsLastSeenAt } from "@/lib/db/queries";

/** Se llama al abrir la campana de notificaciones — marca todo lo visto hasta ahora como leído. */
export async function markNotificationsSeenAction(): Promise<void> {
  const user = await requireUser();
  updateNotificationsLastSeenAt(user.id);
}
