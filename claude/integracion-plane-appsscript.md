# Integración Plane ↔ Apps Script

> ⚠️ **Corrección (2026-09-06):** este documento se escribió originalmente describiendo lo de abajo como "la implementación existente" del Apps Script real de Avenida+. Eso era incorrecto. Al leer el código real (`Codigo_final.gs`/`Index_final.html`, subidos por el usuario directamente a este Project — copia literal ahora en `apps-script/reference/` de este repo) quedó confirmado que **no existe ni existió ninguna integración con Plane en el Apps Script real** — el usuario lo confirmó explícitamente: *"Tengo que armar lo de plane no lo tengo"*. La fuente original (`Plane.so.md`, adjuntado en otra sesión) era, según todo lo reconstruible, documentación pública de la API de Plane — no la prueba de un sistema propio ya funcionando.
>
> Las secciones 1 a 6 de abajo **se mantienen tal cual** porque siguen siendo válidas como referencia técnica de cómo habla la API pública de Plane (self-hosted, Community Edition) — headers, forma de las URLs, manejo de errores, etc. Se dejan de leer como "así funciona ya" y pasan a leerse como "así hay que construirlo". La sección 7 se reescribió por completo para reflejar la implementación real, construida desde cero contra el esquema verdadero de `Codigo_final.gs` — ver `apps-script/plane-integracion-sgc.gs` en el repo del portal y la sección "Fase 5" de `claude/progreso-implementacion.md`.

**Contexto:** instancia **self-hosted de Plane, Community Edition** (no Plane Cloud). La URL base es la del servidor propio, no `api.plane.so`.

## 1. Autenticación

Tres valores en **Script Properties** (Apps Script → Configuración del proyecto → Propiedades del script), nunca hardcodeados:

```
PLANE_BASE_URL        // ej: https://plane.tuempresa.com
PLANE_WORKSPACE_SLUG   // slug del workspace
PLANE_API_KEY          // API key generada en Plane
```

API key generada en Plane: **Workspace Settings → API Tokens** (en Community Edition self-hosted el token está atado a un usuario/miembro del workspace, no es una app key OAuth). Va en cada request como header `X-API-Key`.

Un helper central (`_configPlane_()` / en la implementación real `agoraPlaneSyncConfig_()`) lee y valida los tres valores y devuelve `null` (o lanza error claro, según el caso de uso) si falta alguno — falla rápido en vez de debuggear un 401 críptico.

## 2. Forma de las URLs (API v1)

Todo cuelga de `{base}/api/v1/workspaces/{workspace_slug}/...`:

| Operación | Método | Path |
|---|---|---|
| Crear work item | POST | `/projects/{project_id}/work-items/` |
| Leer work item | GET | `/projects/{project_id}/work-items/{work_item_id}/` |
| Listar estados del proyecto | GET | `/projects/{project_id}/states/` |
| Info del proyecto (test de conexión) | GET | `/projects/{project_id}/` |
| Labels del proyecto (no implementado aún) | GET | `/projects/{project_id}/labels/` |
| Miembros del workspace (no implementado aún) | GET | `/members/` |
| Listar work items de un proyecto (⚠️ ver sección 7) | GET | `/projects/{project_id}/work-items/` |

Los `project_id` son **UUIDs de Plane**, no nombres. Cada tipo de registro (NC, AC, OM, OBS, AP, QRyS, Otro) mapea a su propio proyecto en Plane — ver sección 7 para por qué es por *tipo* y no por *área*.

Link "humano" al work item (para mails, etc.) — no es endpoint de API, es ruta de front:

```
{base}/{workspace}/projects/{project_id}/issues/{work_item_id}
```

## 3. Crear un work item — payload mínimo

```js
var body = {
  name: '[tipo] título',
  description_html: '<p>...</p>',   // Plane acepta HTML directo, no markdown
  priority: 'urgent' | 'high' | 'medium' | 'low' | 'none'
};

UrlFetchApp.fetch(url, {
  method: 'post',
  contentType: 'application/json',
  headers: { 'X-API-Key': cfg.apiKey },
  payload: JSON.stringify(body),
  muteHttpExceptions: true   // clave: permite leer el body del error en vez de excepción genérica
});
```

Con eso Plane responde `{id, sequence_id, ...}`. Campos más finos (labels, estado inicial, assignees) requieren UUIDs por proyecto — hay que consultarlos antes vía `/labels/` y `/states/`; quedó como stub sin implementar porque depende de la instancia real del cliente.

## 4. Manejo de errores y reintentos

Wrapper único (`_fetchPlane_` / en la implementación real `agoraPlaneSyncFetch_()`) para todo el HTTP:

- **429 / 5xx** → transitorios, reintentar con backoff simple (`sleep(1500ms * intento)`), 2 reintentos.
- **4xx** → no reintentar (credenciales malas, proyecto inexistente, payload mal armado); error inmediato con mensaje traducido según código (401/403 → revisar API key, 404 → revisar base URL/workspace/project_id, 400 → payload rechazado).
- Errores de red (DNS, timeout) → entran al loop de reintento.

```js
if (codigo >= 200 && codigo < 300) return { codigo: codigo, texto: texto };
if (codigo === 429 || codigo >= 500) { /* reintentar */ }
throw new Error(_mensajeErrorPlane_(codigo, texto)); // 4xx: no insistir
```

## 5. Lectura de estado (sync unidireccional)

GET al work item devuelve `state` (UUID). Ese UUID se resuelve contra `/states/` del proyecto para obtener nombre y **grupo** (`completed`, `cancelled`, etc. — eso define "cerrado"). Se cachea el mapa de estados por `project_id` durante una corrida, para no golpear `/states/` por cada work item.

```js
var wi = _obtenerWorkItemPlane_(projectId, workItemId);      // GET work-items/{id}/
var estados = _estadosProyectoPlane_(projectId);             // GET states/ -> {uuid: {nombre, grupo}}
var estado = estados[wi.state];
var terminal = estado.grupo === 'completed' || estado.grupo === 'cancelled';
```

Sync corre en **trigger temporizado** (`ScriptApp.newTrigger(...).timeBased()...`). En la implementación real (sección 7) son tres triggers separados (salida cada 30 min, refresco de estado cada 30 min, entrada cada 1 hora) en vez de uno solo — más simple de razonar que un único trigger con rotación por cursor, y suficiente para el volumen esperado de un SGC interno.

## 6. Diagnóstico

Funciones para correr a mano desde el editor de Apps Script, útiles al integrar por primera vez (nombres reales en la sección 7: `agoraPlaneSyncProbarConexion`, `agoraPlaneSyncProbarListado`, `agoraPlaneSyncInspeccionarWorkItem`, `agoraPlaneSyncVerificarSgcSaveR002`):

- **Probar conexión** — valida credenciales y que cada `project_id` configurado responda.
- **Inspeccionar work item** — trae el JSON crudo de un work item, para ver qué campos realmente devuelve la instancia (ej. si viene `completed_at` o hay que inferir el cierre por polling).

## 7. Implementación real en `Codigo_final.gs` (2026-09-06) — construida desde cero, no una réplica de algo preexistente

Como se aclaró arriba, no había nada que replicar: se construyó `apps-script/plane-integracion-sgc.gs` (en el repo del portal Ágora, para pegar como archivo nuevo en el mismo proyecto de Apps Script del usuario) contra el **esquema real** de `Codigo_final.gs`, confirmado leyendo el código que el usuario subió al Project (y que ahora vive también, en copia literal, en `apps-script/reference/` de este repo):

- Hojas reales relevantes: `no_conformidades`, `acciones_correctivas`, y `r002_manual` (la hoja real detrás de "Reg. Gestión AV" para los tipos OM/OBS/AP/QRyS/Otro — no la hoja `r002` que crea `inicializarHojas()`, que quedó huérfana por un bug de definición duplicada de `sgcGetR002`/`sgcSaveR002` en el archivo real; documentado sin tocarlo en `claude/progreso-implementacion.md`).
- El script nuevo **lee y escribe a través de las funciones reales** (`sgcGetNcs()`, `sgcGetAC()`, `sgcGetR002()`, `sgcSaveR002()`) en vez de tocar las hojas directamente — así no depende de que ningún supuesto mío sobre columnas sea exacto, y sigue funcionando si esas funciones cambian de forma internamente.
- **Arquitectura confirmada por el usuario:** los datos viven en este Apps Script/Sheets real; Plane es la capa de seguimiento ("tenerlo en mi app script y en Plane como seguimiento"). El vínculo registro↔ticket se guarda en una hoja propia nueva (`plane_tracking`), sin agregar columnas a las hojas reales — cero riesgo de romper el layout fijo que esperan las funciones `sgc*`.
- **Mapeo por tipo (NC/AC/OM/OBS/AP/QRyS/Otro), no por área** — decisión tomada porque `acciones_correctivas` y `r002_manual` no tienen columna de área en el esquema real (solo `no_conformidades` tiene `area_detecta`), documentada en la cabecera del script para poder revisarla si el usuario prefiere lo contrario.
- Un ticket cargado directo en Plane nunca se importa como NC/AC directa (esas hojas exigen campos de proceso — causa raíz, reincidencia, evidencia — que Plane no puede completar); entra a `r002_manual` como tipo "Otro" para que Calidad lo revise.

**⚠️ Punto que sigue sin confirmarse contra la instancia real (el mismo desde la Fase 4 del portal, nunca resuelto por falta de acceso a credenciales):** todo lo de las secciones 1 a 6 solo necesita leer un work item *cuyo id ya se conoce* (`GET .../work-items/{work_item_id}/`). *Listar* todos los work items de un proyecto (`GET /projects/{project_id}/work-items/`, sin id, usado solo en la dirección Plane → sistema) sigue siendo un supuesto razonable — patrón REST estándar, mismo estilo de paginación que el resto de la API — pero no verificado. `agoraPlaneSyncProbarListado()` en el script real está pensada específicamente para confirmar esto en un minuto apenas el usuario cargue sus credenciales.

También sin confirmar: si `sgcSaveR002()` devuelve el `id` de la fila creada (lo necesita la dirección de entrada para vincular bien el ticket con el registro nuevo). `agoraPlaneSyncVerificarSgcSaveR002()` lo confirma sin arriesgar datos reales (crea y deja una fila de prueba bien marcada para borrar a mano).

El detalle completo de instalación, qué hace cada trigger, y las limitaciones (por ejemplo: el estado del ticket de Plane hoy no se ve todavía dentro de la pantalla "Reg. Gestión AV" del portal, `Index_final.html` — haría falta tocar ese HTML) está en la cabecera de `apps-script/plane-integracion-sgc.gs` y en la sección "Fase 5" de `claude/progreso-implementacion.md`.

### Relación con la Fase 4 del portal Ágora (`lib/plane/client.ts`)

El portal Ágora (Next.js) tiene su **propia** integración con Plane (`lib/plane/client.ts`, `lib/plane/sync.ts`), construida en la Fase 4 sobre las mismas convenciones (secciones 1 a 6 de este documento), para que un reporte cargado *en el portal* también cree su work item en Plane. Es una integración independiente de la de esta sección 7 — hoy **no se cruzan entre sí**: un reporte cargado en el portal no aparece automáticamente en `Codigo_final.gs`, y viceversa. Si el usuario quiere que ambos mundos queden conectados (portal ↔ Apps Script real, no solo portal ↔ Plane y Apps Script ↔ Plane por separado), es una decisión pendiente — ver "Próxima fase" en `claude/progreso-implementacion.md`.

---
*Fuente original: `Plane.so.md` adjuntado por el usuario (2026-09-05) — documentación pública de la API de Plane, no una implementación propia preexistente (corregido 2026-09-06). Fuente de la implementación real (sección 7): `Codigo_final.gs` / `Index_final.html`, subidos por el usuario a este Project el 2026-09-06 — copia literal en `apps-script/reference/` de este repo.*
