# Progreso de implementación — Ágora (ex "SGC Avenida+")

> Actualizar este documento al cerrar cada fase (ver el orden de fases en `claude/spec-sgc-avenida-plus.md`). Sirve para que cualquier sesión futura sepa exactamente en qué quedó el desarrollo sin tener que releer todo el historial de chat.

## Nombre definitivo: Ágora ✅ (2026-09-05)

El usuario pidió varias tandas de opciones de nombre (colaboración/pertenencia, metáforas de calle, etc.) y finalmente eligió **"Ágora"** — plaza pública donde la comunidad participa y discute, coherente con el objetivo cultural de "la calidad es de todos". Se mantiene **"Avenida+"** como marca paraguas (lockup secundario en el pie del sidebar y en el banner de cierre del Home), replicando la estructura de la referencia visual que compartió el usuario (ver sección de diseño abajo).

Aplicado en todo el código: metadata (`app/layout.tsx`), sidebar, títulos de página (`scripts/generate-placeholders.cjs` + páginas hechas a mano), README, y el documento `claude/spec-sgc-avenida-plus.md` (título y sección Home actualizados). **Actualización 2026-09-07: ya existe el isotipo definitivo — ver la sección "Actualización visual" más abajo.** (Nota histórica: en esta fase se había creado un isotipo propio simple como placeholder, hoy reemplazado.)

## ⚠️ Aclaración importante del usuario (2026-09-05, posterior a la Fase 1) — leer antes de tocar Plane/Apps Script

El usuario corrigió un supuesto del brief original sobre quién usa qué sistema. Esto condiciona cómo se diseñe el backend a partir de la Fase 4/5:

- El sistema **"SGC" que ya existe en Google Apps Script + Google Sheets** (documentado en `claude/integracion-plane-appsscript.md`) es de **uso exclusivo del área de Calidad**. Es su "Registro de Gestión" interno — no se expone ni se reemplaza por el portal.
- **El Portal (Ágora) es para el resto de la empresa**: la idea central es que cualquier colaborador cargue reportes y haga seguimiento ahí (Home, Reportar, Mi SGC, Centro de Conocimiento, Registro SGC siguen aplicando tal cual al público general).
- El punto de conexión entre ambos mundos: el Portal debe **conectarse a Plane y llevar esa información hacia el Apps Script existente, al "Registro de Gestión"** — es decir, el flujo no es "el portal reemplaza el registro de Calidad", sino "el portal genera el ticket en Plane, y esa novedad tiene que reflejarse en el Registro de Gestión que Calidad ya usa en Sheets/Apps Script".

**Resuelto en la Fase 3 (2026-09-05):** se le preguntó explícitamente al usuario dónde debían persistir los reportes del portal, y eligió **base de datos propia del portal** (no un mock, no una escritura directa a Sheets todavía). Ver el detalle técnico de la decisión en la sección de Fase 3 más abajo.

Implicancia para el menú "Gestión de Calidad" del portal: las pantallas de gestión profunda (análisis de causa, verificación de eficacia, cierre de AC, etc. — Fase 7, ya completa, ver más abajo) operan sobre los mismos registros que ya creó esta Fase 3, no sobre un registro paralelo.

## Sistema visual v2 — rediseño claro tipo dashboard (2026-09-05)

El usuario compartió una referencia visual (mockup de un dashboard llamado "Ágora": sidebar claro, ícono/isotipo de manos en gradiente violeta→azul, buscador protagonista en el header, hero con foto de equipo + headline + lista de palabras + callout, accesos rápidos con íconos de colores variados, fila de stat cards con tendencias, y una sección de 3 columnas "Requieren atención" / "Actividad reciente" / "Mis pendientes"). Se rehizo la estética de la Fase 1 para acercarse a esa referencia — ver detalle de componentes en el historial de este documento (Home, Sidebar, isotipo, paleta). Sin cambios en esta fase.

## Estado general

- **Código:** no existía un proyecto previo — se arrancó desde cero (Next.js 16 + React 19 + TypeScript + Tailwind v4), confirmado con el usuario el 2026-09-05.
- **Repositorio:** todavía no está en GitHub. El código se entregó como .zip por el chat (última versión: `agora-sgc-avenida-plus.zip`, incluye Fases 1–7 completas + este `claude/` de continuidad + `apps-script/reference/` con el código real de referencia). Si el usuario crea un repo, actualizar esta sección con la URL.
- **Deploy:** ninguno todavía.
- **Base de datos:** SQLite local vía `node:sqlite` (ver Fase 3). El archivo vive en `data/agora.db`, se crea y semilla solo la primera vez que corre el servidor. No se versiona (está en `.gitignore`).
- **Plane:** integrado en el código (Fase 4) pero **sin probar contra una instancia real** — el usuario no compartió credenciales por confidencialidad (correcto, no hacía falta). Ver la sección de Fase 4 más abajo para qué falta validar apenas se carguen las variables de entorno reales.

## Fase 1 — Estructura visual: ✅ Completa (2026-09-05)

Proyecto base Next.js 16 (App Router) + TypeScript + Tailwind CSS v4, layout completo (Sidebar, Header con buscador global, breadcrumbs), Home tipo dashboard, Mi SGC con datos de ejemplo, selector visual de categorías en Reportar, y placeholders para toda ruta del menú sin funcionalidad todavía. Ver detalle de componentes de diseño en la sección "Sistema visual v2" arriba.

## Fase 2 — Centro de Conocimiento: ✅ Completa (2026-09-05)

Conceptos (43, con detalle y buscador/filtro), Calidad en 2 minutos, Comparador de conceptos, FAQ, y el mapa de ISO 9001 — todo con contenido real (primer borrador redactado por Claude, parafraseado del vocabulario ISO 9000, marcado como "Borrador — a revisar por Calidad"). Buscador global ampliado para indexar conceptos y FAQs. Ver `lib/concepts-data.ts`, `lib/two-minutes-data.ts`, `lib/comparisons-data.ts`, `lib/faq-data.ts`, `lib/iso-map-data.ts`, `lib/search-index.ts`.

## Fase 3 — Reportes SGC: ✅ Completa (2026-09-05)

Reemplaza el selector visual (sin backend) de `/reportar` por un flujo real de punta a punta, y reemplaza los placeholders de `/gestion-calidad/registro`, `/configuracion/areas` y `/configuracion/tipos`.

**Decisión de persistencia — importante para cualquier sesión futura:** se probó primero **Prisma**, pero su CLI necesita descargar binarios de motor desde `binaries.prisma.sh` al instalar/generar el cliente, y ese host está bloqueado en el entorno de build de esta sesión (403 Forbidden). En vez de pelear contra esa restricción de red (que podría repetirse en el entorno de despliegue real), se optó por **`node:sqlite`** — el driver de SQLite incluido en Node 22.5+ sin ninguna dependencia externa ni descarga de binarios. Es una base de datos real (un archivo SQLite en `data/agora.db`), no un mock. Todo el acceso a datos está encapsulado en `lib/db/queries.ts`, así que migrar a Postgres más adelante (por ejemplo, si hace falta correr varias instancias del servidor al mismo tiempo) implica reescribir ese archivo, no tocar las páginas. **Riesgo a tener en cuenta:** `node:sqlite` es todavía una API experimental de Node (estable desde 22.5, con warning en consola) y requiere Node ≥ 22.5 en el entorno de despliegue — si el hosting definitivo usa una versión de Node más vieja, revisar esto antes de desplegar.

Implementado:

- **`/reportar/nuevo`**: formulario real (título, qué ocurrió, área, proceso, fecha del hecho, quién reporta, impacto, prioridad, urgente, evidencia como texto/link, comentarios). Se llega ahí desde el selector de categorías de `/reportar` (botón "Continuar con el reporte", antes deshabilitado).
- **Código SGC automático**: `generateSgcCode()` en `lib/db/queries.ts`, correlativo por tipo y año (ej. `NC-2026-001`, `NC-2026-002`, reinicia en `NC-2027-001`), usando una tabla de contadores (`code_counters`) para que sea atómico y nunca dependa del número de fila.
- **`/reportar/confirmacion/[code]`**: pantalla de confirmación con el código, estado y tipo, botón "Ver seguimiento" al detalle y "Reportar otra situación".
- **`/gestion-calidad/registro`**: listado real desde la base, con buscador y filtros por tipo/área (componente `components/gestion-calidad/registro-table.tsx`).
- **`/gestion-calidad/registro/[code]`**: detalle completo del registro + historial de trazabilidad (tabla `activity_log`). **Actualización Fase 7: esta pantalla ahora tiene tabs completos — ver la sección de Fase 7 más abajo.**
- **`/configuracion/areas`** y **`/configuracion/tipos`**: CRUD simple (alta + activar/desactivar) para las 8 áreas y los 7 tipos de registro (NC, AC, AP, OM, Q, S, R) sembrados por defecto — ya no hace falta tocar código para sumar un área o un tipo nuevo.

**Alcance deliberadamente simplificado / diferido (estado actualizado a Fase 7):**

- **Evidencia**: el campo de texto original del reporte (`evidence_note`) sigue como estaba; la Fase 7 sumó además una lista de evidencias adicionales (texto/link, ver más abajo) — sigue sin ser carga de archivos real.
- **Estados**: resuelto parcialmente en la Fase 7 — las Acciones Correctivas ya tienen un flujo de estados específico con bloqueo de cierre (ver Fase 7). El resto de los tipos (NC, AP, OM, Q, S, R) sigue con el flujo genérico compartido.
- **Configuración → Estados, Usuarios, Roles**: siguen como placeholder. Usuarios/Roles porque todavía no existe un sistema de autenticación — "Reportado por" hoy es un campo de texto libre en el formulario, no una sesión de usuario. **Definir autenticación es una decisión pendiente explícita antes de construir Usuarios/Roles de verdad.** (Ver también la nota sobre `lib/mock-user.ts` en "Actualización visual" más abajo — sigue siendo un placeholder, no autenticación real.)
- **Vencimientos**: ✅ resuelto en la Fase 7 — los registros ya tienen un campo `due_date` (vencimiento/compromiso) editable desde el detalle.
- **Plane**: el reporte no crea todavía un ticket en Plane (Fase 4) — la confirmación lo aclara explícitamente.

Archivos clave para retomar:

- `lib/db/client.ts` — conexión SQLite, migración (`CREATE TABLE IF NOT EXISTS`) y semilla de áreas/tipos, todo idempotente.
- `lib/db/queries.ts` — toda la lectura/escritura (áreas, tipos, registros, código automático, historial). Punto único para migrar a otro motor de base de datos el día de mañana.
- `lib/db/node-sqlite.d.ts` — tipos TypeScript mínimos para `node:sqlite` (el `@types/node` instalado todavía no los incluye).
- `lib/actions/reports.ts`, `lib/actions/admin.ts` — Server Actions (`"use server"`) que usan las queries de arriba.
- `app/reportar/nuevo/`, `app/reportar/confirmacion/[code]/`, `app/gestion-calidad/registro/`, `app/gestion-calidad/registro/[code]/`, `app/configuracion/areas/`, `app/configuracion/tipos/` — páginas nuevas, todas marcadas `export const dynamic = "force-dynamic"` porque leen de la base en cada request.

Build de producción y lint verificados sin errores. Probado visualmente el flujo completo de punta a punta con Playwright (elegir categoría → completar formulario → confirmación con código real → detalle → aparece en el listado), desktop y mobile.

## Fase 4 — Integración Plane: ✅ Completa en código (2026-09-06) — pendiente de probar contra Plane real

**Disparador de esta fase:** el usuario pidió explícitamente conectar el portal a su Plane y a su Apps Script/Registro de Gestión ya existentes, aclarando que **no puede compartir credenciales reales de Plane por confidencialidad**. Se respetó eso al pie de la letra: en ningún momento de esta sesión se pidieron ni se inventaron URL base, workspace slug, API key, ni `project_id` reales — todo lo de abajo son "slots" de configuración vacíos que el usuario completa en su propio entorno, sin pasarlos por el chat.

**Qué se construyó:**

- **Esquema de datos** (`lib/db/client.ts`, `lib/db/queries.ts`): la tabla `records` suma columnas `plane_project_id`, `plane_work_item_id`, `plane_sequence_id`, `plane_status`, `plane_url`, `plane_synced_at` (agregadas con `ALTER TABLE ... ADD COLUMN` de forma idempotente, para no romper instalaciones que ya venían de la Fase 3). Tablas nuevas: `plane_project_mappings` (qué proyecto de Plane le corresponde a cada área) y `plane_sync_logs` (historial de todo intento de sincronización, éxito/error/salteado).
- **Cliente de Plane** (`lib/plane/client.ts`): replica al pie de la letra las convenciones de la integración real que el usuario ya tiene en Apps Script (`claude/integracion-plane-appsscript.md`) — mismo header `X-API-Key`, misma forma de URL (`{base}/api/v1/workspaces/{slug}/...`), mismo criterio de reintentos (429/5xx reintenta con backoff `1500ms * intento` hasta 2 veces; 4xx falla directo con mensaje traducido), mismo cacheo de estados por proyecto. Si `PLANE_BASE_URL`/`PLANE_WORKSPACE_SLUG`/`PLANE_API_KEY` no están seteadas, todas las funciones de alto nivel se comportan como "Plane apagado" en vez de romper nada.
- **`lib/plane/sync.ts`**: al crear un reporte, si el área tiene un proyecto de Plane mapeado y Plane está configurado, crea el work item y guarda la relación en el registro; si no, no rompe nada — deja registrado el motivo (no configurado / área sin mapear / mapeo desactivado / error de Plane) en el historial del registro y en `plane_sync_logs`. También incluye `syncAllRecordsStatusFromPlane()` para refrescar en lote el estado de los tickets que el portal ya conoce (botón "Sincronizar ahora").
- **`/configuracion/plane`**: estado de las tres variables de entorno (sin exponer valores), alta/edición/activar-desactivar/eliminar del mapeo área↔proyecto, botón "Probar conexión" por proyecto, botón "Sincronizar ahora", y un panel de "Últimos intentos".
- **`/configuracion/logs`**: tabla completa de `plane_sync_logs` (fecha, dirección, evento, registro vinculado, estado, detalle).
- **Confirmación de reporte y detalle del Registro SGC**: muestran "Abrir en Plane" cuando hay un ticket vinculado; si no, una frase corta explicando por qué (Plane no configurado / área sin mapear / no se pudo crear) en vez de un espacio vacío.
- **`.env.example`**: placeholders vacíos de las tres variables, con comentario explícito de que nunca van versionadas ni compartidas en el chat.
- **`apps-script/plane-a-registro-gestion.gs`** (histórico, reemplazado en la corrección de más abajo): archivo aparte (no forma parte del build de Next.js) para que el usuario lo pegue en su proyecto de Apps Script existente. Resolvía la otra mitad del pedido original: traer al Registro de Gestión los tickets que se hayan cargado *directo en Plane* (sin pasar por el portal). Todas las funciones estaban prefijadas `agoraPlaneSync` para no pisar ninguna función real del usuario por coincidencia de nombre (Apps Script pisa silenciosamente funciones con el mismo nombre entre archivos). El archivo traía su propia lista de diagnóstico para validar los supuestos antes de dejarlo correr en un trigger.

**⚠️ Supuesto no verificado — importante para la próxima sesión y para el usuario:** la integración real de Apps Script que ya tiene el usuario solo necesitaba *leer un work item por id ya conocido* (`GET /projects/{id}/work-items/{work_item_id}/`). Nunca necesitó *listar* todos los work items de un proyecto. Para poder traer tickets creados directo en Plane hacía falta ese endpoint de listado, así que tanto `lib/plane/client.ts` (`listWorkItems`) como el script de Apps Script **asumen** que existe en la misma ruta base sin id (`GET /projects/{id}/work-items/`, patrón REST estándar) y que pagina con `{ results, next_cursor }`. Esto no está confirmado contra ninguna instancia real de Plane — el propio código y el script de Apps Script traen funciones de diagnóstico (`testConnection`/"Probar conexión" en el portal, `agoraPlaneSyncProbarConexion()`/`agoraPlaneSyncProbarListado()` en Apps Script) pensadas específicamente para que el usuario lo verifique apenas cargue sus credenciales reales. Si el endpoint no existe o tiene otra forma, es el único lugar que habría que ajustar. **Nota (Fase 6, 2026-09-07): `listWorkItems()` sigue sin probarse contra Plane real — ver la limitación documentada en la Fase 6 más abajo.**

**Otros recortes de alcance deliberados:**

- No se automatizó la clasificación de un ticket creado directo en Plane en un tipo NC/AC/AP/OM/Q/S/R — Plane no tiene ese concepto. El script de Apps Script deja la columna "Tipo" vacía para que alguien de Calidad la complete a mano (resuelto del lado del portal en la Fase 6, "Tipificación de tickets Plane").
- El layout de columnas del Registro de Gestión en Sheets era un supuesto documentado en el propio script de Apps Script (`COLUMNAS_REGISTRO`) — corregido por completo en la Fase 5 al descubrirse el esquema real (ver corrección más abajo).
- No se probó nada de esta fase contra una instancia real de Plane — se verificó explícitamente que **todo se degrada bien sin credenciales** (build, lint y un flujo completo con Playwright: crear reporte → confirmación → detalle → Configuración → Plane → agregar mapeo → "Probar conexión" → aparece como error claro en Logs → "Sincronizar ahora" no rompe nada).

Archivos clave para retomar: `lib/plane/client.ts`, `lib/plane/sync.ts`, `lib/actions/plane.ts`, `app/configuracion/plane/page.tsx`, `app/configuracion/logs/page.tsx`, `.env.example`.

## ⚠️ Corrección importante (2026-09-06): la integración Plane↔Apps Script "de referencia" no existía — se descubrió el código real y se reconstruyó Fase 4/5 sobre esa base

Justo después de cerrar la Fase 4 de arriba, el usuario aclaró algo que cambia una premisa central de esta sección y de `claude/integracion-plane-appsscript.md`: **su Apps Script real nunca tuvo integración con Plane**. El documento `Plane.so.md` que había servido de fuente en una sesión anterior era, según todo lo que se pudo reconstruir, documentación pública de la API de Plane — no la prueba de una implementación propia ya funcionando. El usuario lo confirmó explícitamente: *"Tengo que armar lo de plane no lo tengo"*.

Esto se descubrió porque el usuario subió directamente al Project de Claude los dos archivos reales de su sistema — `Codigo_final.gs` (backend Apps Script) e `Index_final.html` (frontend) — algo a lo que esta sesión no había tenido acceso hasta ese momento (antes solo existía el resumen escrito en `claude/integracion-plane-appsscript.md`, nunca el código en sí). **Ambos archivos, tal cual el usuario los subió, ahora también viven en este repo bajo `apps-script/reference/` — ver el aviso al principio de esos archivos y la sección "Referencia: código real del SGC en Apps Script" al final de este documento.** Leyendo el código real quedó claro que:

- Las hojas reales son `documentos`, `no_conformidades`, `log`, `usuarios`, `areas`, `tareas`, `acciones_correctivas`, `recovery` — con columnas específicas, documentadas en detalle en `apps-script/reference/Codigo_final.gs` (función `inicializarHojas()`) y en la sección 7 de `claude/integracion-plane-appsscript.md`.
- El frontend real (`Index_final.html`) **no usa `doGet`/`doPost` por HTTP** para los datos — usa exclusivamente `google.script.run` (RPC directo a funciones del servidor, vía un wrapper `gsr()`). Las rutas `doGet`/`doPost` sí existen en el archivo pero parecen ser una API HTTP paralela, no lo que consume la UI real.
- La vista "Reg. Gestión AV" (el listado unificado NC + AC + OM/OBS/AP/QRyS/Otro) **no es una sola hoja**: se arma en el cliente (`buildR002Rows()` en el HTML) combinando `no_conformidades`, `acciones_correctivas` y una hoja `r002_manual` (solo para los tipos manuales OM/OBS/AP/QRyS/Otro).
- **Bug latente descubierto en el código real, no corregido (solo documentado — no se tocó nada del Código real sin que el usuario lo pida):** `sgcGetR002`/`sgcSaveR002` están definidas dos veces en `Codigo_final.gs`. La segunda definición (al final del archivo) pisa a la primera y en realidad opera sobre una hoja llamada `r002_manual` (autocreada si no existe) con un layout de columnas distinto al de la hoja `r002` que sí crea `inicializarHojas()`. Resultado: la hoja `r002` queda huérfana, nunca se lee ni se escribe. No rompe nada hoy porque el código funciona igual (la segunda definición es la que gana), pero vale la pena que Calidad lo sepa por si alguna vez alguien edita ese archivo y reordena las funciones. **Sigue sin resolverse (ver "Próxima fase" al final del documento).**

**Qué se corrigió como consecuencia:**

- `claude/integracion-plane-appsscript.md` — se reescribió la introducción para dejar en claro que documenta las *convenciones técnicas de la API pública de Plane* (útiles como referencia de cómo hablarle a Plane), no una integración que ya existiera en el Apps Script del usuario.
- Se **reemplazó por completo** `apps-script/plane-a-registro-gestion.gs` (que asumía una hoja plana inexistente "Registro de Gestión") por `apps-script/plane-integracion-sgc.gs`, escrito contra el esquema real de `Codigo_final.gs`. Ver el detalle completo en la sección "Fase 5" más abajo.
- La arquitectura de fondo quedó **confirmada explícitamente por el usuario**: *"si te confirmo lo de la arquitectura tenerlo en mi spp script y en plane como seguimiento"* — es decir, los datos viven en su Apps Script/Sheets real, y Plane es la capa de seguimiento/tracking, no el sistema de registro primario. Esto no cambia lo ya construido en la Fase 4 del portal Ágora (`lib/plane/*`), que sigue siendo válido como integración *del portal* con Plane para los reportes que entran por Ágora — pero el punto de conexión real con "el SGC de Calidad" pasa a ser el Apps Script real, no un puente HTTP hacia el portal (todavía no se decidió si el portal también debería hablar directo con `doGet`/`doPost` de `Codigo_final.gs` — queda abierto, ver "Pendiente" al final de la Fase 5).

## Fase 5 — Integración Plane dentro del Apps Script real: ✅ Completa en código (2026-09-06) — confirmada contra la instancia real del usuario

**Disparador:** ver la corrección de arriba. A diferencia de la Fase 4 (que integra Plane con la base de datos propia del portal), esta fase integra Plane directamente con las hojas reales que usa Calidad todos los días.

**Qué se construyó — `apps-script/plane-integracion-sgc.gs`** (archivo nuevo, se pega aparte en el mismo proyecto de Apps Script, no reemplaza ni edita `Codigo_final.gs`):

- **100% aditivo:** no modifica ninguna función ni hoja existente. Todas las funciones están prefijadas `agoraPlaneSync` para no chocar por nombre. La configuración va en Script Properties (`PLANE_BASE_URL`, `PLANE_WORKSPACE_SLUG`, `PLANE_API_KEY`) — nunca se pidieron ni se vieron valores reales en esta sesión, respetando la confidencialidad como en la Fase 4.
- **Lee los datos reales a través de las funciones reales**, no tocando las hojas a mano: usa `sgcGetNcs()`, `sgcGetAC()`, `sgcGetR002()` (la definición real que opera sobre `r002_manual`) para leer, y `sgcSaveR002()` para escribir los tickets que llegan de Plane. Esto evita cualquier riesgo de que un supuesto de columnas mío quede desalineado con el layout real — si esas funciones cambian de forma en el futuro, este script las sigue usando igual.
- **Vínculo registro↔ticket en una hoja propia** (`plane_tracking`), no como columnas nuevas en `no_conformidades`/`acciones_correctivas`/`r002_manual` — cero riesgo de romper el layout fijo de columnas que esperan `sgcGetNcs`/`sgcSaveNc`/etc.
- **Configuración hardcodeada en el código, no en hojas de Sheets** (cambio a pedido del usuario, 2026-09-06 — antes eran dos hojas `plane_mapeos`/`plane_entrada_proyectos`): como el `project_id` de Plane no es una credencial (es un UUID interno), no hay problema de confidencialidad en tenerlo en el código — lo que sigue yendo siempre en Script Properties, nunca en el archivo, es `PLANE_API_KEY`. Dos constantes al principio del archivo (sección 0): `AGORA_PLANE_SYNC_MAPEOS_FIJOS_` (salida, por tipo → project_id — en el workspace real "Avenida" del usuario, el proyecto "Administración" recibe los tickets nuevos del SGC) y `AGORA_PLANE_SYNC_ENTRADA_FIJA_` (entrada, lista de proyectos preexistentes a importar — "Sellers Universe" y "Coatí"). `agoraPlaneSyncInicializar()` ya no crea hojas de mapeo, solo `plane_tracking` y `plane_logs` (esas sí siguen siendo hojas, porque son datos que el script genera, no configuración manual).
- **Mapeo por TIPO, no por ÁREA** (decisión tomada sin frenar a preguntar, documentada para poder revisarla): en el esquema real, `acciones_correctivas` y `r002_manual` no tienen columna de área en absoluto (solo `no_conformidades` tiene `area_detecta`), así que mapear por área hubiera dejado sin proyecto de Plane a la mayoría de los tipos.
- **Salida (Apps Script → Plane)**, trigger cada 30 min (`agoraPlaneSyncSalida`): crea un work item por cada registro nuevo sin ticket todavía. También `agoraPlaneSyncUno(tipo, id)` para sincronizar un registro puntual al instante (opcional, requiere una línea agregada a mano en `Codigo_final.gs`).
- **Refresco de estado**, trigger cada 30 min (`agoraPlaneSyncActualizarEstados`).
- **Entrada (Plane → Apps Script)**, trigger cada 1 hora (`agoraPlaneSyncEntrada`): lista los work items de cada proyecto de `AGORA_PLANE_SYNC_ENTRADA_FIJA_` y los que no tengan fila en `plane_tracking` se agregan a `r002_manual` vía `sgcSaveR002()`, con `tipo` = el `tipoDestino` configurado para ese proyecto (hoy "Otro" para Sellers Universe y Coatí) — Calidad los revisa y tipifica a mano.

**✅ Confirmado end-to-end contra la instancia real del usuario (2026-09-06) — ya no es un supuesto:**

- El 403 al probar conexión no era de Apps Script ni del código — era el `PLANE_WORKSPACE_SLUG`. En la instancia real del usuario el slug no aparece en la URL de navegación normal — se saca de Configuración del Workspace → General → "URL del espacio de trabajo". Una vez cargado bien, `agoraPlaneSyncProbarConexion` pasó a dar OK.
- `sgcSaveR002` en el Código real espera su parámetro como **texto JSON**, no como objeto — hace `JSON.parse(...)` adentro. Confirmado por el error real `SyntaxError: "[object Object]" is not valid JSON`. Se corrigió con `agoraPlaneSyncLlamarSgcSaveR002_()` (stringify antes de llamar, parse de la respuesta si viene como texto), usada en `agoraPlaneSyncEntrada` y `agoraPlaneSyncVerificarSgcSaveR002`.
- El usuario confirmó **"Listo ahora si"** tras corregir ambos puntos — la integración quedó funcionando de punta a punta contra su Plane y su Apps Script reales. Queda como acción suya, todavía sin confirmar, borrar la fila de prueba `[PRUEBA agoraPlaneSyncVerificarSgcSaveR002 — borrar esta fila]` que quedó en `r002_manual`.

**Pendiente, todavía no resuelto**: multi-workspace (si algún proyecto de Plane termina viviendo en otro workspace, o en otra instancia de Plane entera) — hoy `PLANE_WORKSPACE_SLUG` es único y global. No implementado, para cuando el usuario confirme que lo necesita.

**Limitación documentada (no resuelta, decisión pendiente):** como el vínculo con Plane vive en `plane_tracking` y no como columnas nuevas en las hojas reales, hoy el estado del ticket de Plane **no se ve** en la pantalla "Reg. Gestión AV" del portal frontend (`Index_final.html` / `buildR002Rows()`) — haría falta tocar ese HTML y sumar una función que cruce con `plane_tracking`. Se dejó fuera de esta fase para no editar a ciegas el archivo real del usuario sin poder probarlo.

Archivo clave para retomar: `apps-script/plane-integracion-sgc.gs` (reemplaza por completo al `apps-script/plane-a-registro-gestion.gs` de la Fase 4, que quedó borrado del repo por estar basado en una hoja que no existe).

## Actualización visual — logo real, nav estilo pill, header con usuario/notificaciones (2026-09-07)

El usuario compartió una referencia visual nueva del Home (sidebar con navegación activa en pastilla/pill, header mostrando nombre completo + rol del usuario y un badge de notificaciones) y pidió explícitamente **"Toma esta estética que te pase"**. Preguntado si esto era solo para ajustar el boceto o para el código real, eligió actualizar el código real de Sidebar y Header.

Poco después el usuario envió el **archivo real del logo de Ágora** ("Te paso el logo": manos formando un círculo en degradé violeta→azul, con el wordmark "Ágora" y el tagline "Gestión · Conocimiento · Mejora"), reemplazando el isotipo SVG placeholder que se había dibujado a mano en la Fase 1.

**Qué se cambió:**

- `components/brand/agora-mark.tsx`: ahora renderiza el ícono real (`next/image`) en vez del SVG dibujado a mano.
- `public/brand/agora-icon.png`: ícono recortado y ajustado a lienzo cuadrado (fondo transparente) extraído del archivo real provisto por el usuario.
- `public/brand/agora-logo-full.png`: el lockup completo (ícono + wordmark + tagline) guardado para uso futuro (por ejemplo, una pantalla de login).
- `components/layout/sidebar.tsx`: el ítem activo del menú pasa de rectángulo redondeado a **pill** (`rounded-full`) con fondo violeta sólido, replicando la referencia.
- `components/layout/header.tsx`: la campana de notificaciones ahora muestra un badge con cantidad de no leídas; el avatar "AV" genérico se reemplazó por un círculo con gradiente + nombre completo y rol del usuario + chevron, replicando el header de la referencia.
- `app/globals.css`: nueva clase utilitaria `.avatar-gradient` (gradiente `--color-avenida-blue` → `--color-avenida-violet`).
- `lib/mock-user.ts` (nuevo): `CURRENT_USER` (nombre, iniciales, rol, organización) y `MOCK_UNREAD_NOTIFICATIONS`, documentado explícitamente como placeholder hasta que exista autenticación real (mismo punto pendiente ya señalado en la Fase 3).

Verificado con `tsc --noEmit`, `next build` y una captura Playwright del Home en producción confirmando el resultado visual. El boceto de Tickets Plane se republicó con esta misma estética actualizada antes de construir la pantalla real.

## Fase 6 — Tipificación de tickets Plane: ✅ Completa (2026-09-07)

**Disparador:** con la Fase 5 confirmada funcionando, el usuario pidió seguir con "la próxima fase del portal" — se confirmó con él (vía pregunta directa) que se refería a continuar el roadmap de `claude/spec-sgc-avenida-plus.md`, no a desplegar la app. Según la spec, la fase siguiente era **Fase 6: Tipificación** — la pantalla `/gestion-calidad/tickets-plane` (antes placeholder) tiene que listar los work items de Plane y permitir clasificarlos en un registro del SGC (NC/AC/AP/OM/Q/S/R), vincularlos a uno ya existente, o marcarlos "No aplica al SGC".

**Patrón boceto → construcción (pedido explícito del usuario, sigue vigente para las fases que siguen):** primero se armó un boceto visual estático con la herramienta de diseño de Claude (publicado, luego republicado con la estética de logo/pill nav/header actualizada de la sección anterior), y recién con eso implícitamente aprobado (sin objeciones, y con el pedido explícito de "Programar Tickets Plane de verdad") se pasó al código real.

**Qué se construyó (código real, ya en el proyecto):**

- `lib/db/client.ts` — tabla `plane_ticket_dismissals` (`plane_project_id`, `plane_work_item_id` único, `plane_sequence_id`, `reason`, `created_at`): registra qué tickets se marcaron "no aplica al SGC", sin borrar nada de Plane ni crear ningún registro.
- `lib/db/queries.ts` — tipo `PlaneTicketDismissal` y funciones `getRecordByPlaneWorkItemId`, `getPlaneTicketDismissal`, `listPlaneTicketDismissals`, `dismissPlaneTicket`, `undoPlaneTicketDismissal`, `createRecordFromPlaneTicket` (tipificar → crea un registro SGC nuevo a partir del ticket), `linkRecordToPlaneTicket` (vincular a un registro ya existente) — todas con logging (`addActivityLog`/`addPlaneSyncLog`).
- `lib/plane/tickets.ts` (nuevo) — `listTicketsPlaneRows()`: junta, por cada proyecto de Plane mapeado (reutilizando `plane_project_mappings` de la Fase 4 — no existe todavía un concepto separado de "proyectos de entrada" en el portal, ese concepto solo vive en el sistema independiente de Apps Script/Sheets de la Fase 5), los work items de Plane con su clasificación en el portal (`pending` / `linked` / `dismissed`), cruzando contra `records` y `plane_ticket_dismissals`. Los errores de fetch por proyecto se capturan individualmente y se listan aparte, no interrumpen el resto. **Limitación documentada:** solo trae la primera página de `listWorkItems()` por proyecto (sin paginación todavía).
- `lib/actions/plane-tickets.ts` (nuevo) — 4 Server Actions: `tipificarTicketAction` (valida y crea el registro SGC, redirige al detalle), `vincularTicketAction` (valida y vincula a un registro existente, redirige al detalle), `descartarTicketAction` (marca "no aplica", se queda en el listado), `revertirDescarteAction` (deshace el descarte).
- `components/gestion-calidad/tickets-plane-table.tsx` (nuevo) — tabla client-side con buscador + filtro por proyecto/estado Plane/clasificación SGC (mismo patrón que `registro-table.tsx`), badges de prioridad y estado, y acciones por fila según clasificación (Tipificar / Vincular / No aplica, o Ver registro, o Deshacer).
- `app/gestion-calidad/tickets-plane/page.tsx` (reemplaza el placeholder) — Server Component real: 3 stat cards (pendientes / tipificados / no aplican), estados degradados claros (Plane no configurado, sin proyectos mapeados), tarjeta de errores por proyecto si los hay, y la tabla.
- `app/gestion-calidad/tickets-plane/tipificar/page.tsx` (nuevo) — formulario de tipificación con exactamente el mismo set de campos que `/reportar/nuevo` (tipo, título, descripción, área, proceso, fecha, reportante, impacto, prioridad —precargada desde la prioridad de Plane—, urgente, evidencia, comentarios), con manejo de estados de error (parámetros faltantes, Plane no configurado, error al traer el ticket).
- `app/gestion-calidad/tickets-plane/vincular/page.tsx` (nuevo) — formulario simple (código de registro existente) con el mismo manejo de errores.
- `scripts/generate-placeholders.cjs` — se sumó `/gestion-calidad/tickets-plane` al set `IMPLEMENTED` para que el generador de placeholders no vuelva a pisar la página real.

**Verificado de punta a punta (2026-09-07):** como no hay forma de probar contra el Plane real del usuario (confidencialidad de credenciales), se armó un servidor HTTP local que imita las rutas de Plane usadas por el portal, se mapeó un proyecto de prueba y se corrió el flujo completo con Playwright contra un build de producción (`next build` + `next start`): listado con conteos correctos → Tipificar un ticket pendiente → formulario precargado correctamente → se crea el registro SGC y aparece vinculado en el listado y en el detalle del registro (con su entrada en el historial) → Vincular otro ticket a un registro ya existente → funciona igual → Descartar un ticket ("No aplica") → aparece atenuado en el listado → Deshacer → vuelve a pendiente. Todo el entorno de prueba se limpió al terminar.

**Bugs encontrados y corregidos durante esta verificación (ninguno lo hubiera detectado `tsc`/`lint`/`build` solos):**

1. **Build corrompía el servidor en caliente:** correr `npm run build` mientras un `next start` anterior seguía vivo en el mismo puerto sobrescribía `.next/static` debajo del servidor corriendo, dejando la página sin estilos (CSS por defecto del navegador). Se resolvió matando los procesos `next-server` reales por PID (`ps aux` + `kill -9`) antes de cada rebuild — un `pkill` por patrón de línea de comando no alcanza porque no siempre mata al hijo `next-server` desprendido. **Este criterio se repitió en la Fase 7 también.**
2. **Columna de Acciones envolvía mal los botones:** `flex flex-wrap` dentro de una celda de tabla con layout automático provocaba que los botones saltaran de línea aun habiendo espacio horizontal disponible. Se corrigió a `whitespace-nowrap` en el `<td>` + `flex-nowrap` en el contenedor.

**Limitaciones conocidas, sin resolver (documentadas, no bloqueantes):**

- Un registro SGC solo puede vincularse a **un** ticket de Plane a la vez (`plane_work_item_id` es una columna única, no una lista) — si se vincula un segundo ticket al mismo registro, pisa el vínculo anterior.
- Solo se trae la primera página de tickets por proyecto (`listWorkItems()` sin paginación).
- Se reutilizó el mapeo área↔proyecto de la Fase 4 como fuente de "qué proyectos listar" en vez de un concepto dedicado de "proyectos de entrada".

## Fase 7 — Gestión completa: ✅ Completa (2026-09-07)

**Disparador:** tras cerrar la Fase 6, se preguntó al usuario cómo seguir (mostrar la pantalla en vivo, ajustar algo, o pasar a la Fase 7) y eligió explícitamente avanzar con **"Programar Tickets Plane de verdad"** primero (ver Fase 6) y, en el turno siguiente, confirmó seguir con la Fase 7 ("Dale") sobre el alcance que se le había propuesto: análisis de causa, verificación de eficacia y cierre de AC — el núcleo del ciclo de mejora continua de la spec (sección 23–34).

**Alcance de esta fase (recorte deliberado dentro de "Gestión completa"):** la spec original describe campos específicos por cada uno de los 7 tipos de registro (NC, AC, AP, OM, Q, S, R). Esta fase se concentró en el ciclo **NC → análisis de causa → Acción Correctiva → verificación de eficacia → cierre**, porque es el flujo central que exige la norma y el que estaba explícitamente señalado como pendiente desde la Fase 3. Se construyó además **genérico** (relaciones y evidencias aplican a cualquier tipo, no solo NC/AC) para no tener que rehacerlo cuando se aborden Q/R/S/AP/OM en fases futuras.

**Qué se construyó:**

- **Esquema** (`lib/db/client.ts`): columnas nuevas en `records` (agregadas con `ALTER TABLE ... ADD COLUMN`, mismo patrón idempotente de siempre): `due_date` (vencimiento/compromiso genérico — cierra el pendiente señalado desde la Fase 3), `root_cause_method`, `root_cause_analysis`, `root_cause`, `correction_action`, `correction_responsible`, `correction_date` (corrección inmediata y análisis de causa, pensados sobre todo para NC), `effectiveness_due_date`, `effectiveness_responsible`, `effectiveness_result`, `effectiveness_evidence`, `effective` (verificación de eficacia, pensada sobre todo para AC), `closed_at`. Tablas nuevas: `sgc_relationships` (vínculo genérico y bidireccional entre dos registros — no se modeló como una columna "AC relacionada" en `records` porque un mismo registro puede terminar vinculado a más de uno) y `sgc_evidence` (evidencia adicional tipo texto/link, se puede sumar más de una a lo largo de la gestión, a diferencia del campo único `evidence_note` del reporte original).
- **`lib/db/queries.ts`** — funciones nuevas: `updateRecordAnalysis` (corrección + causa raíz; si el registro seguía en "Recibido" lo mueve a "En análisis" sin pisar un estado más avanzado), `updateRecordEffectiveness` (verificación de eficacia), `updateRecordStatus` (cambio de estado genérico — **para tipo AC, bloquea el pase a un estado de cierre si `effective` no es `true`**, con el mensaje "No se puede cerrar esta Acción Correctiva: falta registrar la verificación de eficacia con resultado 'Eficaz'."), `createRelationship`/`listRelationshipsForRecord`/`linkExistingRecordRelationship` (vínculos genéricos), `createCorrectiveActionForRecord` (crea una AC nueva heredando área/proceso del origen y la vincula automáticamente), `addEvidence`/`listEvidence`, `updateRecordDueDate`, `getRecordById`. Constantes `AC_STATUS_FLOW` (Pendiente → En curso → Implementada → Pendiente de verificación → Eficaz/No eficaz → Cerrada) y `GENERIC_STATUS_FLOW`.
- **`lib/actions/gestion.ts`** (nuevo) — Server Actions: `guardarAnalisisAction`, `crearAccionCorrectivaAction` (redirige al detalle de la AC nueva), `vincularAccionExistenteAction`, `vincularRegistroAction` (vínculo genérico, cualquier tipo), `guardarVerificacionAction`, `cambiarEstadoAction`, `agregarEvidenciaAction`, `actualizarVencimientoAction`.
- **`app/gestion-calidad/registro/[code]/page.tsx`** — reescrita con **tabs** (`?tab=...`, Server Component puro, sin estado de cliente): Resumen (ahora con vencimiento editable), Análisis y corrección (solo NC), Verificación y cierre (solo AC), Evidencias, Relaciones, Historial. Las tabs que no aplican al tipo del registro no se muestran.
- **Componentes nuevos**: `components/gestion-calidad/record-tabs.tsx`, `analisis-tab.tsx` (corrección + causa raíz + lista de AC vinculadas + crear/vincular AC), `verificacion-tab.tsx` (verificación de eficacia + cambio de estado con aviso claro de si ya se puede cerrar o no), `evidencias-tab.tsx`, `relaciones-tab.tsx`.

**⚠️ Bug encontrado y corregido durante la verificación en vivo (no lo hubiera detectado `tsc`/`lint`/`build`):** el bloqueo de cierre de una AC se probó deliberadamente (intentar cerrar sin verificación) y el `throw new Error(...)` terminaba en la página de error genérica de Next.js en producción ("Application error…", sin el mensaje real) — Next.js redacta el mensaje de un error no atrapado en build de producción cuando no hay un `error.tsx` propio (el mismo punto que ya estaba documentado como aceptado para el resto de las acciones del portal, pero acá rompía justo la funcionalidad central de la fase). Se corrigió puntualmente en `cambiarEstadoAction`: atrapa el error de `updateRecordStatus` y hace `redirect()` de vuelta a la misma pantalla con el motivo en la URL (`?estadoError=...`), que la tab de Verificación muestra como una tarjeta de aviso prolija. El resto de las acciones de este archivo (y del resto del portal) siguen con el patrón de siempre (`throw`, sin atrapar) porque son validaciones de borde (campo faltante, código inexistente) — la única que ameritaba la excepción es la que demuestra la regla de negocio central de la fase.

**Verificado de punta a punta con Playwright contra un build de producción (`next build` + `next start`, con la limpieza de proceso por PID de la Fase 6 aplicada antes de cada rebuild):** crear una NC → guardar corrección inmediata + análisis de causa raíz (método "5 Por Qué") → el estado pasa de "Recibido" a "En análisis" → crear una Acción Correctiva desde la NC (hereda área/proceso, queda vinculada automáticamente) → intentar cerrarla sin verificación → **bloqueado con el aviso correcto, sin crash** → completar la verificación de eficacia con resultado "eficaz" → aparece "ya se puede cerrar" → cambiar el estado a "Cerrada" → **funciona** → agregar evidencia adicional a la NC → aparece en la tab de Evidencias y en el Historial → la tab de Relaciones de la NC muestra la AC vinculada (y viceversa desde la AC) → guardar un vencimiento en el Resumen → se persiste y se muestra → el Historial acumula todos los eventos (análisis, AC creada, evidencia, vencimiento). Entorno de prueba limpiado al terminar (`data/agora.db` de prueba borrado, servidor de prueba matado por PID).

`tsc --noEmit`, `npm run lint` y `npm run build` pasan sin errores.

**Limitaciones conocidas, sin resolver (documentadas, no bloqueantes):**

- El alcance quedó centrado en NC/AC; los demás tipos (AP, OM, Q, S, R) usan las tabs genéricas (Resumen, Evidencias, Relaciones, Historial) pero no tienen todavía un flujo de estados ni campos específicos propios (ver spec secciones 23–34 para lo que falta de cada uno).
- El resto de las Server Actions de `lib/actions/gestion.ts` (y del resto del portal, ya documentado desde fases anteriores) siguen sin un `error.tsx` propio — un error de validación ahí sigue mostrando la página de error genérica de Next en producción, no un aviso prolijo. Solo se resolvió puntualmente para el bloqueo de cierre de AC por ser la regla de negocio central de esta fase. Si el usuario quiere una experiencia prolija en todos los formularios del portal, conviene un `error.tsx` (o el mismo patrón de redirect-con-mensaje) aplicado de forma sistemática — no se hizo ahora para no tocar de más fuera del pedido puntual.
- `sgc_relationships` no valida que el vínculo sea semánticamente coherente (por ejemplo, nada impide vincular dos NC entre sí) — es intencional (genérico y simple), pero si el usuario quiere reglas más estrictas por tipo de vínculo, es una decisión a tomar más adelante.

## Transición a Claude Code local (2026-09-07)

El usuario pidió seguir el desarrollo desde su máquina con **Claude Code CLI** en vez de esta sesión de Cowork en la nube (eligió explícitamente "Seguir acá mismo, pero desde ahora usar Claude Code" ante la pregunta de cómo prefería continuar). Como consecuencia:

- El código completo (Fases 1–7, sin `node_modules`/`.next`/`data`/`.git`) se empaquetó y se entregó como `agora-sgc-avenida-plus.zip`, escrito directamente en la carpeta `code` de la máquina del usuario (Windows) vía el puente de dispositivo de Cowork.
- Se sumó a este mismo zip la carpeta `claude/` (estos tres documentos de continuidad) y `apps-script/reference/` (copia literal de `Codigo_final.gs` e `Index_final.html`, ver sección siguiente), para que una sesión nueva de Claude Code en la máquina del usuario tenga el mismo contexto que tenía esta sesión de Cowork, sin depender de que el Project de Claude siga disponible.
- El Project de Claude ("SGC") y esta conversación de Cowork siguen existiendo y pueden seguir usándose como respaldo/consulta, pero a partir de ahora el desarrollo activo del código pasa a la máquina del usuario.

## Referencia: código real del SGC en Apps Script (`apps-script/reference/`)

Este repo incluye, a partir de esta entrega, una copia **literal y de solo lectura** de los dos archivos reales que el usuario subió al Project de Claude:

- `apps-script/reference/Codigo_final.gs` — el backend real de Apps Script (Google Sheets) que usa hoy el área de Calidad. Fuente de verdad del esquema de datos (hojas `documentos`, `no_conformidades`, `log`, `usuarios`, `areas`, `tareas`, `acciones_correctivas`, `recovery`, y las dos definiciones — la real, `r002_manual` — de `sgcGetR002`/`sgcSaveR002`).
- `apps-script/reference/Index_final.html` — el frontend real que consume ese backend vía `google.script.run`.

**Por qué están acá:** sirven como referencia técnica para cualquier trabajo futuro de integración (Plane, o cualquier otro) contra el SGC real de Calidad — así una sesión de Claude Code no tiene que pedirle al usuario que los vuelva a pegar en el chat cada vez. `apps-script/plane-integracion-sgc.gs` (la integración de la Fase 5) ya está escrito contra este esquema exacto.

**Regla que sigue aplicando, sin excepción:** estos dos archivos son el sistema productivo real del usuario. **Nunca se editan desde este repo ni se sugieren cambios "en caliente" sobre ellos sin que el usuario lo pida explícitamente** — cualquier cambio a la integración de Plane (o a cualquier otra cosa) se hace en archivos nuevos y aditivos (como `apps-script/plane-integracion-sgc.gs`), nunca tocando `Codigo_final.gs`/`Index_final.html` directamente. Si en algún momento se detecta que la copia de referencia quedó desactualizada respecto del código real del usuario, hay que pedirle una copia nueva — no asumir ni inventar cambios.

## Próxima fase a implementar

1. Confirmar con el usuario el resultado de la Fase 7 (análisis de causa, Acciones Correctivas, verificación de eficacia, relaciones, evidencias, vencimientos) y ver si hay ajustes antes de seguir con la **Fase 8 — Riesgos** (matriz probabilidad/impacto, controles, valoración residual, oportunidades) según el orden de `claude/spec-sgc-avenida-plus.md`.
2. Probar `apps-script/plane-integracion-sgc.gs` en producción por un tiempo (ya confirmado funcionando, pero sin observar todavía corridas automáticas repetidas de los triggers).
3. Decidir si el portal Ágora (Fase 3/4, base SQLite propia) debe además hablar directo por HTTP con `doGet`/`doPost` de `Codigo_final.gs` para que un reporte cargado en el portal también aparezca en el Apps Script real — hoy son dos integraciones con Plane paralelas e independientes (portal↔Plane por un lado, Apps Script↔Plane por otro) que no se cruzan entre sí todavía.
4. Si el usuario lo pide: sumar a `Index_final.html` la lectura de `plane_tracking` para mostrar el estado del ticket de Plane dentro de "Reg. Gestión AV".
5. Decidir qué hacer con el bug latente `r002` vs `r002_manual` documentado arriba (hoy no rompe nada, es solo una hoja huérfana).
6. Si el usuario lo pide: agregar un `error.tsx` (o generalizar el patrón de redirect-con-mensaje introducido en la Fase 7) para que cualquier validación fallida del portal muestre un aviso prolijo en vez de la página de error genérica de Next.js en producción.
7. Configurar Node ≥ 22.5 y `npm install` en la máquina local del usuario, e iniciar Claude Code CLI en la carpeta del proyecto para continuar el desarrollo desde ahí (ver "Transición a Claude Code local" arriba).
