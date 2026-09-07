/**
 * Comparador de conceptos (Fase 2). Pares que suelen confundirse, con la diferencia
 * clave explicada en lenguaje simple más un ejemplo de Avenida+.
 */
export type ConceptComparison = {
  id: string;
  termA: string;
  termB: string;
  keyDifference: string;
  avenidaExample: string;
  whenToUseA: string;
  whenToUseB: string;
};

export const CONCEPT_COMPARISONS: ConceptComparison[] = [
  {
    id: "nc-vs-om",
    termA: "No Conformidad",
    termB: "Oportunidad de Mejora",
    keyDifference:
      "La NC parte de un requisito que se incumplió; la OM parte de una propuesta para mejorar algo que, en principio, ya funciona.",
    avenidaExample:
      "Un seller activado sin documentación completa es una NC. Proponer un checklist más simple para activar sellers, aunque el actual funcione, es una OM.",
    whenToUseA: "Cuando algo definido no se cumplió.",
    whenToUseB: "Cuando tenés una idea concreta para hacer algo mejor.",
  },
  {
    id: "queja-vs-reclamo",
    termA: "Queja",
    termB: "Reclamo",
    keyDifference:
      "La queja es una insatisfacción manifestada, sin exigencia formal de resolución; el reclamo es una solicitud formal de que se resuelva un incumplimiento.",
    avenidaExample:
      "Un seller que dice \"el panel es confuso\" hace una queja. Un banco que exige por escrito que se cumpla el SLA de conciliación pactado hace un reclamo.",
    whenToUseA: "Cuando alguien expresa disconformidad, sin pedir una resolución formal.",
    whenToUseB: "Cuando hay un incumplimiento concreto de algo acordado y se pide una respuesta.",
  },
  {
    id: "correccion-vs-accion-correctiva",
    termA: "Corrección",
    termB: "Acción Correctiva",
    keyDifference: "La corrección resuelve el problema puntual, ya; la Acción Correctiva ataca la causa para que no vuelva a pasar.",
    avenidaExample: "Reversar un pago duplicado es la corrección. Cambiar el proceso para que no se puedan generar pagos duplicados es la Acción Correctiva.",
    whenToUseA: "Apenas detectás el problema, para frenar el impacto inmediato.",
    whenToUseB: "Después de analizar la causa raíz, para evitar que se repita.",
  },
  {
    id: "riesgo-vs-problema",
    termA: "Riesgo",
    termB: "Problema (No Conformidad)",
    keyDifference: "El riesgo todavía no ocurrió: es una posibilidad. El problema (NC) ya ocurrió.",
    avenidaExample:
      "Depender de un único proveedor cloud es un riesgo. Que ese proveedor haya tenido una caída que afectó el servicio es ya una No Conformidad.",
    whenToUseA: "Cuando identificás algo que podría pasar.",
    whenToUseB: "Cuando algo que debía cumplirse ya no se cumplió.",
  },
  {
    id: "riesgo-vs-nc",
    termA: "Riesgo",
    termB: "No Conformidad",
    keyDifference: "Se diferencian por el tiempo: el riesgo es preventivo (antes), la NC es reactiva (después de que algo salió mal).",
    avenidaExample: "\"El proceso manual de conciliación podría fallar bajo alto volumen\" es un riesgo. Que haya fallado la semana pasada es una NC.",
    whenToUseA: "Para anticiparte y actuar antes de que el problema ocurra.",
    whenToUseB: "Para registrar y corregir algo que ya sucedió.",
  },
  {
    id: "ap-vs-riesgo",
    termA: "Acción Preventiva",
    termB: "Riesgo",
    keyDifference: "El riesgo es la situación identificada; la Acción Preventiva es lo que se hace para reducirlo o evitarlo.",
    avenidaExample: "El riesgo es \"un solo proveedor de conciliación\"; la Acción Preventiva es \"contratar un segundo proveedor como respaldo\".",
    whenToUseA: "Cuando ya decidiste qué acción concreta tomar frente a un riesgo.",
    whenToUseB: "Cuando todavía estás identificando y valorando la situación.",
  },
  {
    id: "documento-vs-registro",
    termA: "Documento",
    termB: "Registro",
    keyDifference: "El documento describe cómo se debe hacer algo (una política, un procedimiento); el registro es la evidencia de que se hizo.",
    avenidaExample: "El procedimiento de onboarding de sellers es un documento. El checklist completado para un seller específico es un registro.",
    whenToUseA: "Cuando necesitás saber cómo se supone que se hace algo.",
    whenToUseB: "Cuando necesitás demostrar que algo efectivamente se hizo.",
  },
  {
    id: "indicador-vs-objetivo",
    termA: "Indicador",
    termB: "Objetivo",
    keyDifference: "El indicador mide algo de forma continua; el objetivo es la meta que ese indicador debería alcanzar.",
    avenidaExample: "\"% de tickets resueltos en SLA\" es el indicador. \"Llegar al 95% este trimestre\" es el objetivo (con su meta: 95%).",
    whenToUseA: "Para hacer seguimiento continuo del desempeño de algo.",
    whenToUseB: "Para fijar una meta concreta que ese desempeño debería alcanzar.",
  },
  {
    id: "proceso-vs-procedimiento",
    termA: "Proceso",
    termB: "Procedimiento",
    keyDifference: "El proceso es el conjunto de actividades que transforma entradas en salidas; el procedimiento es la descripción escrita de cómo ejecutarlo.",
    avenidaExample: "\"Implementación e Integración con Clientes\" es el proceso; el instructivo paso a paso para configurar una nueva integración es el procedimiento.",
    whenToUseA: "Cuando pensás en el flujo completo de trabajo, de punta a punta.",
    whenToUseB: "Cuando necesitás el detalle operativo de cómo ejecutar un paso.",
  },
  {
    id: "auditoria-vs-control",
    termA: "Auditoría",
    termB: "Control operacional",
    keyDifference:
      "El control operacional es una medida permanente para que un proceso funcione bien; la auditoría es una revisión puntual que verifica si esos controles realmente se cumplen.",
    avenidaExample:
      "El control es \"no se puede activar un seller sin checklist completo\". La auditoría es revisar, una vez al año, si ese control se está aplicando de verdad.",
    whenToUseA: "Para verificar de forma independiente si algo se cumple.",
    whenToUseB: "Para prevenir de forma continua que un proceso se salga de control.",
  },
  {
    id: "hallazgo-vs-nc",
    termA: "Hallazgo",
    termB: "No Conformidad",
    keyDifference: "Todo hallazgo de auditoría puede convertirse en una NC, una OM o una observación — no todos los hallazgos son necesariamente una NC.",
    avenidaExample: "Un hallazgo de auditoría (\"faltan dos legajos firmados\") se convierte en una NC formal cuando se registra en el SGC para su gestión.",
    whenToUseA: "Al describir lo que se observó durante una auditoría puntual.",
    whenToUseB: "Al registrar formalmente el incumplimiento para darle seguimiento y cierre.",
  },
  {
    id: "accion-vs-evidencia",
    termA: "Acción",
    termB: "Evidencia",
    keyDifference: "La acción es lo que se hace para resolver o mejorar algo; la evidencia es la prueba de que esa acción realmente se ejecutó.",
    avenidaExample: "La acción es \"capacitar al equipo de soporte en el nuevo procedimiento\"; la evidencia es la lista de asistencia y el material usado.",
    whenToUseA: "Al definir qué se va a hacer y quién es responsable.",
    whenToUseB: "Al querer demostrar, después, que efectivamente se hizo.",
  },
];
