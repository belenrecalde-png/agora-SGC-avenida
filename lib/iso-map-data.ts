/**
 * Mapa de ISO 9001 ("Entendiendo nuestro SGC"), spec sección 36-47.
 * Contenido propio, explicativo — no reproduce texto de la norma.
 */
import {
  Compass,
  Crown,
  Target,
  LifeBuoy,
  Cog,
  Gauge,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export type IsoBlock = {
  id: string;
  label: string;
  icon: LucideIcon;
  whatItMeans: string;
  howWeDoItAtAvenida: string;
  supportingDocuments: string;
  whoIsInvolved: string;
  whatICanDoFromThePortal: string;
};

export const ISO_MAP: IsoBlock[] = [
  {
    id: "contexto",
    label: "Contexto",
    icon: Compass,
    whatItMeans: "Entender qué pasa adentro y afuera de la organización, y quiénes son las partes interesadas relevantes.",
    howWeDoItAtAvenida:
      "Analizamos el entorno regulatorio de medios de pago, la relación con bancos y sellers, y factores internos como la estructura de equipos.",
    supportingDocuments: "Análisis de contexto y matriz de partes interesadas — los mantiene Calidad puertas adentro.",
    whoIsInvolved: "Dirección, con aportes de Calidad y de los responsables de cada proceso.",
    whatICanDoFromThePortal: "Consultar Planificación → Contexto y partes interesadas.",
  },
  {
    id: "liderazgo",
    label: "Liderazgo",
    icon: Crown,
    whatItMeans: "El compromiso visible de la Dirección con la calidad, y que los roles y responsabilidades estén claros.",
    howWeDoItAtAvenida: "La Dirección define la Política de Calidad y revisa periódicamente el desempeño del SGC completo.",
    supportingDocuments: "Política de Calidad, organigrama y definición de roles.",
    whoIsInvolved: "Dirección y responsables de área.",
    whatICanDoFromThePortal:
      "Leer la Política de Calidad en Centro de Conocimiento → Conceptos, y ver tu rol real desde el menú de tu cuenta.",
  },
  {
    id: "planificacion",
    label: "Planificación",
    icon: Target,
    whatItMeans: "Definir objetivos de calidad medibles y anticipar riesgos y oportunidades antes de que se conviertan en problemas.",
    howWeDoItAtAvenida: "Definimos objetivos por proceso (por ejemplo, tiempos de onboarding) y mantenemos un registro vivo de riesgos y oportunidades.",
    supportingDocuments: "Objetivos de Calidad, matriz de riesgos y oportunidades.",
    whoIsInvolved: "Responsables de proceso, con supervisión de Calidad.",
    whatICanDoFromThePortal: "Reportar un riesgo u oportunidad, o consultar los objetivos vigentes de tu proceso.",
  },
  {
    id: "apoyo",
    label: "Apoyo",
    icon: LifeBuoy,
    whatItMeans: "Asegurar los recursos, competencias, comunicación e información documentada necesarios para que el SGC funcione.",
    howWeDoItAtAvenida: "Mantenemos instructivos actualizados, capacitamos en herramientas como Plane y documentamos procedimientos clave.",
    supportingDocuments: "Instructivos, procedimientos y registros de capacitación.",
    whoIsInvolved: "Todas las áreas, con Calidad como responsable de mantener la documentación al día.",
    whatICanDoFromThePortal:
      "Consultar el Centro de Conocimiento (Conceptos, Calidad en 2 minutos, Comparador, FAQ) — el control documental formal de instructivos y procedimientos lo lleva Calidad puertas adentro.",
  },
  {
    id: "operacion",
    label: "Operación",
    icon: Cog,
    whatItMeans: "Planificar y controlar los procesos que efectivamente producen el servicio, incluyendo el control de proveedores externos.",
    howWeDoItAtAvenida:
      "Ejecutamos procesos como Implementación e Integración con Clientes, Operación de la Plataforma SaaS y Gestión de Proveedores y Terceros con controles definidos.",
    supportingDocuments: "Fichas de proceso y procedimientos operativos.",
    whoIsInvolved: "Equipos operativos de cada proceso (Producto, IT, Operaciones, Comercial, Delivery).",
    whatICanDoFromThePortal: "Ver Procesos → mapa general y la ficha completa de cada proceso.",
  },
  {
    id: "evaluacion-del-desempeno",
    label: "Evaluación del desempeño",
    icon: Gauge,
    whatItMeans: "Medir, analizar y evaluar qué tan bien está funcionando el SGC, incluyendo la satisfacción del cliente y las auditorías internas.",
    howWeDoItAtAvenida: "Hacemos seguimiento de indicadores por proceso, auditorías internas periódicas y encuestas de satisfacción a bancos y sellers.",
    supportingDocuments: "Indicadores, informes de auditoría y resultados de satisfacción.",
    whoIsInvolved: "Calidad, con datos aportados por cada área.",
    whatICanDoFromThePortal:
      "Consultar Evaluación → Indicadores, Satisfacción y Seguimiento (vencimientos, reincidencias y cumplimiento por área) — el programa de auditorías lo gestiona Calidad puertas adentro.",
  },
  {
    id: "mejora",
    label: "Mejora",
    icon: TrendingUp,
    whatItMeans: "Actuar sobre no conformidades, resultados de auditorías y oportunidades para mejorar continuamente el SGC.",
    howWeDoItAtAvenida: "Gestionamos NC, Acciones Correctivas y Oportunidades de Mejora de forma centralizada, con verificación de eficacia.",
    supportingDocuments: "Registros de NC, AC y OM, con su historial de trazabilidad.",
    whoIsInvolved: "Cualquier colaborador puede iniciarlo; Calidad y los responsables de proceso lo gestionan.",
    whatICanDoFromThePortal: "Reportar una situación desde cualquier parte del portal, en cualquier momento.",
  },
];
