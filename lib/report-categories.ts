import {
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  FileWarning,
  MessageSquareWarning,
  MessageSquare,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

export type ReportCategory = {
  id: string;
  title: string;
  description: string;
  examples: string[];
  suggestedTypes: string[];
  icon: LucideIcon;
};

export const REPORT_CATEGORIES: ReportCategory[] = [
  {
    id: "no-salio-como-debia",
    title: "Algo no salió como debía",
    description:
      "Algo que estaba definido no se cumplió o no funcionó correctamente.",
    examples: [
      "procedimiento no cumplido",
      "SLA incumplido",
      "falla operativa",
      "actividad no realizada",
      "error recurrente",
      "control que no funcionó",
      "servicio incorrecto",
    ],
    suggestedTypes: ["NC"],
    icon: AlertTriangle,
  },
  {
    id: "idea-para-mejorar",
    title: "Tengo una idea para mejorar algo",
    description:
      "Identificaste una forma de hacer mejor, más simple o más eficiente una actividad.",
    examples: [
      "automatización",
      "mejora de proceso",
      "nuevo control",
      "eliminación de tareas manuales",
      "mejora de herramienta",
    ],
    suggestedTypes: ["OM", "S"],
    icon: Lightbulb,
  },
  {
    id: "podria-generar-un-problema",
    title: "Detecté algo que podría generar un problema",
    description:
      "El problema todavía no ocurrió, pero identificaste una situación que podría afectarnos.",
    examples: [
      "dependencia de una persona",
      "proveedor crítico",
      "falta de control",
      "falla potencial",
      "proceso manual",
      "riesgo tecnológico",
      "información desactualizada",
    ],
    suggestedTypes: ["Riesgo", "AP", "OM"],
    icon: ShieldAlert,
  },
  {
    id: "reclamo",
    title: "Quiero realizar un reclamo",
    description:
      "Necesitás solicitar formalmente la resolución de un incumplimiento o problema.",
    examples: [],
    suggestedTypes: ["R"],
    icon: FileWarning,
  },
  {
    id: "queja",
    title: "Quiero realizar una queja",
    description:
      "Querés manifestar insatisfacción respecto de un servicio, proceso o atención.",
    examples: [],
    suggestedTypes: ["Q"],
    icon: MessageSquareWarning,
  },
  {
    id: "sugerencia",
    title: "Quiero realizar una sugerencia",
    description: "Querés proponer una idea o recomendación.",
    examples: [],
    suggestedTypes: ["S"],
    icon: MessageSquare,
  },
  {
    id: "otro",
    title: "Otro",
    description:
      "No estás seguro de cómo encuadrarlo. Contanos igual — el área de Calidad hace la clasificación final.",
    examples: [],
    suggestedTypes: [],
    icon: HelpCircle,
  },
];
