"use server";

import { redirect } from "next/navigation";
import { createRecord, getRecordTypeByCode } from "@/lib/db/queries";
import { syncRecordToPlane } from "@/lib/plane/sync";

export async function createReportAction(formData: FormData): Promise<void> {
  const typeCode = String(formData.get("typeCode") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const areaId = String(formData.get("areaId") ?? "").trim() || null;
  const processName = String(formData.get("processName") ?? "").trim() || null;
  const reporterName = String(formData.get("reporterName") ?? "").trim();
  const eventDate = String(formData.get("eventDate") ?? "").trim() || null;
  const impact = String(formData.get("impact") ?? "").trim() || null;
  const priority = (String(formData.get("priority") ?? "Media").trim() || "Media") as "Baja" | "Media" | "Alta";
  const urgent = formData.get("urgent") === "on";
  const evidenceNote = String(formData.get("evidenceNote") ?? "").trim() || null;
  const comments = String(formData.get("comments") ?? "").trim() || null;

  if (!typeCode || !title || !description || !reporterName) {
    throw new Error("Faltan campos obligatorios del reporte.");
  }

  const record = createRecord({
    typeCode,
    title,
    description,
    areaId,
    processName,
    reporterName,
    eventDate,
    impact,
    priority,
    urgent,
    evidenceNote,
    comments,
  });

  // Fase 4: intenta crear el work item en Plane correspondiente. Nunca rompe
  // el envío del reporte — si Plane no está configurado o falla, el registro
  // queda creado igual y la situación se documenta en su historial.
  const type = getRecordTypeByCode(typeCode);
  if (type) {
    await syncRecordToPlane(record, type);
  }

  redirect(`/reportar/confirmacion/${record.code}`);
}
