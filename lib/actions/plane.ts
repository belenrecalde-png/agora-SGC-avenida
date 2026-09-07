"use server";

import { revalidatePath } from "next/cache";
import {
  addPlaneSyncLog,
  deletePlaneProjectMapping,
  togglePlaneProjectMappingActive,
  upsertPlaneProjectMapping,
} from "@/lib/db/queries";
import { PlaneApiError, testConnection } from "@/lib/plane/client";
import { syncAllRecordsStatusFromPlane } from "@/lib/plane/sync";

function refreshPlaneScreens() {
  revalidatePath("/configuracion/plane");
  revalidatePath("/configuracion/logs");
}

export async function upsertPlaneMappingAction(formData: FormData): Promise<void> {
  const areaId = String(formData.get("areaId") ?? "").trim();
  const planeProjectId = String(formData.get("planeProjectId") ?? "").trim();
  const planeProjectName = String(formData.get("planeProjectName") ?? "").trim() || null;

  if (!areaId || !planeProjectId) {
    throw new Error("Hace falta elegir un área y cargar el ID de proyecto de Plane.");
  }

  upsertPlaneProjectMapping({ areaId, planeProjectId, planeProjectName });
  refreshPlaneScreens();
}

export async function togglePlaneMappingAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  togglePlaneProjectMappingActive(id);
  refreshPlaneScreens();
}

export async function deletePlaneMappingAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  deletePlaneProjectMapping(id);
  refreshPlaneScreens();
}

/**
 * "Probar conexión" de un mapeo área↔proyecto. El resultado no se devuelve
 * inline (esto es un <form action> tradicional, sin JS en el cliente) — queda
 * escrito en `plane_sync_logs` y aparece de inmediato en la lista de
 * "Últimos intentos" de esta misma pantalla y en Configuración → Logs.
 */
export async function testPlaneConnectionAction(formData: FormData): Promise<void> {
  const planeProjectId = String(formData.get("planeProjectId") ?? "").trim();
  if (!planeProjectId) return;

  try {
    const info = await testConnection(planeProjectId);
    addPlaneSyncLog({
      direction: "portal_to_plane",
      planeProjectId,
      event: "Prueba de conexión",
      status: "success",
      detail: `Conectado correctamente al proyecto "${info.name ?? planeProjectId}".`,
    });
  } catch (error) {
    const message =
      error instanceof PlaneApiError || error instanceof Error
        ? error.message
        : "Error desconocido al probar la conexión con Plane.";
    addPlaneSyncLog({
      direction: "portal_to_plane",
      planeProjectId,
      event: "Prueba de conexión",
      status: "error",
      detail: message,
    });
  }

  refreshPlaneScreens();
}

/** "Sincronizar ahora" — refresca el estado de los tickets que el portal ya conoce. */
export async function syncNowAction(): Promise<void> {
  await syncAllRecordsStatusFromPlane();
  refreshPlaneScreens();
  revalidatePath("/gestion-calidad/registro");
}
