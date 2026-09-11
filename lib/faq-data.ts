/**
 * Preguntas frecuentes (Fase 2). Preguntas de negocio reales, no solo definiciones
 * (spec sección 60): qué pasa si reporto algo, quién ve mis reportes, etc.
 */
export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "quien-ve-mi-reporte",
    question: "Si reporto algo, ¿quién lo ve?",
    answer:
      "Lo ve el área de Calidad y, cuando corresponde, el responsable del área o proceso involucrado. Podés hacer seguimiento del estado desde \"Mi SGC\".",
  },
  {
    id: "me-puedo-equivocar-de-categoria",
    question: "¿Qué pasa si me equivoco al elegir la categoría del reporte?",
    answer:
      "No pasa nada: la clasificación final siempre la valida Calidad. Elegí la opción que más se parezca a tu situación y contá el detalle en la descripción.",
  },
  {
    id: "reporto-algo-de-otra-area",
    question: "¿Puedo reportar algo que pasó en un área que no es la mía?",
    answer: "Sí. Cualquier colaborador puede reportar una situación de cualquier área — la calidad es responsabilidad de todos, no solo de quien trabaja ahí.",
  },
  {
    id: "es-anonimo",
    question: "¿El reporte queda con mi nombre?",
    answer:
      "Sí, el reporte queda asociado a quien lo carga, para poder hacer seguimiento y pedir información adicional si hace falta. No es un canal anónimo.",
  },
  {
    id: "cuanto-tarda-respuesta",
    question: "¿Cuánto tarda en atenderse lo que reporté?",
    answer:
      "Depende de la prioridad y el tipo de situación. Podés ver el estado actualizado en \"Mi SGC\" en cualquier momento, sin necesidad de preguntar por otro canal.",
  },
  {
    id: "diferencia-plane-sgc",
    question: "¿Por qué a veces veo un ticket de Plane y otras veces un registro del SGC?",
    answer:
      "Plane gestiona la ejecución operativa del trabajo (como una tarea de IT). El SGC gestiona el cumplimiento de calidad de esa situación (por ejemplo, si hace falta una Acción Correctiva). Un ticket de Plane puede estar \"Listo\" en Plane y seguir abierto en el SGC hasta que se verifique su eficacia.",
  },
  {
    id: "no-se-si-es-riesgo-o-nc",
    question: "No sé si lo que detecté es un riesgo o ya es un problema. ¿Cómo lo distingo?",
    answer:
      "Preguntate: ¿esto ya pasó, o todavía podría pasar? Si ya ocurrió, es una No Conformidad. Si todavía no pasó pero podría, es un riesgo. Ante la duda, reportalo igual — Calidad ayuda a clasificarlo.",
  },
  {
    id: "tengo-que-saber-iso",
    question: "¿Necesito saber de ISO 9001 para usar el portal?",
    answer:
      "No. El portal está pensado para que cualquier persona pueda reportar, consultar y participar sin conocer la norma. El Centro de Conocimiento está para cuando quieras entender más.",
  },
  {
    id: "puedo-editar-mi-reporte",
    question: "¿Puedo editar un reporte después de enviarlo?",
    answer: "Podés sumar comentarios y evidencia adicional desde \"Mi SGC\". Los datos originales del reporte quedan en el historial para mantener la trazabilidad.",
  },
  {
    id: "sugerencia-no-implementada",
    question: "Mandé una sugerencia y no pasó nada. ¿Se perdió?",
    answer:
      "No se pierde: toda sugerencia se evalúa y queda con un estado (Recibida, En evaluación, Aceptada, Rechazada, Implementada). Podés ver en qué quedó desde \"Mis reportes\".",
  },
  {
    id: "riesgo-de-otro-proceso",
    question: "Detecté un riesgo que depende de otro equipo, no del mío. ¿Igual lo reporto?",
    answer: "Sí. El riesgo se asocia al proceso o área correspondiente, y el responsable de ese proceso es quien define el tratamiento — vos solo tenés que reportarlo.",
  },
  {
    id: "cambia-mi-trabajo-diario",
    question: "¿Usar el portal me agrega trabajo extra?",
    answer:
      "La idea es lo contrario: centralizar en un solo lugar lo que hoy quizás se resuelve por chat o mail, para que quede registrado, se pueda medir y no se repita el mismo problema una y otra vez.",
  },
  {
    id: "mi-sgc-no-aparece-nada",
    question: "¿Por qué en Mi SGC no aparece nada aunque ya reporté algo?",
    answer:
      "Mi SGC cruza tus reportes con el nombre de tu cuenta de Google. Si al reportar escribiste tu nombre de forma distinta (por ejemplo, un apodo o solo el nombre sin apellido), no te va a aparecer ahí — pero el reporte sigue existiendo igual, lo podés buscar por su código en Registro SGC.",
  },
  {
    id: "que-significa-vencido",
    question: "¿Qué significa que algo esté \"vencido\" en Mis vencimientos?",
    answer:
      "Que la fecha comprometida para esa tarea (por ejemplo, corregir una No Conformidad o verificar la eficacia de una Acción Correctiva) ya pasó y todavía no se completó. No borra nada ni te penaliza automáticamente — es un aviso para que le des seguimiento cuanto antes.",
  },
  {
    id: "no-puedo-cerrar-ac",
    question: "¿Por qué no puedo cerrar una Acción Correctiva aunque ya la implementé?",
    answer:
      "Implementarla no alcanza: antes de cerrarla hace falta una verificación de eficacia con resultado \"eficaz\", es decir, confirmar un tiempo después que realmente evitó que el problema se repita. El portal bloquea el cierre a propósito hasta que esa verificación esté cargada, para que una AC no quede \"cerrada en el papel\" sin haber funcionado en la práctica.",
  },
  {
    id: "plane-y-portal-lo-mismo",
    question: "¿Tengo que usar Plane y el portal para lo mismo?",
    answer:
      "No, cada uno cumple un rol distinto. Plane gestiona la ejecución operativa del trabajo (como una tarea técnica). El portal gestiona el cumplimiento de calidad de esa situación. Cuando corresponde, el portal crea automáticamente el ticket en Plane por vos — no hace falta cargarlo dos veces.",
  },
  {
    id: "ticket-plane-no-esta-en-mi-sgc",
    question: "Vi mi ticket en \"Tickets Plane\" pero no aparece en Mi SGC, ¿por qué?",
    answer:
      "Porque todavía no fue tipificado. Un ticket de Plane recién se convierte en un registro del SGC (con su propio código, seguimiento y trazabilidad) cuando alguien lo tipifica o lo vincula desde \"Gestión de Calidad → Tickets Plane\" — hasta ese momento, es solo un ticket, no un registro.",
  },
  {
    id: "reporto-lo-mismo-dos-veces",
    question: "¿Qué pasa si reporto lo mismo dos veces sin darme cuenta?",
    answer:
      "No hay problema. Calidad puede vincular los dos registros entre sí desde la pestaña \"Relaciones\", para que quede claro que son la misma situación y no se dupliquen los datos históricos. Ante la duda, es mejor reportar de más que dejar algo sin registrar.",
  },
];
