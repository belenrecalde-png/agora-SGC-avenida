# Ágora — Especificación funcional del Portal de Gestión de Calidad de Avenida+

> Documento maestro de requerimientos. Guarda la visión completa, el diseño de producto, el modelo de datos conceptual y el plan de fases para el desarrollo de la app web interna, cuyo nombre definitivo es **Ágora** (elegido el 2026-09-05; ver `claude/progreso-implementacion.md` para el historial de nombres evaluados y la decisión de estética visual v2). Este documento usa "SGC" para referirse al Sistema de Gestión de Calidad ISO 9001 en sí (el objeto que la app gestiona), y "Ágora" para referirse a la aplicación. Se conserva en el proyecto para que cualquier sesión futura de Claude (o cualquier persona del equipo) retome el trabajo con el contexto completo, sin depender de que esta conversación siga abierta.

## 0. Objetivo

Centralizar en una única herramienta interna todo el Sistema de Gestión de Calidad (SGC) de Avenida+ (ISO 9001), conectando Plane, Google Apps Script, Google Sheets y todos los procesos de calidad (No Conformidades, Acciones Correctivas/Preventivas, Oportunidades de Mejora, Quejas, Sugerencias, Reclamos, Riesgos y oportunidades, Contexto, Partes interesadas, Procesos, Objetivos, Indicadores, Auditorías, Proveedores, Documentación, Instructivos, Glosario/Centro de Conocimiento, Evidencias, Historial y trazabilidad).

Debe servir tanto al área de Calidad como a toda la empresa. No debe ser una herramienta técnica exclusiva para expertos en ISO 9001: cualquier colaborador debe poder entender un concepto, saber qué hacer, consultar instructivos/documentos, reportar, ver sus reportes/acciones, entender el SGC, identificar riesgos/oportunidades y participar de la mejora continua.

**Principio de diseño:** ENTENDER → APRENDER → HACER. Cada concepto importante conecta: Concepto → Explicación → Ejemplo → Instructivo → Acción.

**Criterio final antes de construir cualquier funcionalidad:** ¿Ayuda a entender? ¿Ayuda a hacer? ¿Ayuda a demostrar? Si no cumple ninguna, cuestionar si es necesaria. El portal combina CONOCIMIENTO + GESTIÓN + TRAZABILIDAD + MEJORA CONTINUA — no debe convertirse en "otra herramienta administrativa".

## 1. Diseño general

- Estética alineada a Avenida+. Paleta: Negro Avenida `#0A0A0A`, Violeta Avenida `#663EDD`, Blanco `#FFFFFF`, Gris `#DAD6F2`, Azul `#3E63DD`.
- Tipografía: Inter.
- Estilo: SaaS moderno, profesional, limpio, accesible, visual, simple. Sidebar lateral, cards, tablas con filtros, badges, gráficos, modales, drawers, breadcrumbs, responsive.
- Evitar aspecto burocrático; debe transmitir una experiencia moderna de portal interno.

## 2. Home del portal

Título "Ágora", subtítulo "Gestión · Conocimiento · Mejora" (o "Portal de Gestión de Calidad de Avenida+"), texto de bienvenida orientado a "conocer, consultar y participar" del SGC.

Buscador superior ("¿Qué necesitás saber?") que encuentra: conceptos, instructivos, documentos, procesos, riesgos, objetivos, indicadores, registros, tickets, FAQs.

Accesos rápidos: Reportar una situación, ¿Qué tengo que cargar?, Mis reportes, Conceptos de Calidad, Riesgos y oportunidades, Nuestros procesos, Instructivos, Documentación SGC, Calidad en 2 minutos, Preguntas frecuentes.

## 3. Menú principal (sidebar)

- **Inicio**
- **Mi SGC**
- **Reportar**
- **Gestión de Calidad**: Registro SGC · Tickets Plane · No Conformidades · Acciones Correctivas · Acciones Preventivas · Oportunidades de Mejora · Quejas · Sugerencias · Reclamos
- **Planificación**: Riesgos y oportunidades · Contexto · Partes interesadas · Objetivos de Calidad
- **Procesos**: Mapa de procesos · Fichas de procesos
- **Evaluación**: Indicadores · Auditorías · Satisfacción · Seguimiento
- **Documentación**: Documentos del SGC · Instructivos · Registros · Documentos externos
- **Centro de Conocimiento**: Conceptos · ISO 9001 · Calidad en 2 minutos · Comparador de conceptos · Preguntas frecuentes
- **Configuración**: Áreas · Procesos · Tipos · Estados · Usuarios · Roles · Plane · Apps Script · Integraciones · Logs

## 4. Tipos de registro (configurables, no hardcodeados)

Iniciales: AC (Acción Correctiva), AP (Acción Preventiva), NC (No Conformidad), OM (Oportunidad de Mejora), Q (Queja), S (Sugerencia), R (Reclamo). Deben poder administrarse desde Configuración.

Tabla `sgc_record_types`: id, code, name, description, active, color, icon, requires_root_cause, requires_effectiveness_check, sort_order.

## 5–8. Reportar una situación

Flujo pensado para gente que no conoce ISO. Primero se pregunta "¿Qué querés reportar?" con opciones visuales y ejemplos en lenguaje simple (no siglas):

1. "Algo no salió como debía" → orientativo NC
2. "Tengo una idea para mejorar algo" → orientativo OM o S
3. "Detecté algo que podría generar un problema" → orientativo Riesgo / AP / OM
4. "Quiero realizar un reclamo" → R
5. "Quiero realizar una queja" → Q
6. "Quiero realizar una sugerencia" → S
7. "Otro" → descripción libre, clasificación final la hace Calidad

**Formulario de reporte** — pedir: título, ¿qué ocurrió?, área relacionada, proceso relacionado (si lo conoce), fecha del hecho, persona que reporta, impacto observado, prioridad percibida, ¿necesita atención urgente?, evidencia/archivo/captura, comentarios. **No pedir** causa raíz, cláusula ISO, acción correctiva ni clasificación técnica obligatoria.

**Al enviar un reporte:** crear registro interno → generar ID único → registrar evento → enviar al backend → integrar con Apps Script → crear ticket en Plane → guardar relación entre sistemas → confirmar al usuario (ej. "Código SGC: REP-2026-0142 · Ticket Plane: CAL-142 · Estado: Recibido" + botón "Ver seguimiento").

**Códigos del SGC**: automáticos, por tipo, correlativos, reiniciables por año cuando corresponda, NUNCA basados en número de fila de Google Sheets. Ej.: NC-2026-001, AC-2026-001, AP-2026-001, OM-2026-001, Q-2026-001, S-2026-001, R-2026-001, RISK-2026-001, AUD-2026-001, OBJ-2026-001.

## 9–22. Integración con Plane

Instancia **self-hosted Community Edition** (no Plane Cloud, no `api.plane.so`). Ver documento separado `claude/integracion-plane-appsscript.md` (basado en la implementación real ya existente en Apps Script) para el detalle técnico completo: variables de entorno, endpoints, payloads, manejo de errores, estados, caché, diagnóstico.

Puntos clave para el portal:

- Variables seguras (nunca en frontend): `PLANE_BASE_URL`, `PLANE_WORKSPACE_SLUG`, `PLANE_API_KEY`. Header `X-API-Key`. Base: `{PLANE_BASE_URL}/api/v1/workspaces/{PLANE_WORKSPACE_SLUG}/`.
- `project_id` y `work_item_id` son UUIDs reales de Plane — nunca inventar ni asumir, siempre obtenidos por API.
- Servicio central único `planeClient` (backend) del que dependen: `getPlaneConfig, testPlaneConnection, getProject, getWorkItems, getWorkItem, getProjectStates, getProjectLabels, getWorkspaceMembers, createWorkItem, resolvePlaneState, syncPlaneWorkItems, updatePlaneWorkItem, inspectPlaneWorkItem`. La API Key nunca llega al frontend.
- Wrapper HTTP único con reglas de reintento: 429/5xx → reintentar (backoff 1500ms, 3000ms); 400/401/403/404 → mensaje traducido, sin reintentar; error de red → reintentar. Registrar cada llamada (fecha, método, endpoint, status, mensaje, reintentos, detalle técnico).
- Estados de Plane son UUID → resolver contra `/states/`, cachear por `project_id` durante cada sincronización, nunca resolver estado por ticket individual. Ticket "terminal" cuando el grupo del estado es `completed` o `cancelled`.
- Estado Plane y estado SGC son **independientes**: Plane gestiona ejecución operativa, el SGC gestiona cumplimiento de Calidad (ej. no cerrar automáticamente una NC/AC solo porque el ticket de Plane esté "Done"; puede seguir "pendiente de verificación de eficacia").
- Pantalla "Tickets Plane": listado con proyecto, N° ticket, título, estado Plane, prioridad, responsable, fecha, área, clasificación SGC, estado SGC, última sync, acciones (Ver, Abrir en Plane, Tipificar, Vincular, No aplica al SGC). "No aplica al SGC" no borra el ticket, registra motivo/usuario/fecha en historial.
- "Tipificar ticket": modal con info de Plane + pregunta "¿Cómo querés clasificarlo?" (cards NC/AC/AP/OM/Q/S/R con definición simple debajo); Calidad puede modificar la clasificación final.
- Sincronización controlada, sugerida cada 6 horas + botón "Sincronizar ahora", mostrando última sincronización, tickets revisados, actualizados, errores. Log en tabla `plane_sync_logs` (id, started_at, completed_at, project_id, records_processed, records_updated, errors, status, details), con pantalla en Configuración → Integraciones → Logs.
- Link humano a Plane: `{base}/{workspace}/projects/{project_id}/issues/{work_item_id}` — mostrar botón "Abrir en Plane", no la URL cruda salvo necesidad.
- Pantalla Configuración → Integraciones → Plane: estado (🟢/🔴), Base URL, Workspace, API Key enmascarada, tabla proyecto↔área SGC↔estado↔última sync↔acciones, botones "Probar conexión" / "Sincronizar ahora" / "Inspeccionar último Work Item" (solo administradores).

## 16–19. Apps Script

Arquitectura: Portal SGC → Backend → Apps Script/Google Sheets → Plane. Apps Script es capa de integración y automatización (automatizaciones, sincronizaciones, mails, triggers, registros, reportes, Sheets, y Plane cuando corresponda) — **no** debe llevar lógica visual del portal. Credenciales en Script Properties, nunca hardcodeadas, nunca expuestas al navegador. Logs claros y mensajes de error comprensibles.

Servicio `sgcIntegrationService` (conceptual): `createSGCReport, createInternalRecord, sendToAppsScript, createPlaneWorkItem, updatePlaneWorkItem, syncPlaneStatus, syncSGCRecord, getSGCRecords, getPlaneProjects, getPlaneStates, logIntegrationError`.

## 23–34. Modelo de gestión SGC

**`sgc_records`** (tabla central): id, code, type_id, source, title, description, area_id, process_id, detected_by, assigned_to, detected_at, registered_at, due_date, priority, impact, status_id, requirement, immediate_correction, root_cause, resolution, effectiveness_result, closed_at, created_at, updated_at, + campos de integración (plane_project_id, plane_work_item_id, plane_sequence_id, apps_script_reference, google_sheet_reference).

- **No Conformidad**: requisito incumplido, descripción, evidencia, origen, impacto; corrección inmediata (acción/responsable/fecha); análisis de causa (5 Por Qué, Ishikawa, otra) → causa raíz; permite crear AC o vincular AC existente; verificación de eficacia (fecha prevista, responsable, resultado, evidencia, eficaz sí/no); si no eficaz, permite generar nueva acción.
- **Acción Correctiva**: elimina la causa de una NC para evitar recurrencia (no es sinónimo de "corrección"). Campos: origen, NC relacionada, causa raíz, acción, responsable, fecha objetivo/implementación, evidencia, responsable/fecha de verificación, resultado, eficacia. Estados: Pendiente, En curso, Implementada, Pendiente de verificación, Eficaz, No eficaz, Cerrada. No se permite cierre definitivo si corresponde verificación de eficacia y no está hecha.
- **Acción Preventiva**: categoría interna para acciones ante situaciones potenciales antes de que ocurra el problema; se relaciona con riesgos, oportunidades, controles.
- **Oportunidad de Mejora**: situación actual, propuesta, beneficio esperado, impacto, esfuerzo, responsable, área, fecha objetivo, resultado; matriz Impacto/Esfuerzo.
- **Queja**: origen, persona/entidad, motivo, descripción, servicio relacionado, responsable, respuesta, resultado; vínculos Q→NC, Q→AC.
- **Reclamo**: origen, solicitante, descripción, requisito relacionado, impacto, responsable, fecha compromiso, respuesta, resolución; vínculos R→NC, R→AC.
- **Sugerencia**: propuesta, origen, área, beneficio esperado, responsable de evaluación, resultado. Estados: Recibida, En evaluación, Aceptada, Rechazada, Implementada.

**Relaciones** (`sgc_relationships`): NC→AC, R→NC, R→AC, Q→NC, Q→AC, OM→Acción, Auditoría→NC, Auditoría→OM, Riesgo→Acción, Riesgo→NC, Ticket Plane→Registro SGC, Objetivo→Riesgo, Proceso→Riesgo, Proceso→Indicador.

**Trazabilidad** (`activity_log`): registrar creación, modificación, cambio de estado/responsable/fecha, tipificación, vinculación/desvinculación, creación de AC, análisis de causa, verificación, cierre, reapertura, sincronización, cambio de clasificación — guardando quién, qué, cuándo, valor anterior, valor nuevo. Mostrar como timeline visual. Soft delete para registros críticos, nunca borrado físico.

**Mi SGC** (vista personal): mis reportes, mis tickets, mis NC/AC/acciones, riesgos/objetivos asignados, documentos pendientes, próximos vencimientos, acciones vencidas, notificaciones, últimos movimientos.

**Dashboard de Calidad**: cards (total registros, abiertos, cerrados, vencidos, NC abiertas, AC abiertas/vencidas, OM abiertas, reclamos abiertos, riesgos altos, % cierre en término, % AC eficaces) + gráficos (por tipo, área, proceso, evolución mensual, estado, prioridad, causas raíz, reincidencias, cumplimiento por área) + tabla "Requieren atención" (código, tipo, título, área, responsable, fecha compromiso, días abiertos, estado, prioridad; orden: vencidos → alta prioridad → próximos a vencer).

## 36–47. Centro de Conocimiento

Sección "Centro de Conocimiento" (no solo "Glosario ISO"), con categorías: Conceptos de Calidad, ISO 9001, Riesgos y oportunidades, Procesos, Auditorías, Mejora continua, Información documentada, Indicadores, Clientes, Proveedores, Planificación, Liderazgo, FAQs, Instructivos.

**Estructura de cada concepto**: Nombre, Sigla, Categoría, Definición técnica resumida, "En términos simples", Ejemplo en Avenida+ (marketplace, bancos, sellers, logística, integraciones, IT, Producto, Operaciones, Comercial, Delivery, Administración, RRHH, Calidad), ¿Por qué es importante?, ¿Qué tengo que hacer si detecto esto?, Relacionado con, Documentos/instructivos relacionados, Referencia ISO (cuando corresponda, sin reproducir texto normativo protegido — usar explicaciones/resúmenes propios), botón "Reportar algo relacionado".

**Conceptos iniciales** (lista larga, ~40 términos): Acción Correctiva, Acción Preventiva, Auditoría, Causa raíz, Corrección, Eficacia, Evidencia, Hallazgo, Indicador, Información documentada, Mejora continua, No Conformidad, Objetivo de Calidad, Oportunidad, Oportunidad de Mejora, Parte interesada, Política de Calidad, Procedimiento, Proceso, Reclamo, Queja, Requisito, Riesgo, SGC, SLA, Sugerencia, Trazabilidad, Verificación, Verificación de eficacia, Contexto de la organización, Competencia, Toma de conciencia, Satisfacción del cliente, Proveedor externo, Desempeño, Seguimiento, Medición, Auditoría interna, Revisión por la dirección, Control operacional, Cambio, Objetivo, Meta.

**"Calidad en 2 minutos"**: cards cortas tipo FAQ ilustrada (¿Qué es una NC?, ¿AC?, diferencia corregir vs Acción Correctiva, ¿riesgo?, ¿oportunidad?, ¿evidencia?, ¿proceso?, ¿auditoría?, ¿indicador?, ¿parte interesada?, mejora continua, SGC, por qué documentamos/medimos/analizamos causas) — cada una entendible en <2 min.

**Comparador de conceptos**: NC vs OM, Queja vs Reclamo, Corrección vs Acción Correctiva, Riesgo vs Problema, Riesgo vs NC, AP vs Riesgo, Documento vs Registro, Indicador vs Objetivo, Proceso vs Procedimiento, Auditoría vs Control, Hallazgo vs NC, Acción vs Evidencia — cada uno con definición, diferencia clave, ejemplo Avenida+, cuándo usar cada uno.

**Asistente de clasificación**: árbol de preguntas (¿el problema ya ocurrió? → ¿existía un requisito que debía cumplirse y no se cumplió? → posible NC → ¿hace falta eliminar causa? → evaluar AC; si no ocurrió → ¿puede ocurrir? → posible riesgo; ¿hay propuesta concreta de mejora? → OM/S; ¿originado en insatisfacción de cliente/parte interesada? → evaluar Q o R) que siempre termina en "Clasificación sugerida" + aclaración "La clasificación será validada por Calidad."

**Mapa de ISO 9001** ("Entendiendo nuestro SGC"): bloques Contexto, Liderazgo, Planificación, Apoyo, Operación, Evaluación del desempeño, Mejora — cada uno con ¿qué significa?, ¿cómo lo hacemos en Avenida+?, ¿qué documentos lo respaldan?, ¿quién interviene?, ¿qué puedo hacer desde el portal?

## 43–48. Riesgos, contexto y partes interesadas

**⚠️ Contexto y Partes interesadas (párrafos siguientes) excluidos de Ágora** — decisión del usuario, 2026-09-07 (ver `claude/progreso-implementacion.md`): es trabajo estratégico de Calidad/Dirección, no contenido para toda la empresa. Se conservan estos párrafos como referencia del análisis original, pero no se implementan en el portal salvo que el usuario pida explícitamente lo contrario. Riesgos y Oportunidades (más abajo) sí se construyó — es sobre hechos operativos concretos, no análisis estratégico.

**Riesgos y Oportunidades**: tipo, código, procedencia, proceso, actividad, descripción, detalle, control existente, probabilidad/impacto/valoración inicial, plan de tratamiento/contingencia, responsable, fecha objetivo, estado, verificación, evidencia, probabilidad/impacto/valoración residual. Matriz configurable (inicial: probabilidad 1–3, impacto 1–5, valoración = probabilidad × impacto, semáforo; escala positiva diferenciada para oportunidades). Relación con procesos, objetivos, partes interesadas, proveedores, NC, AC, OM, tickets Plane. Asistente "¿Esto puede ser un riesgo?" con preguntas guía y botón "Registrar riesgo".

**Contexto de la organización**: cuestiones internas/externas, FODA, CAME, relación con riesgos/oportunidades/partes interesadas/objetivos estratégicos/procesos. Incluye evaluación específica de pertinencia de **Cambio climático** (Sí/No/En evaluación + justificación, impacto, partes interesadas, requisitos, riesgos, evidencia, responsable, revisiones) — sin asumir pertinencia por defecto, debe quedar documentada la evaluación.

**Partes interesadas**: nombre, tipo (bancos/clientes, usuarios, sellers, operadores logísticos, proveedores tecnológicos, colaboradores, dirección, organismos regulatorios, socios comerciales), necesidad, expectativa, requisito, proceso relacionado, responsable, método de seguimiento, evidencia, revisiones, estado; relación con riesgos, oportunidades, objetivos, procesos, documentos, requisitos.

## 49–54. Procesos, objetivos, indicadores, auditorías, proveedores

**Procesos** iniciales: Dirección y planificación estratégica, Diseño y Desarrollo, Implementación e Integración con Clientes, Operación de la Plataforma SaaS, Soporte y Atención al Cliente B2B, Gestión de Proveedores y Terceros, Gestión de la Calidad y Mejora Continua. Áreas: Operaciones, Comercial, Delivery, RRHH, Administración, IT, Producto, Calidad. Ficha de proceso completa: código, nombre, objetivo, alcance, responsable, entradas/actividades/salidas, clientes, proveedores, partes interesadas, indicadores, riesgos, oportunidades, documentos, registros, recursos, requisitos, NC/AC relacionadas, tickets, objetivos relacionados.

**Objetivos de Calidad**: código, objetivo, meta, indicador, unidad, recursos, responsable, fechas, frecuencia, método, resultado actual, cumplimiento, evidencia, observaciones. Estados: Cumplido, En curso, En riesgo, Incumplido. Vista Meta vs Real + histórico mensual.

**Indicadores**: código, nombre, descripción, fórmula, fuente, unidad, meta, tolerancia, frecuencia, responsable, resultado, periodo, evidencia, proceso. Tendencias, posibilidad de importar/sincronizar datos.

**Auditorías**: tipos Interna/Externa/Cliente/Proveedor. Campos código, tipo, auditor, fecha, alcance, procesos, criterios, resultado, informe, evidencia. Hallazgos: NC, OM, Observación, Acción — con posibilidad de generar registro directamente desde un hallazgo.

**Proveedores y Terceros**: proveedor, servicio, categoría, criticidad, SLA, responsable, evaluación, resultado, riesgo, documentación, revisiones, estado; relación con riesgos, NC, reclamos, indicadores, contratos, SLA.

## 55–59. Documentación e instructivos

Página educativa "Información Documentada" explicando Política, Procedimiento, Instructivo, Formulario, Registro, Evidencia, Documento externo — con ejemplos reales de Avenida+.

**Biblioteca de documentos**: tipos (Política, Procedimiento, Instructivo, Formulario, Registro, Documento externo, Normativa, Manual, Evidencia); campos código, nombre, tipo, área, responsable, versión, fecha emisión, última/próxima revisión, estado (Borrador/Vigente/Obsoleto), ubicación, link, observaciones. Control documental sin borrado de historial: `document_versions` (document_id, version, change_description, created_by, created_at, approved_by, approved_at, file_reference).

**Instructivos**: categorías Gestión SGC (cómo registrar cada tipo), Plane (crear/vincular/tipificar/actualizar/cerrar ticket), Calidad (5 Por Qué, análisis de causa, adjuntar evidencia, definir responsable, verificar eficacia, gestionar acción). Formato: código, título, objetivo, descripción, cuándo utilizarlo, paso a paso, imágenes/capturas, ejemplo, errores frecuentes, responsable, versión, revisiones, estado — termina con botón contextual de acción (ej. "Registrar NC", "Crear riesgo", "Crear ticket").

## 60–64. FAQs, notificaciones, roles y permisos

FAQs con preguntas reales de negocio (no solo definiciones). Notificaciones: nuevo reporte, asignación, vencimiento próximo, acción vencida, nueva NC, AC pendiente, verificación pendiente, documento por revisar, riesgo pendiente, objetivo fuera de meta, ticket Plane actualizado — vía Apps Script para mails cuando corresponda.

**Roles**: Administrador SGC (acceso total), Calidad (clasificar/modificar/crear/cerrar/verificar/gestionar documentos y riesgos), Responsable de Área (gestiona registros de su área), Colaborador (reporta/consulta/actualiza asignados), Consulta (solo lectura). Permisos granulares tipo `sgc.records.create`, `sgc.records.classify`, `sgc.risks.edit`, `plane.sync`, `plane.inspect`, etc.

Historial/auditoría de toda modificación importante; soft delete para registros críticos (quién, qué, cuándo, valor anterior, valor nuevo).

## 65. Modelo de datos (tablas iniciales a diseñar)

`sgc_records, sgc_record_types, sgc_statuses, sgc_areas, sgc_processes, sgc_actions, sgc_relationships, sgc_evidence, sgc_root_causes, sgc_effectiveness_checks, sgc_risks, sgc_risk_controls, sgc_objectives, sgc_indicators, sgc_interested_parties, sgc_context_items, sgc_audits, sgc_audit_findings, sgc_suppliers, plane_projects, plane_work_items, plane_sync_logs, instructions, instruction_versions, documents, document_versions, glossary_terms, faq, activity_log, notifications, users, roles, permissions`.

## 66–77. Configuración, diagnóstico, ISO, búsqueda y filtros

Pantalla Configuración → Integraciones → Plane con estado de conexión, credenciales enmascaradas, tabla proyecto↔área, botones de test/sync/inspección (solo admins). Diagnóstico vía `testPlaneConnection()` e `inspectPlaneWorkItem()` (JSON crudo del último Work Item, para no construir funcionalidades sobre campos no validados).

Arquitectura en capas: Frontend → Backend/API/Server Actions → Servicios SGC → Servicios de integración → Apps Script/Plane. Nunca llamar desde el frontend directamente a servicios con credenciales privadas.

No reproducir texto extenso de normas ISO protegidas — usar explicaciones/resúmenes/interpretaciones propias, con referencias generales a cláusulas cuando corresponda. Tabla `iso_standard_versions` (standard, edition, amendment, status, effective_from, transition_until, notes) para poder versionar (ej. ISO 9001:2015, ISO 9001:2015/Amd 1:2024) sin asumir reemplazo automático de edición.

Búsqueda global con resultados agrupados por categoría (Concepto / Instructivo / Documento / Mis registros / etc.).

Filtros generales por tipo, estado, área, proceso, responsable, prioridad, origen, proyecto Plane, fecha/mes/año, vencidos/abiertos/cerrados; búsqueda libre por código, título, descripción, ticket Plane, persona, proceso.

Exportación a Excel/CSV/PDF, especialmente para auditorías, riesgos, NC, AC, objetivos, indicadores, reportes de gestión.

## 78–80. Pantalla de detalle y administración de contenido

`/sgc/registros/[id]` con header (código, tipo, estado, prioridad, título) y tabs: Resumen, Análisis, Acciones, Evidencias, Plane (proyecto, ticket, título, estado Plane, responsable, última sync, botón "Abrir en Plane"), Relaciones, Historial.

El equipo de Calidad debe poder editar desde el portal (sin tocar código): conceptos, FAQs, categorías, ejemplos, instructivos, documentos, relaciones, textos de ayuda. Requiere un CMS interno básico / tablas administrables, no contenido hardcodeado en React.

Principio de contenido: cada concepto responde ¿Qué es? ¿Qué significa en simple? ¿Por qué importa? ¿Cómo se aplica en Avenida+? ¿Cómo identifico un caso? ¿Qué tengo que hacer? ¿Dónde encuentro más info? ¿Puedo reportarlo desde acá?

## 81–82. Objetivo cultural y resultado esperado

Mensaje central: la Calidad no pertenece solo al área de Calidad; el SGC es la forma en que Avenida+ trabaja, organiza, registra, controla, mide, aprende y mejora. Lenguaje cercano, profesional y práctico — evitar tono normativo/burocrático.

Resultado final esperado: un punto único desde el que cualquier colaborador pueda APRENDER, CONSULTAR, REPORTAR, GESTIONAR (NC/AC/AP/OM/Q/R/S), PLANIFICAR (riesgos, oportunidades, objetivos), MEDIR, AUDITAR, HACER SEGUIMIENTO y MEJORAR — todo integrado con Plane, Apps Script, Google Sheets y el Portal SGC.

## 83–88. Forma de trabajo (metodología obligatoria)

- **No generar todo el sistema de una sola vez** — trabajar por fases.
- Para cada fase: revisar la estructura actual del proyecto → mantener arquitectura/estética existente → explicar qué se va a implementar → indicar archivos nuevos y archivos a modificar → entregar código completo con ruta exacta → indicar variables de entorno y comandos → validar compilación → probar funcionalidad → corregir errores antes de avanzar.
- **No reemplazar archivos existentes sin revisar antes su contenido. No crear una aplicación nueva desde cero si ya existe una estructura base.**

**Orden de fases:**

1. Estructura visual (layout, header, sidebar, home, Mi SGC, menú, diseño base)
2. Centro de Conocimiento (conceptos, Calidad en 2 minutos, FAQs, comparador, buscador)
3. Reportes SGC (reportar, formularios, códigos, registros, listado, detalle, historial)
4. Plane (variables, cliente API, test conexión, proyectos, estados, work items, creación de tickets, sincronización)
5. Apps Script (integración, registro, comunicación, sincronización, errores, triggers)
6. Tipificación (Tickets Plane → clasificación NC/AC/AP/OM/Q/S/R)
7. Gestión completa (análisis de causa, corrección, AC, verificación de eficacia, relaciones, evidencias)
8. Riesgos (matriz, controles, residual, oportunidades)
9. ~~Contexto (FODA, CAME, partes interesadas, cambio climático)~~ — **excluido de Ágora** (decisión del usuario, 2026-09-07, ver `claude/progreso-implementacion.md`): es análisis estratégico interno de Calidad/Dirección, no contenido para toda la empresa. No se construye en el portal. Lo único de esta fase que sí es público ya existe: el concepto "Política de Calidad" en el Centro de Conocimiento (Fase 2).
10. Procesos (mapa, ficha, riesgos, indicadores, documentos)
11. Objetivos e indicadores (metas, resultados, dashboards)
12. Documentación (documentos, versiones, instructivos, control documental)
13. Auditorías (programa, auditorías, hallazgos, acciones)
14. Dashboard Ejecutivo (KPIs, gráficos, vencimientos, tendencias, eficacia, reincidencias)

**Primer paso obligatorio antes de tocar código** (aplica a la Fase 1): revisar el proyecto actual completo — stack, estructura de carpetas, componentes reutilizables, sistema de estilos, base de datos existente, variables de entorno, integraciones existentes, implementación actual de Apps Script si existe — y proponer arquitectura sin romper lo que ya funciona. Recién ahí empezar, exclusivamente, por la Fase 1. No avanzar de fase hasta que la anterior esté funcionando.

## Reglas especiales (resumen)

- **Plane**: instancia Community Edition self-hosted; nunca asumir Plane Cloud ni `api.plane.so`; auth `X-API-Key`; UUIDs reales para proyectos/estados (nunca inventados); resolver estado vía `/states/` con caché por proyecto; estados terminales `completed`/`cancelled`; reintentos solo en 429/5xx; diagnóstico vía `testPlaneConnection()` / `inspectPlaneWorkItem()`.
- **Apps Script**: capa de integración/automatización, no lógica visual; credenciales en Script Properties; nunca hardcodear URLs/API keys/tokens; logs claros y mensajes de error comprensibles.

---
*Fuente: brief funcional completo entregado por el usuario (2026-09-05). Ver también `claude/integracion-plane-appsscript.md` para el detalle técnico de la integración con Plane ya implementada en Apps Script, que sirve de referencia para el backend del portal, y `claude/progreso-implementacion.md` para el registro de la decisión de nombre (Ágora) y el rediseño visual v2 (Fase 1, 2026-09-05).*
