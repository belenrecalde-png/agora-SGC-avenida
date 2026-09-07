/**
 * Conceptos del Centro de Conocimiento (Fase 2).
 *
 * Contenido redactado en lenguaje propio a partir del vocabulario general de gestión
 * de calidad (alineado a la terminología de ISO 9000, "Fundamentos y vocabulario"),
 * NO copiado ni citado textualmente de la norma. Ver nota en
 * claude/spec-sgc-avenida-plus.md: "No reproducir texto extenso de normas ISO
 * protegidas — usar explicaciones/resúmenes propios."
 *
 * Este es un primer borrador para que Calidad revise, corrija y ajuste los ejemplos
 * de Avenida+ antes de considerarlo contenido definitivo (ver Badge "Borrador —
 * a revisar por Calidad" en las páginas que lo consumen).
 */
import type { BadgeTone } from "@/components/ui/badge";

export type ConceptCategory =
  | "conceptos-de-calidad"
  | "riesgos-y-oportunidades"
  | "procesos"
  | "auditorias"
  | "mejora-continua"
  | "informacion-documentada"
  | "indicadores"
  | "clientes"
  | "proveedores"
  | "planificacion"
  | "liderazgo";

export const CONCEPT_CATEGORIES: Record<ConceptCategory, { label: string; tone: BadgeTone }> = {
  "conceptos-de-calidad": { label: "Conceptos de Calidad", tone: "violet" },
  "riesgos-y-oportunidades": { label: "Riesgos y oportunidades", tone: "amber" },
  procesos: { label: "Procesos", tone: "blue" },
  auditorias: { label: "Auditorías", tone: "green" },
  "mejora-continua": { label: "Mejora continua", tone: "violet" },
  "informacion-documentada": { label: "Información documentada", tone: "gray" },
  indicadores: { label: "Indicadores", tone: "blue" },
  clientes: { label: "Clientes", tone: "green" },
  proveedores: { label: "Proveedores", tone: "amber" },
  planificacion: { label: "Planificación", tone: "violet" },
  liderazgo: { label: "Liderazgo", tone: "gray" },
};

export type Concept = {
  id: string;
  term: string;
  acronym?: string;
  category: ConceptCategory;
  technicalDefinition: string;
  simpleDefinition: string;
  avenidaExample: string;
  whyItMatters: string;
  whatToDoIfDetected: string;
  relatedIds: string[];
};

export const CONCEPTS: Concept[] = [
  {
    id: "no-conformidad",
    term: "No Conformidad",
    acronym: "NC",
    category: "conceptos-de-calidad",
    technicalDefinition:
      "Incumplimiento de un requisito: algo que debía cumplirse (un procedimiento, un SLA, una norma, una instrucción) y no se cumplió.",
    simpleDefinition: "Algo que estaba definido y no pasó como tenía que pasar.",
    avenidaExample:
      "Un seller queda activo en el marketplace sin haber completado la validación de documentación bancaria que el procedimiento exige antes de habilitarlo.",
    whyItMatters:
      "Si no se identifica y corrige, la misma falla se repite y puede afectar a más clientes o procesos.",
    whatToDoIfDetected: "Reportala desde el portal: se registra la corrección inmediata y, si corresponde, se busca la causa raíz.",
    relatedIds: ["accion-correctiva", "correccion", "causa-raiz", "requisito"],
  },
  {
    id: "accion-correctiva",
    term: "Acción Correctiva",
    acronym: "AC",
    category: "mejora-continua",
    technicalDefinition:
      "Acción tomada para eliminar la causa raíz de una No Conformidad, de modo que no vuelva a ocurrir.",
    simpleDefinition:
      "No es \"arreglar el problema puntual\" (eso es la corrección): es resolver por qué pasó, para que no pase de nuevo.",
    avenidaExample:
      "Tras detectar varias NC por sellers activados sin documentación completa, se implementa un control automático que bloquea la activación hasta que el checklist esté 100% cargado.",
    whyItMatters: "Evita que el mismo tipo de falla se repita una y otra vez, en lugar de solo apagar incendios.",
    whatToDoIfDetected:
      "Se crea a partir de una NC ya registrada, con responsable, fecha objetivo y una verificación de eficacia posterior.",
    relatedIds: ["no-conformidad", "causa-raiz", "correccion", "verificacion-de-eficacia"],
  },
  {
    id: "accion-preventiva",
    term: "Acción Preventiva",
    acronym: "AP",
    category: "riesgos-y-oportunidades",
    technicalDefinition:
      "Acción tomada sobre una situación potencial, antes de que el problema llegue a ocurrir, generalmente a partir de un riesgo identificado.",
    simpleDefinition: "Actuar antes de que pase algo, no después.",
    avenidaExample:
      "Se detecta que un solo proveedor de conciliación bancaria concentra toda la operación crítica: se decide sumar un proveedor alternativo antes de que falle el único que existe hoy.",
    whyItMatters: "Es más barato y menos disruptivo prevenir que corregir después de que el problema ya afectó a alguien.",
    whatToDoIfDetected: "Si ves una situación que podría convertirse en un problema, reportala como riesgo u oportunidad de mejora.",
    relatedIds: ["riesgo", "oportunidad-de-mejora"],
  },
  {
    id: "correccion",
    term: "Corrección",
    category: "mejora-continua",
    technicalDefinition: "Acción inmediata para eliminar o mitigar una No Conformidad ya detectada, sin necesariamente atacar su causa.",
    simpleDefinition: "El parche rápido para frenar el problema ahora mismo.",
    avenidaExample:
      "Se detecta un pago duplicado a un seller: la corrección inmediata es reversar la transacción y avisar al área contable, aunque todavía no se sepa por qué pasó.",
    whyItMatters:
      "Contiene el impacto en el momento, pero por sí sola no evita que vuelva a suceder — para eso está la Acción Correctiva.",
    whatToDoIfDetected: "Aplicala apenas detectás el problema y registrala junto con la No Conformidad.",
    relatedIds: ["no-conformidad", "accion-correctiva"],
  },
  {
    id: "causa-raiz",
    term: "Causa raíz",
    category: "mejora-continua",
    technicalDefinition:
      "El origen real de una No Conformidad, identificado mediante un método de análisis (5 Por Qué, Ishikawa, u otro), más allá del síntoma visible.",
    simpleDefinition: "El motivo de fondo, no lo primero que se ve.",
    avenidaExample:
      "Un cliente reclama que su integración no sincroniza: el síntoma es \"falla la API\", pero la causa raíz puede ser que nunca se documentó el límite de rate limit al onboardear al cliente.",
    whyItMatters:
      "Si solo se corrige el síntoma, el problema reaparece con otra forma; atacar la causa evita la recurrencia.",
    whatToDoIfDetected: "Se analiza al gestionar una No Conformidad, antes de definir la Acción Correctiva.",
    relatedIds: ["no-conformidad", "accion-correctiva"],
  },
  {
    id: "eficacia",
    term: "Eficacia",
    category: "conceptos-de-calidad",
    technicalDefinition: "Grado en el que una acción planificada logra el resultado que se buscaba.",
    simpleDefinition: "¿Funcionó de verdad, o solo se hizo?",
    avenidaExample:
      "Se implementó un nuevo control de validación de sellers; la eficacia se confirma tres meses después si la tasa de NC por documentación incompleta bajó, no solo por haber puesto el control.",
    whyItMatters: "Sin medir eficacia, se puede confundir \"hicimos algo\" con \"el problema se resolvió\".",
    whatToDoIfDetected: "Se evalúa formalmente en la verificación de eficacia de cada Acción Correctiva.",
    relatedIds: ["verificacion-de-eficacia", "accion-correctiva"],
  },
  {
    id: "evidencia",
    term: "Evidencia",
    category: "informacion-documentada",
    technicalDefinition: "Registro, dato o documento que demuestra que algo ocurrió o que una actividad se realizó.",
    simpleDefinition: "La prueba de que algo pasó, no solo el relato de que pasó.",
    avenidaExample:
      "Una captura de pantalla del error de integración, el ticket de Plane asociado y el mail al cliente son la evidencia de una No Conformidad y su corrección.",
    whyItMatters:
      "Permite demostrar ante una auditoría (o ante uno mismo) que el SGC realmente funciona, no solo que existe en el papel.",
    whatToDoIfDetected: "Adjuntá capturas, archivos o links cada vez que reportes o gestiones un registro del SGC.",
    relatedIds: ["informacion-documentada", "auditoria"],
  },
  {
    id: "hallazgo",
    term: "Hallazgo",
    category: "auditorias",
    technicalDefinition: "Resultado de comparar lo observado durante una auditoría contra un criterio definido (procedimiento, norma, requisito).",
    simpleDefinition: "Lo que un auditor encuentra al revisar cómo trabajamos.",
    avenidaExample:
      "En una auditoría interna al proceso de onboarding de bancos, se encuentra que dos legajos no tienen la validación de compliance firmada.",
    whyItMatters: "Es la forma en que una auditoría se traduce en mejora concreta: cada hallazgo puede generar una NC, una OM o una observación.",
    whatToDoIfDetected: "Se registra durante la auditoría y se convierte en un registro del SGC para su seguimiento.",
    relatedIds: ["auditoria", "no-conformidad", "oportunidad-de-mejora"],
  },
  {
    id: "indicador",
    term: "Indicador",
    category: "indicadores",
    technicalDefinition: "Medida cuantitativa que permite hacer seguimiento del desempeño de un proceso u objetivo a lo largo del tiempo.",
    simpleDefinition: "Un número que te dice si algo va bien o mal, y si va mejorando.",
    avenidaExample:
      "\"% de tickets de soporte B2B resueltos dentro del SLA acordado\", medido mensualmente por el área de Soporte.",
    whyItMatters: "Sin indicadores, las decisiones se toman por percepción en lugar de por datos.",
    whatToDoIfDetected: "Los indicadores se definen por proceso u objetivo; no se \"reportan\" como un problema puntual.",
    relatedIds: ["objetivo-de-calidad", "desempeno", "medicion"],
  },
  {
    id: "informacion-documentada",
    term: "Información documentada",
    category: "informacion-documentada",
    technicalDefinition:
      "Toda información que una organización debe controlar y mantener, junto con el medio que la contiene (políticas, procedimientos, instructivos, formularios, registros).",
    simpleDefinition: "Todo lo que está escrito y controlado: desde una política hasta el formulario que completás para reportar algo.",
    avenidaExample: "El Manual de Calidad, el instructivo de \"Cómo tipificar un ticket de Plane\" y el registro de una auditoría son información documentada.",
    whyItMatters: "Permite que el conocimiento no dependa de una sola persona y que se pueda repetir y auditar el trabajo.",
    whatToDoIfDetected: "Se gestiona desde Documentación (Fase 12); si detectás un documento desactualizado, avisá a Calidad.",
    relatedIds: ["procedimiento", "evidencia"],
  },
  {
    id: "mejora-continua",
    term: "Mejora continua",
    category: "mejora-continua",
    technicalDefinition:
      "Actividad recurrente para aumentar la capacidad de cumplir requisitos, basada en analizar resultados y actuar sobre ellos.",
    simpleDefinition: "Nunca dar un proceso por \"terminado\": siempre buscar una versión mejor.",
    avenidaExample:
      "Cada trimestre, Calidad revisa las NC y OM más frecuentes por área para decidir en qué proceso conviene invertir esfuerzo de mejora.",
    whyItMatters: "Es el motor que evita que el SGC se vuelva un trámite estático en lugar de una forma real de trabajar.",
    whatToDoIfDetected: "Cualquier idea de mejora se puede reportar como Oportunidad de Mejora o Sugerencia.",
    relatedIds: ["oportunidad-de-mejora", "sugerencia"],
  },
  {
    id: "objetivo-de-calidad",
    term: "Objetivo de Calidad",
    category: "planificacion",
    technicalDefinition: "Meta medible que la organización se propone alcanzar en relación con la calidad, coherente con la política de calidad.",
    simpleDefinition: "Una meta concreta y medible, no una intención vaga.",
    avenidaExample: "\"Reducir a menos de 5 días el tiempo promedio de onboarding de un nuevo seller para fin de año.\"",
    whyItMatters: "Sin objetivos medibles, \"mejorar la calidad\" es una frase sin forma de saber si se logró.",
    whatToDoIfDetected: "Se definen en Planificación, con indicador, responsable y frecuencia de seguimiento asociados.",
    relatedIds: ["indicador", "objetivo", "meta"],
  },
  {
    id: "oportunidad",
    term: "Oportunidad",
    category: "riesgos-y-oportunidades",
    technicalDefinition: "Circunstancia favorable que, de aprovecharse, puede generar un resultado positivo para la organización.",
    simpleDefinition: "Lo contrario de un riesgo: algo bueno que podría pasar si se lo persigue.",
    avenidaExample: "La posibilidad de integrar un nuevo método de pago que varios sellers vienen pidiendo puede abrir una línea de ingresos nueva.",
    whyItMatters:
      "El SGC no es solo prevenir problemas: también sirve para identificar y capitalizar mejoras estratégicas de forma ordenada.",
    whatToDoIfDetected: "Registrala en Planificación → Riesgos y oportunidades.",
    relatedIds: ["riesgo", "oportunidad-de-mejora"],
  },
  {
    id: "oportunidad-de-mejora",
    term: "Oportunidad de Mejora",
    acronym: "OM",
    category: "mejora-continua",
    technicalDefinition:
      "Propuesta concreta para hacer un proceso más simple, rápido o eficiente, sin que exista necesariamente una No Conformidad detrás.",
    simpleDefinition: "Una idea concreta de \"esto se podría hacer mejor\", con una propuesta, no solo una queja.",
    avenidaExample:
      "Automatizar el envío del comprobante de conciliación a los bancos en vez de armarlo manualmente cada semana.",
    whyItMatters: "Convierte ideas sueltas del día a día en mejoras evaluadas y con seguimiento real.",
    whatToDoIfDetected: "Reportala desde \"Tengo una idea para mejorar algo\" en Reportar.",
    relatedIds: ["mejora-continua", "sugerencia"],
  },
  {
    id: "parte-interesada",
    term: "Parte interesada",
    category: "planificacion",
    technicalDefinition: "Persona u organización que puede afectar, verse afectada, o percibirse afectada por una decisión o actividad de la organización.",
    simpleDefinition: "Cualquiera con quien Avenida+ tenga que ver y a quien le importe cómo nos va.",
    avenidaExample: "Bancos, sellers, colaboradores, proveedores tecnológicos, organismos regulatorios y la propia Dirección son partes interesadas.",
    whyItMatters: "Entender sus necesidades y expectativas evita sorpresas y ayuda a priorizar bien.",
    whatToDoIfDetected: "Se gestionan en Planificación → Partes interesadas.",
    relatedIds: ["contexto-de-la-organizacion", "satisfaccion-del-cliente"],
  },
  {
    id: "politica-de-calidad",
    term: "Política de Calidad",
    category: "liderazgo",
    technicalDefinition: "Declaración formal de la Dirección sobre el compromiso y la orientación de la organización respecto a la calidad.",
    simpleDefinition: "El \"para qué\" de todo el SGC, dicho por la Dirección.",
    avenidaExample:
      "\"En Avenida+ nos comprometemos a que cada integración con bancos y sellers sea confiable, trazable y mejore de forma continua.\"",
    whyItMatters: "Le da sentido y dirección a todos los objetivos, procesos e indicadores del SGC.",
    whatToDoIfDetected: "Se consulta en Documentación; su definición y actualización es responsabilidad de la Dirección.",
    relatedIds: ["objetivo-de-calidad", "revision-por-la-direccion"],
  },
  {
    id: "procedimiento",
    term: "Procedimiento",
    category: "informacion-documentada",
    technicalDefinition: "Forma especificada de llevar a cabo una actividad o un proceso, generalmente documentada paso a paso.",
    simpleDefinition: "El \"cómo se hace\", por escrito, para que no dependa de la memoria de una sola persona.",
    avenidaExample: "El procedimiento de activación de un nuevo seller: qué documentación pedir, quién valida, en qué orden.",
    whyItMatters: "Asegura consistencia: que la tarea se haga igual sin importar quién la ejecute.",
    whatToDoIfDetected: "Si un procedimiento no está claro o no se cumple, reportalo como No Conformidad u Oportunidad de Mejora.",
    relatedIds: ["proceso", "informacion-documentada"],
  },
  {
    id: "proceso",
    term: "Proceso",
    category: "procesos",
    technicalDefinition: "Conjunto de actividades relacionadas que transforman entradas en salidas, usando recursos, para lograr un resultado.",
    simpleDefinition: "Una cadena de pasos que convierte algo (una solicitud, un dato) en un resultado (un servicio, un producto).",
    avenidaExample: "\"Implementación e Integración con Clientes\": entra un contrato firmado, salen una cuenta configurada y una integración funcionando.",
    whyItMatters: "Pensar en procesos (y no en tareas sueltas) permite ver dónde está el cuello de botella real.",
    whatToDoIfDetected: "Consultá el Mapa de procesos para entender cómo se organiza el trabajo en Avenida+.",
    relatedIds: ["procedimiento", "control-operacional"],
  },
  {
    id: "reclamo",
    term: "Reclamo",
    acronym: "R",
    category: "clientes",
    technicalDefinition: "Solicitud formal de resolución ante un incumplimiment de un requisito acordado con un cliente o parte interesada.",
    simpleDefinition: "Un pedido formal de que se resuelva algo que se prometió y no se cumplió.",
    avenidaExample: "Un banco reclama formalmente porque la conciliación diaria acordada por contrato llegó con tres días de atraso durante dos semanas seguidas.",
    whyItMatters: "Un reclamo no atendido a tiempo puede escalar y afectar la relación comercial, no solo la operación.",
    whatToDoIfDetected: "Reportalo desde \"Quiero realizar un reclamo\"; se le asigna fecha compromiso de respuesta.",
    relatedIds: ["queja", "sla", "no-conformidad"],
  },
  {
    id: "queja",
    term: "Queja",
    acronym: "Q",
    category: "clientes",
    technicalDefinition: "Manifestación de insatisfacción respecto de un producto, servicio o proceso, sin que necesariamente exista un incumplimiento contractual formal.",
    simpleDefinition: "Alguien no quedó conforme y lo dice, aunque no haya un contrato de por medio.",
    avenidaExample: "Un seller se queja porque el panel de liquidaciones es confuso y no encuentra dónde ver el detalle de una comisión.",
    whyItMatters: "Las quejas son una fuente temprana de mejora: suelen anticipar problemas antes de que se conviertan en reclamos formales.",
    whatToDoIfDetected: "Reportala desde \"Quiero realizar una queja\"; puede vincularse a una NC o AC si corresponde.",
    relatedIds: ["reclamo", "satisfaccion-del-cliente"],
  },
  {
    id: "requisito",
    term: "Requisito",
    category: "conceptos-de-calidad",
    technicalDefinition: "Necesidad o expectativa establecida, generalmente implícita u obligatoria, que debe cumplirse.",
    simpleDefinition: "Algo que tiene que cumplirse sí o sí: por contrato, por norma, o porque el cliente lo espera.",
    avenidaExample: "El requisito de encriptar los datos bancarios de un seller en tránsito y en reposo.",
    whyItMatters: "Toda No Conformidad parte de un requisito incumplido; sin requisitos claros no se puede evaluar si algo \"está mal\".",
    whatToDoIfDetected: "Si un requisito no está claro o no se está cumpliendo, consultá con tu líder de proceso o reportalo.",
    relatedIds: ["no-conformidad"],
  },
  {
    id: "riesgo",
    term: "Riesgo",
    category: "riesgos-y-oportunidades",
    technicalDefinition: "Efecto de la incertidumbre sobre un resultado esperado: una situación que, de ocurrir, afectaría negativamente a la organización.",
    simpleDefinition: "Algo malo que todavía no pasó, pero que podría pasar.",
    avenidaExample: "Depender de un único proveedor de infraestructura cloud para toda la plataforma SaaS.",
    whyItMatters: "Identificar riesgos a tiempo permite actuar antes de que se conviertan en una No Conformidad real.",
    whatToDoIfDetected: "Reportalo desde \"Detecté algo que podría generar un problema\" o directamente en Riesgos y oportunidades.",
    relatedIds: ["oportunidad", "accion-preventiva", "contexto-de-la-organizacion"],
  },
  {
    id: "sgc",
    term: "SGC (Sistema de Gestión de Calidad)",
    acronym: "SGC",
    category: "conceptos-de-calidad",
    technicalDefinition:
      "Conjunto de procesos, políticas, roles y registros que una organización usa para dirigir y controlar sus actividades relacionadas con la calidad.",
    simpleDefinition: "La forma organizada en que Avenida+ trabaja, registra, controla y mejora lo que hace — no un área aparte.",
    avenidaExample: "Ágora es la herramienta que centraliza el SGC: desde reportar algo hasta ver riesgos, procesos y objetivos.",
    whyItMatters: "Un SGC bien usado evita reinventar la rueda cada vez que algo sale mal y deja trazabilidad de las decisiones.",
    whatToDoIfDetected: "Participar del SGC no es tarea exclusiva de Calidad: cualquier colaborador puede y debe hacerlo.",
    relatedIds: ["mejora-continua", "trazabilidad"],
  },
  {
    id: "sla",
    term: "SLA (Acuerdo de Nivel de Servicio)",
    acronym: "SLA",
    category: "clientes",
    technicalDefinition: "Compromiso formal sobre el nivel de servicio esperado, generalmente medido en tiempos de respuesta o resolución.",
    simpleDefinition: "El tiempo o nivel de servicio que prometiste cumplir, por escrito.",
    avenidaExample: "\"Los tickets de soporte B2B de prioridad alta se responden dentro de las 4 horas hábiles.\"",
    whyItMatters: "Incumplir un SLA de forma sistemática es una fuente frecuente de No Conformidades y reclamos.",
    whatToDoIfDetected: "Si un SLA se incumple, reportalo para que quede registrado y se pueda analizar el patrón.",
    relatedIds: ["reclamo", "indicador"],
  },
  {
    id: "sugerencia",
    term: "Sugerencia",
    acronym: "S",
    category: "mejora-continua",
    technicalDefinition: "Propuesta o recomendación de cualquier colaborador, evaluada por el área correspondiente para su posible implementación.",
    simpleDefinition: "Una idea que compartís, sin necesidad de tener el análisis completo hecho.",
    avenidaExample: "\"¿Y si agregamos un buscador dentro del panel de liquidaciones de sellers?\"",
    whyItMatters: "Las mejores mejoras muchas veces vienen de quien usa el proceso todos los días, no solo de Calidad.",
    whatToDoIfDetected: "Reportala desde \"Quiero realizar una sugerencia\"; se hace seguimiento hasta que se evalúa.",
    relatedIds: ["oportunidad-de-mejora"],
  },
  {
    id: "trazabilidad",
    term: "Trazabilidad",
    category: "conceptos-de-calidad",
    technicalDefinition: "Capacidad de reconstruir la historia, aplicación o ubicación de algo mediante registros identificados.",
    simpleDefinition: "Poder reconstruir qué pasó, quién lo hizo y cuándo, mirando el historial.",
    avenidaExample: "Poder ver, para una NC, quién la reportó, cuándo se corrigió, quién definió la Acción Correctiva y cuándo se verificó su eficacia.",
    whyItMatters: "Sin trazabilidad no se puede auditar el SGC ni aprender de forma confiable de lo que pasó.",
    whatToDoIfDetected: "Se genera automáticamente: cada cambio importante en un registro queda en su historial (timeline).",
    relatedIds: ["evidencia", "sgc"],
  },
  {
    id: "verificacion",
    term: "Verificación",
    category: "auditorias",
    technicalDefinition: "Confirmación, mediante evidencia objetiva, de que se cumplieron los requisitos especificados.",
    simpleDefinition: "Chequear con pruebas concretas que algo realmente se cumplió, no solo confiar en que se hizo.",
    avenidaExample: "Verificar, con capturas del sistema, que el nuevo control de validación de sellers efectivamente se está aplicando en cada alta.",
    whyItMatters: "Da certeza objetiva en lugar de depender de la palabra de alguien.",
    whatToDoIfDetected: "Se aplica en auditorías y en el cierre de acciones correctivas.",
    relatedIds: ["verificacion-de-eficacia", "evidencia", "auditoria"],
  },
  {
    id: "verificacion-de-eficacia",
    term: "Verificación de eficacia",
    category: "mejora-continua",
    technicalDefinition:
      "Confirmación, en un momento posterior a su implementación, de que una Acción Correctiva efectivamente eliminó la causa raíz y evitó la recurrencia.",
    simpleDefinition: "Volver a mirar, un tiempo después, si la solución realmente funcionó.",
    avenidaExample: "Tres meses después de implementar el nuevo control de validación, se revisa si bajaron las NC de sellers con documentación incompleta.",
    whyItMatters: "Sin esta verificación, una Acción Correctiva podría cerrarse \"en el papel\" sin haber resuelto nada en la práctica.",
    whatToDoIfDetected: "Se programa al crear la Acción Correctiva, con fecha y responsable definidos.",
    relatedIds: ["accion-correctiva", "eficacia"],
  },
  {
    id: "contexto-de-la-organizacion",
    term: "Contexto de la organización",
    category: "planificacion",
    technicalDefinition: "Combinación de cuestiones internas y externas que pueden afectar la capacidad de la organización de lograr los resultados esperados de su SGC.",
    simpleDefinition: "Todo lo que pasa adentro y afuera de Avenida+ que puede influir en cómo trabajamos.",
    avenidaExample: "Un cambio regulatorio en medios de pago (externo) o una reestructuración del equipo de Producto (interno) forman parte del contexto.",
    whyItMatters: "Planificar sin mirar el contexto lleva a objetivos y riesgos desconectados de la realidad del negocio.",
    whatToDoIfDetected: "Se documenta y revisa en Planificación → Contexto, incluyendo un análisis FODA/CAME.",
    relatedIds: ["parte-interesada", "riesgo", "cambio"],
  },
  {
    id: "competencia",
    term: "Competencia",
    category: "liderazgo",
    technicalDefinition: "Capacidad de aplicar conocimientos y habilidades para lograr los resultados previstos en un rol.",
    simpleDefinition: "Saber hacer lo que tu rol necesita, no solo tener el cargo.",
    avenidaExample: "Que quien tipifica tickets de Plane sepa distinguir con criterio entre una NC y una Oportunidad de Mejora.",
    whyItMatters: "Un SGC bien diseñado falla igual si las personas que lo ejecutan no tienen la competencia necesaria.",
    whatToDoIfDetected: "Se aborda con capacitación e instructivos; consultá el Centro de Conocimiento para reforzarla.",
    relatedIds: ["toma-de-conciencia"],
  },
  {
    id: "toma-de-conciencia",
    term: "Toma de conciencia",
    category: "liderazgo",
    technicalDefinition: "Grado en el que las personas entienden la política de calidad, los objetivos relevantes y cómo su trabajo contribuye a ellos.",
    simpleDefinition: "Entender por qué lo que hacés todos los días importa para la calidad general.",
    avenidaExample: "Que un desarrollador entienda que un bug mal priorizado puede convertirse en una No Conformidad para un cliente bancario.",
    whyItMatters: "Sin esto, el SGC se percibe como \"cosa de Calidad\" en vez de una responsabilidad de todos.",
    whatToDoIfDetected: "Se refuerza con contenido como \"Calidad en 2 minutos\" y ejemplos concretos del día a día.",
    relatedIds: ["sgc", "competencia"],
  },
  {
    id: "satisfaccion-del-cliente",
    term: "Satisfacción del cliente",
    category: "clientes",
    technicalDefinition: "Percepción del cliente sobre el grado en que se cumplieron sus expectativas.",
    simpleDefinition: "Qué tan conforme está el cliente con lo que le dimos, según su propia percepción.",
    avenidaExample: "Una encuesta trimestral a bancos y sellers integrados sobre la calidad del soporte y la estabilidad de la plataforma.",
    whyItMatters: "Es uno de los mejores termómetros de si el SGC está funcionando de verdad, más allá de los procesos internos.",
    whatToDoIfDetected: "Se hace seguimiento en Evaluación → Satisfacción, vinculado a quejas y reclamos.",
    relatedIds: ["queja", "reclamo"],
  },
  {
    id: "proveedor-externo",
    term: "Proveedor externo",
    category: "proveedores",
    technicalDefinition: "Organización externa que provee un producto o servicio que la organización utiliza o incorpora en lo que ofrece.",
    simpleDefinition: "Alguien de afuera de quien dependemos para poder operar.",
    avenidaExample: "El proveedor de infraestructura cloud, el proveedor de firma digital de contratos, o el partner de conciliación bancaria.",
    whyItMatters: "Un problema de un proveedor externo se convierte rápido en un problema propio si no se gestiona el riesgo asociado.",
    whatToDoIfDetected: "Se gestionan en Configuración → Proveedores, con criticidad, SLA y evaluación asociada.",
    relatedIds: ["riesgo", "sla"],
  },
  {
    id: "desempeno",
    term: "Desempeño",
    category: "indicadores",
    technicalDefinition: "Resultado medible de una actividad, proceso, producto o sistema, comparado contra lo esperado.",
    simpleDefinition: "Qué tan bien está funcionando algo, en números.",
    avenidaExample: "El desempeño del proceso de onboarding de sellers medido en tiempo promedio y tasa de errores.",
    whyItMatters: "Permite comparar objetivamente contra el pasado o contra la meta, no solo \"sentir\" que algo mejoró.",
    whatToDoIfDetected: "Se revisa a través de los indicadores definidos por proceso.",
    relatedIds: ["indicador", "medicion"],
  },
  {
    id: "seguimiento",
    term: "Seguimiento",
    category: "indicadores",
    technicalDefinition: "Determinación del estado de un sistema, proceso o actividad, de forma repetida a lo largo del tiempo.",
    simpleDefinition: "Mirar cómo evoluciona algo, no solo una vez, sino de forma continua.",
    avenidaExample: "El seguimiento mensual de cuántas NC quedaron abiertas más allá de su fecha compromiso.",
    whyItMatters: "Sin seguimiento, un problema resuelto \"una vez\" puede reaparecer sin que nadie lo note a tiempo.",
    whatToDoIfDetected: "Se centraliza en Evaluación → Seguimiento, con foco en vencimientos y reincidencias.",
    relatedIds: ["indicador", "desempeno"],
  },
  {
    id: "medicion",
    term: "Medición",
    category: "indicadores",
    technicalDefinition: "Proceso para determinar un valor, generalmente a través de un instrumento o método definido.",
    simpleDefinition: "La forma concreta de obtener el número de un indicador.",
    avenidaExample: "Medir el tiempo de respuesta de soporte tomando la diferencia entre la apertura y la primera respuesta de cada ticket.",
    whyItMatters: "Un indicador mal medido lleva a decisiones basadas en datos poco confiables.",
    whatToDoIfDetected: "Se define junto con cada indicador: fuente, fórmula y frecuencia.",
    relatedIds: ["indicador", "desempeno"],
  },
  {
    id: "auditoria",
    term: "Auditoría",
    category: "auditorias",
    technicalDefinition: "Proceso sistemático e independiente para obtener evidencia y evaluar objetivamente en qué medida se cumplen los criterios definidos.",
    simpleDefinition: "Una revisión ordenada y objetiva de cómo se está trabajando realmente.",
    avenidaExample: "Una auditoría al proceso de Gestión de Proveedores y Terceros para revisar si se está cumpliendo el procedimiento de evaluación anual.",
    whyItMatters: "Es la forma más estructurada de confirmar (o desmentir) que el SGC funciona como se describe.",
    whatToDoIfDetected: "El calendario y los hallazgos de auditorías se gestionan en Evaluación → Auditorías.",
    relatedIds: ["auditoria-interna", "hallazgo", "verificacion"],
  },
  {
    id: "auditoria-interna",
    term: "Auditoría interna",
    category: "auditorias",
    technicalDefinition: "Auditoría realizada por la propia organización (o en su nombre) para evaluar su SGC, generalmente en preparación de una certificación o revisión.",
    simpleDefinition: "Cuando Avenida+ se audita a sí misma, antes de que lo haga alguien de afuera.",
    avenidaExample: "El equipo de Calidad audita el proceso de Soporte y Atención al Cliente B2B una vez al año.",
    whyItMatters: "Detecta problemas antes de que los encuentre un cliente, un banco regulado o un auditor externo.",
    whatToDoIfDetected: "Se programa desde Evaluación → Auditorías, con alcance y criterios definidos de antemano.",
    relatedIds: ["auditoria", "revision-por-la-direccion"],
  },
  {
    id: "revision-por-la-direccion",
    term: "Revisión por la dirección",
    category: "liderazgo",
    technicalDefinition: "Evaluación periódica que hace la Dirección sobre el desempeño y la adecuación del SGC, para decidir ajustes u oportunidades de mejora.",
    simpleDefinition: "El momento en que la Dirección mira los resultados del SGC completo y decide qué cambiar.",
    avenidaExample:
      "Una vez al año, Dirección revisa indicadores, auditorías, riesgos y objetivos de todo el SGC para decidir prioridades del próximo período.",
    whyItMatters: "Sin esta revisión, el SGC puede quedar desconectado de las decisiones estratégicas del negocio.",
    whatToDoIfDetected: "Es responsabilidad de la Dirección, con insumos que aporta el Dashboard Ejecutivo (Fase 14).",
    relatedIds: ["politica-de-calidad", "objetivo-de-calidad"],
  },
  {
    id: "control-operacional",
    term: "Control operacional",
    category: "procesos",
    technicalDefinition: "Medidas y condiciones que se establecen para asegurar que un proceso se ejecute según lo planificado.",
    simpleDefinition: "Las barreras o chequeos que evitan que un proceso se salga de control.",
    avenidaExample: "Un control automático que impide activar a un seller en el marketplace si falta algún documento obligatorio.",
    whyItMatters: "Reduce la dependencia de que una persona \"se acuerde\" de hacer algo bien cada vez.",
    whatToDoIfDetected: "Se define y documenta como parte de la ficha de cada proceso.",
    relatedIds: ["proceso", "riesgo"],
  },
  {
    id: "cambio",
    term: "Cambio",
    category: "planificacion",
    technicalDefinition: "Modificación planificada o no planificada en el contexto, los procesos o el SGC que puede requerir evaluación de su impacto.",
    simpleDefinition: "Algo que se modifica y que puede afectar cómo trabajamos.",
    avenidaExample: "La incorporación de un nuevo método de pago o un cambio regulatorio sobre datos bancarios.",
    whyItMatters: "Un cambio no evaluado puede introducir riesgos nuevos sin que nadie los haya considerado.",
    whatToDoIfDetected: "Se evalúa como parte del Contexto de la organización y, si aplica, genera nuevos riesgos u objetivos.",
    relatedIds: ["contexto-de-la-organizacion", "riesgo"],
  },
  {
    id: "objetivo",
    term: "Objetivo",
    category: "planificacion",
    technicalDefinition: "Resultado a lograr, que puede ser estratégico, táctico u operativo, y no necesariamente medido en términos de calidad.",
    simpleDefinition: "Un resultado que se busca lograr, en general.",
    avenidaExample: "\"Expandir la integración con dos bancos nuevos este año\" es un objetivo de negocio; cuando se mide y vincula a calidad, se vuelve un Objetivo de Calidad.",
    whyItMatters: "Da dirección al trabajo de un área o de la organización completa.",
    whatToDoIfDetected: "Se distingue de la Meta (el valor puntual a alcanzar) y del Objetivo de Calidad (su versión medible dentro del SGC).",
    relatedIds: ["objetivo-de-calidad", "meta"],
  },
  {
    id: "meta",
    term: "Meta",
    category: "planificacion",
    technicalDefinition: "Valor específico que se busca alcanzar para un objetivo, generalmente con un plazo definido.",
    simpleDefinition: "El número o valor puntual que hay que llegar a cumplir.",
    avenidaExample: "Para el objetivo \"reducir el tiempo de onboarding\", la meta puede ser \"5 días o menos para el 31 de diciembre\".",
    whyItMatters: "Sin una meta concreta, un objetivo queda abierto a interpretación sobre cuándo se considera cumplido.",
    whatToDoIfDetected: "Se define junto con cada Objetivo de Calidad y su indicador asociado.",
    relatedIds: ["objetivo", "objetivo-de-calidad"],
  },
];

export function getConceptById(id: string): Concept | undefined {
  return CONCEPTS.find((concept) => concept.id === id);
}

export function getRelatedConcepts(concept: Concept): Concept[] {
  return concept.relatedIds
    .map((id) => getConceptById(id))
    .filter((item): item is Concept => Boolean(item));
}
