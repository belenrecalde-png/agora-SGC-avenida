/**
 * "Calidad en 2 minutos": cápsulas cortas, reutilizan la definición simple y el
 * ejemplo de un concepto ya redactado en concepts-data.ts (misma fuente de verdad,
 * sin duplicar contenido). El campo `question` es la forma de FAQ ilustrada que pide
 * la especificación (sección 36-47).
 */
export type TwoMinuteCapsule = {
  question: string;
  conceptId: string;
};

export const TWO_MINUTE_CAPSULES: TwoMinuteCapsule[] = [
  { question: "¿Qué es una No Conformidad?", conceptId: "no-conformidad" },
  { question: "¿Qué es una Acción Correctiva?", conceptId: "accion-correctiva" },
  { question: "¿Cuál es la diferencia entre corregir y hacer una Acción Correctiva?", conceptId: "correccion" },
  { question: "¿Qué es un riesgo?", conceptId: "riesgo" },
  { question: "¿Qué es una oportunidad?", conceptId: "oportunidad" },
  { question: "¿Para qué sirve la evidencia?", conceptId: "evidencia" },
  { question: "¿Qué es un proceso?", conceptId: "proceso" },
  { question: "¿Qué pasa en una auditoría?", conceptId: "auditoria" },
  { question: "¿Para qué sirve un indicador?", conceptId: "indicador" },
  { question: "¿Qué es una parte interesada?", conceptId: "parte-interesada" },
  { question: "¿Qué significa mejora continua?", conceptId: "mejora-continua" },
  { question: "¿Qué es el SGC, en el fondo?", conceptId: "sgc" },
  { question: "¿Por qué documentamos las cosas?", conceptId: "informacion-documentada" },
  { question: "¿Por qué se analiza la causa raíz de un problema?", conceptId: "causa-raiz" },
];
