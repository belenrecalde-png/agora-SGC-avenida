import {
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  FileText,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export type StatCardData = {
  label: string;
  value: string;
  trend: number; // porcentaje vs. mes anterior, positivo o negativo
  lowerIsBetter: boolean; // true = que el número baje es la buena noticia (ej. "NC abiertas")
  icon: LucideIcon;
  tone: "violet" | "blue" | "amber" | "green";
};

export const ESTADO_GENERAL: StatCardData[] = [
  { label: "Registros abiertos", value: "42", trend: -18, lowerIsBetter: true, icon: ClipboardList, tone: "blue" },
  { label: "NC abiertas", value: "8", trend: -27, lowerIsBetter: true, icon: AlertTriangle, tone: "amber" },
  { label: "AC en curso", value: "12", trend: 20, lowerIsBetter: false, icon: CheckCircle2, tone: "green" },
  { label: "Riesgos activos", value: "15", trend: -6, lowerIsBetter: true, icon: ShieldAlert, tone: "violet" },
  { label: "Documentos vigentes", value: "138", trend: 4, lowerIsBetter: false, icon: FileText, tone: "blue" },
  { label: "Auditorías del mes", value: "3", trend: 50, lowerIsBetter: false, icon: ShieldCheck, tone: "violet" },
];

export const REQUIEREN_ATENCION = [
  { code: "NC-2026-014", type: "No Conformidad", area: "Producción", owner: "Laura Gómez", due: "16 sep.", status: "En análisis", priority: "Alta" },
  { code: "AC-2026-027", type: "Acción Correctiva", area: "Calidad", owner: "Carlos Méndez", due: "18 sep.", status: "En curso", priority: "Alta" },
  { code: "RSG-2026-009", type: "Riesgo", area: "Logística", owner: "Ana Torres", due: "19 sep.", status: "En evaluación", priority: "Media" },
  { code: "TIC-2026-032", type: "Ticket Plane", area: "IT", owner: "Diego Rojas", due: "20 sep.", status: "Abierto", priority: "Media" },
  { code: "INS-2026-008", type: "Instructivo", area: "Calidad", owner: "María Cortés", due: "22 sep.", status: "Revisión", priority: "Baja" },
];

export const ACTIVIDAD_RECIENTE = [
  { text: "actualizó el documento MAN-SGC-001 Manual de Calidad", who: "María Cortés", time: "hoy, 10:24", icon: FileText, tone: "blue" as const },
  { text: "cerró la Acción Correctiva AC-2026-021", who: "Carlos Méndez", time: "hoy, 09:18", icon: CheckCircle2, tone: "green" as const },
  { text: "creó un nuevo riesgo RSG-2026-009", who: "Ana Torres", time: "ayer, 17:32", icon: ShieldAlert, tone: "amber" as const },
  { text: "comentó en el ticket TIC-2026-028", who: "Julián Pérez", time: "ayer, 14:11", icon: ClipboardList, tone: "violet" as const },
];

export const MIS_PENDIENTES_HOME = [
  { text: "Revisar NC-2026-014", meta: "No Conformidad", due: "Hoy", urgent: true },
  { text: "Aprobar instructivo INS-2026-008", meta: "Documentación", due: "16 sep.", urgent: false },
  { text: "Dar seguimiento a AC-2026-027", meta: "Acción Correctiva", due: "17 sep.", urgent: false },
  { text: "Revisar riesgos del proceso", meta: "Riesgos", due: "19 sep.", urgent: false },
];

export function statusTone(status: string): "violet" | "green" | "gray" | "amber" | "blue" {
  if (["Cerrado", "Implementada", "Eficaz"].includes(status)) return "green";
  if (["En evaluación", "En curso", "En análisis"].includes(status)) return "violet";
  if (["Pendiente", "Revisión"].includes(status)) return "amber";
  if (status === "Abierto") return "blue";
  return "gray";
}

export function priorityTone(priority: string): "green" | "amber" | "red" {
  if (priority === "Alta") return "red";
  if (priority === "Media") return "amber";
  return "green";
}
