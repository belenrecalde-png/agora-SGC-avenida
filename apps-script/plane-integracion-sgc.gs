/**
 * ============================================================================
 * Ágora — Integración Plane ↔ tu SGC real (Código_final.gs / Index_final.html)
 * ============================================================================
 *
 * VERSIÓN: reescrita desde cero el 2026-09-06 contra el código REAL que subiste
 * (Codigo_final.gs / Index_final.html). El archivo anterior de este mismo
 * repo (`plane-a-registro-gestion.gs`) asumía una hoja plana "Registro de
 * Gestión" que no existe en tu sistema real — quedó reemplazado por este.
 * También quedó confirmado que hoy tu Apps Script NO tiene ninguna
 * integración con Plane: esto es una implementación nueva, no la réplica de
 * algo que ya funcionaba (`claude/integracion-plane-appsscript.md` documenta
 * las convenciones técnicas de la API de Plane en sí, no un sistema tuyo
 * preexistente — esa aclaración también se corrigió en ese documento).
 *
 * ARQUITECTURA (confirmada con vos): los datos viven en tu Apps Script /
 * Sheets real. Plane es la capa de seguimiento ("tracking"): cada
 * no-conformidad, acción correctiva o entrada de "Reg. Gestión AV" genera (o
 * se vincula a) un work item en Plane; y los tickets que alguien cargue
 * directo en Plane aparecen también en tu "Reg. Gestión AV".
 *
 * CÓMO INSTALAR
 * --------------
 * 1. Abrí el mismo proyecto de Apps Script donde está Codigo_final.gs.
 * 2. Archivo → Nuevo → Script. Nombralo "PlaneIntegracion" (o el que quieras).
 * 3. Pegá TODO este archivo ahí tal cual. No modifica ni pisa ninguna función
 *    ni hoja de tu Código real — todo lo de acá está prefijado
 *    `agoraPlaneSync` a propósito, y usa tus funciones reales (sgcGetNcs,
 *    sgcGetAC, sgcGetR002, sgcSaveR002) para leer/escribir datos, en vez de
 *    tocar las hojas directamente.
 * 4. Extensiones → Apps Script → ⚙️ Configuración del proyecto → Propiedades
 *    del script → agregá:
 *       PLANE_BASE_URL        (ej: https://plane.tuempresa.com, sin barra final)
 *       PLANE_WORKSPACE_SLUG
 *       PLANE_API_KEY
 *    Nunca compartas estos valores acá conmigo ni los pegues en este archivo.
 * 5. Bajá hasta la **sección 0** de este mismo archivo ("Mapeo de proyectos
 *    — FIJO EN CÓDIGO") y completá ahí, directo en el código, los dos
 *    mapeos (no son hojas de Sheets — quedó así a pedido, el project_id de
 *    Plane no es secreto):
 *
 *    a) **`AGORA_PLANE_SYNC_MAPEOS_FIJOS_`** — SOLO para SALIDA (tu sistema
 *    → Plane). A qué proyecto mandar cada "tipo" nuevo que se genere en tu
 *    SGC (ver más abajo por qué es por TIPO y no por ÁREA). Ejemplo, todo a
 *    un mismo proyecto:
 *
 *        var AGORA_PLANE_SYNC_MAPEOS_FIJOS_ = {
 *          '*': { projectId: '3f9a1c2e-1234-4a5b-8888-abcdef123456', activo: true }
 *        };
 *
 *    O separado por tipo (borrá la fila '*' si usás esta forma):
 *
 *        var AGORA_PLANE_SYNC_MAPEOS_FIJOS_ = {
 *          'NC': { projectId: '<uuid proyecto NC>', activo: true },
 *          'AC': { projectId: '<uuid proyecto AC>', activo: true }
 *          // ... OM, OBS, AP, QRyS, Otro si querés separarlos también
 *        };
 *
 *    b) **`AGORA_PLANE_SYNC_ENTRADA_FIJA_`** — SOLO para ENTRADA (Plane →
 *    tu sistema). Lista de cualquier proyecto de Plane que YA EXISTA con
 *    tickets propios (por ejemplo, proyectos que ya venías usando en Plane
 *    antes de esta integración, sin relación con ningún "tipo" tuyo) y
 *    querés que aparezcan en tu "Reg. Gestión AV". No tiene el límite de
 *    "un proyecto por tipo" del mapeo anterior — poné tantas filas como
 *    proyectos externos quieras traer:
 *
 *        var AGORA_PLANE_SYNC_ENTRADA_FIJA_ = [
 *          { projectId: '<uuid de Sellers Universe>', tipoDestino: 'Otro', activo: true },
 *          { projectId: '<uuid de Coatí>',            tipoDestino: 'Otro', activo: true }
 *        ];
 *
 *    `tipoDestino` es el tipo con el que esos tickets van a aparecer en tu
 *    "Reg. Gestión AV" (normalmente "Otro", ya que Plane no tiene el
 *    concepto de NC/AC/OM/etc.). Un proyecto que uses solo para que tu
 *    sistema le mande tickets (por ejemplo "Administración", si es tu
 *    proyecto de salida) NO hace falta agregarlo acá — esta lista es
 *    exclusivamente para traer lo que ya existe en otro lado.
 *
 *    Guardá el archivo después de editar (Ctrl+S / Cmd+S).
 * 6. Desde el editor de Apps Script, seleccioná la función
 *    `agoraPlaneSyncInicializar` en el desplegable de arriba y ejecutala una
 *    vez (ícono ▶). Esto crea 2 hojas nuevas en tu planilla —
 *    `plane_tracking` y `plane_logs` (son datos que el script va guardando
 *    solo, no hace falta que cargues nada ahí) — y tres triggers
 *    automáticos. No toca ninguna hoja existente.
 * 7. Ejecutá `agoraPlaneSyncProbarConexion` (desde el editor, o mirá el punto
 *    de diagnóstico más abajo) para confirmar que las credenciales y los
 *    project_id que cargaste en la sección 0 están bien ANTES de dejarlo
 *    correr solo.
 *
 * POR QUÉ EL MAPEO DE SALIDA ES POR "TIPO" Y NO POR "ÁREA"
 * ------------------------------------------------------------
 * En tu Código real, `no_conformidades` sí tiene un área (`area_detecta`),
 * pero `acciones_correctivas` y `r002_manual` NO tienen columna de área en
 * absoluto (se las podría inferir de forma indirecta y frágil — ej. desde la
 * NC vinculada por `nc_ids` — pero no es un dato confiable ni siempre
 * disponible). El "tipo" (NC / AC / OM / OBS / AP / QRyS / Otro), en cambio,
 * está garantizado en las tres fuentes. Por eso el mapeo a proyectos de
 * Plane, para SALIDA, es por tipo. Si más adelante preferís por área, avisame
 * y lo adaptamos (se puede combinar: ej. un proyecto de Plane por área SOLO
 * para las NC, ya que ahí sí hay área confiable). El mapeo de ENTRADA
 * (`AGORA_PLANE_SYNC_ENTRADA_FIJA_`) no tiene este problema porque no
 * depende de "tipo" para identificar el proyecto — es simplemente una lista
 * de proyectos a revisar.
 *
 * QUÉ HACE
 * --------
 * - SALIDA (tu sistema → Plane), función `agoraPlaneSyncSalida`, corre sola
 *   cada 30 min: recorre `no_conformidades`, `acciones_correctivas` y
 *   `r002_manual` (usando tus funciones reales sgcGetNcs/sgcGetAC/sgcGetR002,
 *   nunca leyendo las hojas a mano) buscando registros que todavía no tengan
 *   ticket en Plane (según la hoja `plane_tracking`, ver abajo) y los crea
 *   como work item nuevo.
 * - REFRESCO DE ESTADO, función `agoraPlaneSyncActualizarEstados`, corre
 *   sola cada 30 min: para los tickets ya vinculados, trae el estado actual
 *   desde Plane y lo guarda en `plane_tracking` (columna plane_status).
 * - ENTRADA (Plane → tu sistema), función `agoraPlaneSyncEntrada`, corre
 *   sola cada 1 hora: lista los work items de cada proyecto cargado en
 *   `AGORA_PLANE_SYNC_ENTRADA_FIJA_` (sección 0) y, los que no tengan fila
 *   en `plane_tracking` (o sea, todavía no los conocíamos), los agrega como
 *   fila nueva en `r002_manual` con el `tipoDestino` que hayas puesto para
 *   ese proyecto (normalmente "Otro") para que aparezcan en "Reg. Gestión
 *   AV" sin que Calidad tenga que ir a buscarlos a Plane. Los tickets de
 *   Plane NUNCA se insertan directo como NC ni AC: esas dos hojas tienen
 *   campos obligatorios del proceso real (causa raíz, reincidencia,
 *   evidencia, etc.) que un ticket de Plane no puede completar de forma
 *   confiable — van a "Reg. Gestión AV" para que Calidad los revise y, si
 *   corresponde, recién ahí abra una NC/AC formal a mano.
 * - NO modifica ninguna función ni hoja de tu Código real. Es 100% aditivo:
 *   agrega 2 hojas nuevas (`plane_tracking`, `plane_logs` — datos que el
 *   script va llenando solo) y nada más. El mapeo de proyectos vive en el
 *   propio código (sección 0), no en hojas. La vinculación registro↔ticket
 *   vive en `plane_tracking`, no como columnas nuevas en tus hojas reales —
 *   así cero riesgo de romper `sgcGetNcs`/`sgcSaveNc`/etc., que esperan un
 *   layout de columnas fijo.
 *
 * LIMITACIÓN A TENER EN CUENTA: como el estado de Plane vive en una hoja
 * aparte (`plane_tracking`) y no en columnas nuevas de `no_conformidades` /
 * `acciones_correctivas` / `r002_manual`, hoy NO se ve el estado del ticket
 * de Plane dentro de la pantalla "Reg. Gestión AV" del portal (Index_final.html)
 * — para eso habría que tocar `buildR002Rows()` en el frontend y sumar una
 * llamada a una función nueva que lea `plane_tracking`. Es un paso aparte,
 * no incluido acá para no tener que modificar tu HTML real sin poder
 * probarlo contra tu instancia. Si lo querés, lo armamos como siguiente paso.
 *
 * LO QUE NO ESTÁ VERIFICADO CONTRA UNA INSTANCIA REAL DE PLANE
 * ----------------------------------------------------------------
 * Esta sesión nunca tuvo (ni pidió) acceso a tus credenciales reales de
 * Plane, por lo que hay UN supuesto sin confirmar, igual que en la versión
 * anterior de este archivo:
 *
 *   ⚠️ SUPUESTO — Endpoint para listar TODOS los work items de un proyecto:
 *   `GET /projects/{project_id}/work-items/` (sin id), devolviendo algo con
 *   forma `{ results: [...], next_cursor: ... }`. Es un patrón REST estándar
 *   y consistente con el resto de la API de Plane, pero no confirmado.
 *   Sólo lo usa la dirección ENTRADA (Plane → sistema). Correr
 *   `agoraPlaneSyncProbarListado()` a mano (ver diagnóstico) antes de confiar
 *   en el trigger de entrada; si el endpoint no existe o responde distinto,
 *   ese es el único lugar de este archivo que habría que ajustar.
 *
 *   También sin confirmar (menor): que `sgcSaveR002` devuelva el objeto
 *   creado con su `id`. Si no lo devuelve, `agoraPlaneSyncEntrada` igual
 *   guarda el vínculo en `plane_tracking`, pero con un id generado acá que
 *   podría no coincidir con el id real de la fila en `r002_manual`. Correr
 *   `agoraPlaneSyncVerificarSgcSaveR002()` (ver diagnóstico) para confirmarlo
 *   en un minuto.
 *
 *   YA CONFIRMADO (2026-09-06, contra la instancia real): `sgcSaveR002`
 *   espera su parámetro como TEXTO JSON, no como objeto — hace `JSON.parse`
 *   adentro. Pasarle un objeto directo tira `SyntaxError: "[object Object]"
 *   is not valid JSON` (JavaScript convierte el objeto a ese texto literal
 *   antes de intentar parsearlo). Por eso todas las llamadas de este archivo
 *   pasan por `agoraPlaneSyncLlamarSgcSaveR002_()`, que hace
 *   `JSON.stringify()` antes de llamarla y `JSON.parse()` de vuelta si la
 *   respuesta viene como texto.
 *
 * SINCRONIZACIÓN INSTANTÁNEA (OPCIONAL)
 * ----------------------------------------
 * Por defecto todo corre por trigger automático (cada 30 min / 1 hora), así
 * que un registro nuevo tarda hasta 30 minutos en aparecer en Plane. Si
 * preferís que sea instantáneo, podés agregar UNA línea al final de tus
 * funciones reales `sgcSaveNc`, `sgcSaveAC` y `sgcSaveR002` (en Codigo_final.gs):
 *
 *     agoraPlaneSyncUno('NC', nuevoId);      // al final de sgcSaveNc
 *     agoraPlaneSyncUno('AC', nuevoId);      // al final de sgcSaveAC
 *     agoraPlaneSyncUno(datos.tipo, nuevoId); // al final de sgcSaveR002
 *
 * Es totalmente opcional — sin tocar nada de tu Código real, el trigger
 * automático igual los toma.
 */

// ────────────────────────────────────────────────────────────────────────
// 0. Mapeo de proyectos — FIJO EN CÓDIGO (a pedido, en vez de hojas de Sheets)
// ────────────────────────────────────────────────────────────────────────
//
// Esto reemplaza a las hojas "plane_mapeos" / "plane_entrada_proyectos" de
// la versión anterior. El `project_id` de Plane NO es secreto (es un UUID
// interno, no una credencial), así que no hay problema en tenerlo acá en
// vez de en una hoja — lo único que sigue yendo SIEMPRE en Script
// Properties, nunca acá, es PLANE_API_KEY (ver sección 1).
//
// SALIDA (tu sistema → Plane): a qué proyecto mandar cada "tipo" nuevo.
// Clave = tipo (NC, AC, OM, OBS, AP, QRyS, Otro), o "*" como comodín para
// cualquier tipo sin fila propia. Con una sola fila "*" alcanza si querés
// que todo vaya al mismo proyecto (ej. "Administración").
var AGORA_PLANE_SYNC_MAPEOS_FIJOS_ = {
  '*': { projectId: '', activo: true }
  // 'NC':   { projectId: '<uuid del proyecto para NC>', activo: true },
  // 'AC':   { projectId: '<uuid del proyecto para AC>', activo: true },
};

// ENTRADA (Plane → tu sistema): proyectos que YA EXISTEN con tickets propios
// y querés traer a "Reg. Gestión AV". No depende de "tipo" — listá acá
// tantos proyectos externos como quieras.
var AGORA_PLANE_SYNC_ENTRADA_FIJA_ = [
  // { projectId: '<uuid de Sellers Universe>', tipoDestino: 'Otro', activo: true },
  // { projectId: '<uuid de Coatí>',            tipoDestino: 'Otro', activo: true }
];

// ────────────────────────────────────────────────────────────────────────
// 1. Configuración (Script Properties — nunca hardcodear valores acá)
// ────────────────────────────────────────────────────────────────────────

function agoraPlaneSyncConfig_() {
  var props = PropertiesService.getScriptProperties();
  var base = props.getProperty('PLANE_BASE_URL');
  var slug = props.getProperty('PLANE_WORKSPACE_SLUG');
  var key = props.getProperty('PLANE_API_KEY');
  if (!base || !slug || !key) return null;
  return { base: base.replace(/\/+$/, ''), slug: slug, key: key };
}

function agoraPlaneSyncConfigOFail_() {
  var cfg = agoraPlaneSyncConfig_();
  if (!cfg) {
    throw new Error('Faltan PLANE_BASE_URL / PLANE_WORKSPACE_SLUG / PLANE_API_KEY en Propiedades del script (Extensiones → Apps Script → Configuración del proyecto).');
  }
  return cfg;
}

// ────────────────────────────────────────────────────────────────────────
// 2. HTTP a la API de Plane (self-hosted, Community Edition): reintentos y
//    manejo de errores igual que en claude/integracion-plane-appsscript.md
// ────────────────────────────────────────────────────────────────────────

function agoraPlaneSyncFetch_(cfg, path, method, body) {
  var url = cfg.base + '/api/v1/workspaces/' + cfg.slug + path;
  var options = {
    method: method || 'get',
    headers: { 'X-API-Key': cfg.key },
    muteHttpExceptions: true
  };
  if (body) {
    options.contentType = 'application/json';
    options.payload = JSON.stringify(body);
  }
  var intentos = 0;
  while (true) {
    intentos++;
    var resp;
    try {
      resp = UrlFetchApp.fetch(url, options);
    } catch (e) {
      if (intentos <= 3) { Utilities.sleep(1500 * intentos); continue; }
      throw new Error('Error de red llamando a Plane (' + path + '): ' + e.message);
    }
    var codigo = resp.getResponseCode();
    var texto = resp.getContentText();
    if (codigo >= 200 && codigo < 300) {
      return texto ? JSON.parse(texto) : null;
    }
    if ((codigo === 429 || codigo >= 500) && intentos <= 3) {
      Utilities.sleep(1500 * intentos);
      continue;
    }
    throw new Error(agoraPlaneSyncMensajeError_(codigo, texto));
  }
}

function agoraPlaneSyncMensajeError_(codigo, texto) {
  if (codigo === 401 || codigo === 403) return 'Plane rechazó la API key (código ' + codigo + '). Revisá PLANE_API_KEY.';
  if (codigo === 404) return 'Plane no encontró el recurso (código 404). Revisá PLANE_BASE_URL, PLANE_WORKSPACE_SLUG o el project_id en AGORA_PLANE_SYNC_MAPEOS_FIJOS_ / AGORA_PLANE_SYNC_ENTRADA_FIJA_.';
  if (codigo === 400) return 'Plane rechazó el payload (código 400): ' + texto;
  return 'Plane respondió código ' + codigo + ': ' + texto;
}

function agoraPlaneSyncCrearWorkItem_(cfg, projectId, datos) {
  return agoraPlaneSyncFetch_(cfg, '/projects/' + projectId + '/work-items/', 'post', datos);
}

function agoraPlaneSyncObtenerWorkItem_(cfg, projectId, workItemId) {
  return agoraPlaneSyncFetch_(cfg, '/projects/' + projectId + '/work-items/' + workItemId + '/', 'get');
}

function agoraPlaneSyncListarWorkItems_(cfg, projectId, cursor) {
  // ⚠️ SUPUESTO no verificado — ver cabecera del archivo.
  var path = '/projects/' + projectId + '/work-items/' + (cursor ? ('?cursor=' + encodeURIComponent(cursor)) : '');
  return agoraPlaneSyncFetch_(cfg, path, 'get');
}

var agoraPlaneSyncEstadosCache_ = {};
function agoraPlaneSyncEstadosProyecto_(cfg, projectId) {
  if (agoraPlaneSyncEstadosCache_[projectId]) return agoraPlaneSyncEstadosCache_[projectId];
  var lista = agoraPlaneSyncFetch_(cfg, '/projects/' + projectId + '/states/', 'get');
  var mapa = {};
  ((lista && (lista.results || lista)) || []).forEach(function (e) {
    mapa[e.id] = { nombre: e.name, grupo: e.group };
  });
  agoraPlaneSyncEstadosCache_[projectId] = mapa;
  return mapa;
}

function agoraPlaneSyncUrlWorkItem_(cfg, projectId, workItemId) {
  return cfg.base + '/' + cfg.slug + '/projects/' + projectId + '/issues/' + workItemId;
}

// ────────────────────────────────────────────────────────────────────────
// 3. Hojas propias — solo las de datos dinámicos (tracking y logs). El
//    mapeo de proyectos ya NO vive en hojas, ver sección 0.
// ────────────────────────────────────────────────────────────────────────

var AGORA_PLANE_SYNC_COLS_TRACKING_ = ['id', 'tipo', 'registro_id', 'plane_project_id', 'plane_work_item_id', 'plane_sequence_id', 'plane_status', 'plane_url', 'plane_synced_at', 'ultimo_error'];
var AGORA_PLANE_SYNC_COLS_LOGS_ = ['id', 'fecha', 'direccion', 'tipo', 'registro_id', 'resultado', 'detalle'];

function agoraPlaneSyncHoja_(nombre, columnas) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(nombre);
  if (!hoja) {
    hoja = ss.insertSheet(nombre);
    hoja.appendRow(columnas);
    hoja.setFrozenRows(1);
  }
  return hoja;
}

function agoraPlaneSyncInicializar() {
  agoraPlaneSyncHoja_('plane_tracking', AGORA_PLANE_SYNC_COLS_TRACKING_);
  agoraPlaneSyncHoja_('plane_logs', AGORA_PLANE_SYNC_COLS_LOGS_);
  agoraPlaneSyncConfigurarTriggers_();
  var msg = 'Listo. Completá AGORA_PLANE_SYNC_MAPEOS_FIJOS_ y AGORA_PLANE_SYNC_ENTRADA_FIJA_ arriba del archivo (sección 0) con tus project_id reales, guardá, y corré agoraPlaneSyncProbarConexion().';
  Logger.log(msg);
  return msg;
}

function agoraPlaneSyncConfigurarTriggers_() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    var fn = t.getHandlerFunction();
    if (fn === 'agoraPlaneSyncSalida' || fn === 'agoraPlaneSyncEntrada' || fn === 'agoraPlaneSyncActualizarEstados') {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger('agoraPlaneSyncSalida').timeBased().everyMinutes(30).create();
  ScriptApp.newTrigger('agoraPlaneSyncActualizarEstados').timeBased().everyMinutes(30).create();
  ScriptApp.newTrigger('agoraPlaneSyncEntrada').timeBased().everyHours(1).create();
}

// ── Mapeo tipo → proyecto de Plane (lee la constante fija de la sección 0) ──

function agoraPlaneSyncMapeos_() {
  var mapa = {};
  Object.keys(AGORA_PLANE_SYNC_MAPEOS_FIJOS_).forEach(function (tipo) {
    var m = AGORA_PLANE_SYNC_MAPEOS_FIJOS_[tipo];
    mapa[tipo] = { projectId: String(m.projectId || '').trim(), activo: !!m.activo };
  });
  return mapa;
}

function agoraPlaneSyncProjectIdPara_(tipo) {
  var mapa = agoraPlaneSyncMapeos_();
  if (mapa[tipo] && mapa[tipo].activo && mapa[tipo].projectId) return mapa[tipo].projectId;
  if (mapa['*'] && mapa['*'].activo && mapa['*'].projectId) return mapa['*'].projectId;
  return null;
}

// ── Proyectos externos a traer (solo entrada, independiente de "tipo") —
//    lee la constante fija de la sección 0 ──

function agoraPlaneSyncProyectosEntrada_() {
  return AGORA_PLANE_SYNC_ENTRADA_FIJA_
    .filter(function (p) { return p && p.activo && p.projectId; })
    .map(function (p) {
      var tipoDestino = String(p.tipoDestino || '').trim() || 'Otro';
      if (tipoDestino === 'NC' || tipoDestino === 'AC') tipoDestino = 'Otro'; // ver nota en la cabecera
      return { projectId: String(p.projectId).trim(), tipoDestino: tipoDestino };
    });
}

// ── Vínculo registro ↔ ticket de Plane ──

function agoraPlaneSyncTrackingExistente_(tipo, registroId) {
  var hoja = agoraPlaneSyncHoja_('plane_tracking', AGORA_PLANE_SYNC_COLS_TRACKING_);
  var datos = hoja.getDataRange().getValues();
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][1]) === String(tipo) && String(datos[i][2]) === String(registroId)) {
      return { fila: i + 1, valores: datos[i] };
    }
  }
  return null;
}

function agoraPlaneSyncTrackingPorWorkItem_(workItemId) {
  var hoja = agoraPlaneSyncHoja_('plane_tracking', AGORA_PLANE_SYNC_COLS_TRACKING_);
  var datos = hoja.getDataRange().getValues();
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][4]) === String(workItemId)) return datos[i];
  }
  return null;
}

function agoraPlaneSyncTrackingGuardar_(obj) {
  var hoja = agoraPlaneSyncHoja_('plane_tracking', AGORA_PLANE_SYNC_COLS_TRACKING_);
  hoja.appendRow([
    obj.id, obj.tipo, obj.registro_id, obj.plane_project_id, obj.plane_work_item_id,
    obj.plane_sequence_id || '', obj.plane_status || '', obj.plane_url || '',
    obj.plane_synced_at || new Date(), obj.ultimo_error || ''
  ]);
}

function agoraPlaneSyncTrackingActualizarEstado_(fila, status, urlItem, error) {
  var hoja = agoraPlaneSyncHoja_('plane_tracking', AGORA_PLANE_SYNC_COLS_TRACKING_);
  hoja.getRange(fila, 7).setValue(status || '');
  if (urlItem) hoja.getRange(fila, 8).setValue(urlItem);
  hoja.getRange(fila, 9).setValue(new Date());
  hoja.getRange(fila, 10).setValue(error || '');
}

// ── Log de sincronización ──

function agoraPlaneSyncLog_(direccion, tipo, registroId, resultado, detalle) {
  var hoja = agoraPlaneSyncHoja_('plane_logs', AGORA_PLANE_SYNC_COLS_LOGS_);
  hoja.appendRow([Utilities.getUuid(), new Date(), direccion, tipo, registroId, resultado, detalle || '']);
}

// ────────────────────────────────────────────────────────────────────────
// 4. Contenido del work item según el tipo de registro real
// ────────────────────────────────────────────────────────────────────────

function agoraPlaneSyncEsc_(s) {
  return (s === undefined || s === null ? '' : s.toString())
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function agoraPlaneSyncContenido_(tipo, registro) {
  var esc = agoraPlaneSyncEsc_;
  if (tipo === 'NC') {
    return {
      name: '[NC] ' + (registro.descripcion || '').toString().slice(0, 200),
      description_html:
        '<p><b>Responsable:</b> ' + esc(registro.responsable) + '</p>' +
        '<p><b>Área que detecta:</b> ' + esc(registro.area_detecta) + ' — <b>Detectada por:</b> ' + esc(registro.detectada_por) + '</p>' +
        '<p><b>Origen:</b> ' + esc(registro.origen) + (registro.reclamo ? ' (reclamo)' : '') + '</p>' +
        '<p><b>Requisito incumplido:</b> ' + esc(registro.requisito) + '</p>' +
        '<p><b>Causa raíz:</b> ' + esc(registro.causa_raiz) + '</p>' +
        '<p><b>Acción:</b> ' + esc(registro.accion) + '</p>',
      priority: (registro.reincidente === true || String(registro.reincidente) === 'true') ? 'high' : 'medium'
    };
  }
  if (tipo === 'AC') {
    return {
      name: '[AC] ' + (registro.titulo || registro.descripcion || '').toString().slice(0, 200),
      description_html:
        '<p><b>Descripción:</b> ' + esc(registro.descripcion) + '</p>' +
        '<p><b>Responsable:</b> ' + esc(registro.responsable) + '</p>' +
        '<p><b>NC relacionadas:</b> ' + esc(registro.nc_ids) + '</p>' +
        '<p><b>Fecha compromiso:</b> ' + esc(registro.fecha_compromiso) + '</p>',
      priority: 'medium'
    };
  }
  // OM / OBS / AP / QRyS / Otro → filas de r002_manual
  return {
    name: '[' + tipo + '] ' + (registro.descripcion || '').toString().slice(0, 200),
    description_html:
      '<p><b>Procedencia:</b> ' + esc(registro.procedencia) + '</p>' +
      '<p><b>Responsable:</b> ' + esc(registro.responsable) + '</p>' +
      '<p><b>Acción inmediata:</b> ' + esc(registro.accion_inmediata) + '</p>' +
      '<p><b>Causas:</b> ' + esc(registro.causas) + '</p>' +
      '<p><b>Seguimiento:</b> ' + esc(registro.seguimiento) + '</p>',
    priority: 'medium'
  };
}

// ────────────────────────────────────────────────────────────────────────
// 5. Salida: tu sistema → Plane
// ────────────────────────────────────────────────────────────────────────

function agoraPlaneSyncProcesarUno_(cfg, tipo, registro) {
  var registroId = registro.id;
  if (!registroId) return false;
  if (agoraPlaneSyncTrackingExistente_(tipo, registroId)) return false;

  var projectId = agoraPlaneSyncProjectIdPara_(tipo);
  if (!projectId) {
    agoraPlaneSyncLog_('salida', tipo, registroId, 'saltado', 'No hay mapeo Plane activo para tipo "' + tipo + '" (cargalo en AGORA_PLANE_SYNC_MAPEOS_FIJOS_)');
    return false;
  }
  try {
    var contenido = agoraPlaneSyncContenido_(tipo, registro);
    var resp = agoraPlaneSyncCrearWorkItem_(cfg, projectId, contenido);
    agoraPlaneSyncTrackingGuardar_({
      id: Utilities.getUuid(), tipo: tipo, registro_id: registroId, plane_project_id: projectId,
      plane_work_item_id: resp.id, plane_sequence_id: resp.sequence_id,
      plane_status: '(nuevo)', plane_url: agoraPlaneSyncUrlWorkItem_(cfg, projectId, resp.id),
      plane_synced_at: new Date(), ultimo_error: ''
    });
    agoraPlaneSyncLog_('salida', tipo, registroId, 'ok', 'Creado work item #' + resp.sequence_id);
    return true;
  } catch (e) {
    agoraPlaneSyncLog_('salida', tipo, registroId, 'error', e.message);
    return false;
  }
}

function agoraPlaneSyncSalida() {
  var cfg = agoraPlaneSyncConfig_();
  if (!cfg) {
    agoraPlaneSyncLog_('salida', '-', '-', 'saltado', 'Plane no configurado (faltan Script Properties)');
    return;
  }

  var items = [];
  try { (sgcGetNcs() || []).forEach(function (r) { items.push({ tipo: 'NC', registro: r }); }); }
  catch (e) { agoraPlaneSyncLog_('salida', 'NC', '-', 'error', 'No se pudo leer no_conformidades vía sgcGetNcs(): ' + e.message); }

  try { (sgcGetAC() || []).forEach(function (r) { items.push({ tipo: 'AC', registro: r }); }); }
  catch (e) { agoraPlaneSyncLog_('salida', 'AC', '-', 'error', 'No se pudo leer acciones_correctivas vía sgcGetAC(): ' + e.message); }

  try { (sgcGetR002() || []).forEach(function (r) { items.push({ tipo: (r.tipo || 'Otro'), registro: r }); }); }
  catch (e) { agoraPlaneSyncLog_('salida', 'R002', '-', 'error', 'No se pudo leer r002_manual vía sgcGetR002(): ' + e.message); }

  var inicio = new Date().getTime();
  var procesados = 0;
  for (var i = 0; i < items.length; i++) {
    if (new Date().getTime() - inicio > 5 * 60 * 1000) {
      agoraPlaneSyncLog_('salida', '-', '-', 'info', 'Corte por tiempo de ejecución; los pendientes se toman en la próxima corrida.');
      break;
    }
    if (agoraPlaneSyncProcesarUno_(cfg, items[i].tipo, items[i].registro)) procesados++;
  }
  Logger.log('agoraPlaneSyncSalida: ' + procesados + ' ticket(s) nuevo(s) creado(s) en Plane.');
}

// Sincronización instantánea opcional — ver "SINCRONIZACIÓN INSTANTÁNEA" en la
// cabecera del archivo para cómo llamarla desde tu Código real.
function agoraPlaneSyncUno(tipo, registroId) {
  var cfg = agoraPlaneSyncConfig_();
  if (!cfg) return;
  var registro = null;
  try {
    if (tipo === 'NC') registro = (sgcGetNcs() || []).filter(function (r) { return String(r.id) === String(registroId); })[0];
    else if (tipo === 'AC') registro = (sgcGetAC() || []).filter(function (r) { return String(r.id) === String(registroId); })[0];
    else registro = (sgcGetR002() || []).filter(function (r) { return String(r.id) === String(registroId); })[0];
  } catch (e) {
    agoraPlaneSyncLog_('salida', tipo, registroId, 'error', 'No se pudo releer el registro: ' + e.message);
    return;
  }
  if (!registro) {
    agoraPlaneSyncLog_('salida', tipo, registroId, 'error', 'No se encontró el registro recién guardado (revisar id).');
    return;
  }
  agoraPlaneSyncProcesarUno_(cfg, tipo, registro);
}

// ────────────────────────────────────────────────────────────────────────
// 6. Refresco de estado de tickets ya vinculados
// ────────────────────────────────────────────────────────────────────────

function agoraPlaneSyncActualizarEstados() {
  var cfg = agoraPlaneSyncConfig_();
  if (!cfg) return;
  var hoja = agoraPlaneSyncHoja_('plane_tracking', AGORA_PLANE_SYNC_COLS_TRACKING_);
  var datos = hoja.getDataRange().getValues();
  for (var i = 1; i < datos.length; i++) {
    var fila = datos[i];
    var projectId = fila[3], workItemId = fila[4];
    if (!projectId || !workItemId) continue;
    try {
      var wi = agoraPlaneSyncObtenerWorkItem_(cfg, projectId, workItemId);
      var estados = agoraPlaneSyncEstadosProyecto_(cfg, projectId);
      var estado = estados[wi.state];
      var nombreEstado = estado ? estado.nombre : wi.state;
      agoraPlaneSyncTrackingActualizarEstado_(i + 1, nombreEstado, fila[7], '');
    } catch (e) {
      agoraPlaneSyncTrackingActualizarEstado_(i + 1, fila[6], fila[7], e.message);
    }
  }
}

// ────────────────────────────────────────────────────────────────────────
// 7. Entrada: Plane → tu sistema (tickets cargados directo en Plane)
// ────────────────────────────────────────────────────────────────────────

/**
 * `sgcSaveR002` en tu Código real espera el payload como TEXTO JSON, no como
 * objeto — hace `JSON.parse(...)` adentro (confirmado por el error
 * `SyntaxError: "[object Object]" is not valid JSON` al pasarle un objeto
 * directo). Este helper convierte a texto antes de llamarla, y si la
 * respuesta viene también como texto JSON, la vuelve a convertir a objeto.
 */
function agoraPlaneSyncLlamarSgcSaveR002_(datos) {
  var resultado = sgcSaveR002(JSON.stringify(datos));
  if (typeof resultado === 'string') {
    try { return JSON.parse(resultado); } catch (e) { return resultado; }
  }
  return resultado;
}

function agoraPlaneSyncEntrada() {
  var cfg = agoraPlaneSyncConfig_();
  if (!cfg) {
    agoraPlaneSyncLog_('entrada', '-', '-', 'saltado', 'Plane no configurado');
    return;
  }
  var proyectos = agoraPlaneSyncProyectosEntrada_();
  if (!proyectos.length) {
    agoraPlaneSyncLog_('entrada', '-', '-', 'info', 'No hay proyectos cargados en AGORA_PLANE_SYNC_ENTRADA_FIJA_ (sección 0).');
    return;
  }

  proyectos.forEach(function (p) {
    try {
      var cursor = null;
      var vistos = 0;
      do {
        var pagina = agoraPlaneSyncListarWorkItems_(cfg, p.projectId, cursor);
        var resultados = (pagina && (pagina.results || pagina)) || [];
        for (var i = 0; i < resultados.length; i++) {
          var wi = resultados[i];
          if (!wi || !wi.id) continue;
          if (agoraPlaneSyncTrackingPorWorkItem_(wi.id)) continue; // ya lo conocemos

          var nuevo = {
            tipo: p.tipoDestino,
            fecha: new Date(),
            descripcion: wi.name || '(sin título en Plane)',
            responsable: '',
            procedencia: 'Plane',
            estado: 'Abierto',
            eficaz: '',
            accion_inmediata: '',
            causas: '',
            seguimiento: 'Creado directamente en Plane (ticket #' + wi.sequence_id + ')',
            lograda: '',
            fecha_rev: '',
            fecha_baja: ''
          };
          var creado = null;
          try { creado = agoraPlaneSyncLlamarSgcSaveR002_(nuevo); } catch (eGuardar) {
            agoraPlaneSyncLog_('entrada', p.tipoDestino, '-', 'error', 'sgcSaveR002 falló para ticket #' + wi.sequence_id + ': ' + eGuardar.message);
            continue;
          }
          // ⚠️ Ver "sgcSaveR002()" en la cabecera: si no devuelve el id creado,
          // este id es un valor generado acá, no necesariamente el real de la fila.
          var registroId = (creado && creado.id) ? creado.id : Utilities.getUuid();

          agoraPlaneSyncTrackingGuardar_({
            id: Utilities.getUuid(), tipo: p.tipoDestino, registro_id: registroId, plane_project_id: p.projectId,
            plane_work_item_id: wi.id, plane_sequence_id: wi.sequence_id, plane_status: '(nuevo)',
            plane_url: agoraPlaneSyncUrlWorkItem_(cfg, p.projectId, wi.id), plane_synced_at: new Date(), ultimo_error: ''
          });
          agoraPlaneSyncLog_('entrada', p.tipoDestino, registroId, 'ok', 'Importado desde Plane, ticket #' + wi.sequence_id);
          vistos++;
        }
        cursor = pagina && pagina.next_cursor;
      } while (cursor && vistos < 200);
    } catch (e) {
      agoraPlaneSyncLog_('entrada', p.tipoDestino, '-', 'error', 'Proyecto ' + p.projectId + ': ' + e.message);
    }
  });
}

// ────────────────────────────────────────────────────────────────────────
// 8. Diagnóstico — correr a mano desde el editor antes de confiar en los
//    triggers automáticos
// ────────────────────────────────────────────────────────────────────────

function agoraPlaneSyncProbarConexion() {
  var cfg = agoraPlaneSyncConfigOFail_();
  var ok = [], fallos = [];

  var mapa = agoraPlaneSyncMapeos_();
  Object.keys(mapa).forEach(function (tipo) {
    var m = mapa[tipo];
    if (!m.projectId) return;
    try {
      var info = agoraPlaneSyncFetch_(cfg, '/projects/' + m.projectId + '/', 'get');
      ok.push('[salida] ' + tipo + ' → ' + m.projectId + ' (' + (info && info.name ? info.name : 'responde OK') + ')');
    } catch (e) {
      fallos.push('[salida] ' + tipo + ' → ' + m.projectId + ': ' + e.message);
    }
  });

  agoraPlaneSyncProyectosEntrada_().forEach(function (p) {
    try {
      var info = agoraPlaneSyncFetch_(cfg, '/projects/' + p.projectId + '/', 'get');
      ok.push('[entrada] ' + p.projectId + ' (' + (info && info.name ? info.name : 'responde OK') + ') → tipo_destino ' + p.tipoDestino);
    } catch (e) {
      fallos.push('[entrada] ' + p.projectId + ': ' + e.message);
    }
  });

  var msg = 'OK (' + ok.length + '):\n' + ok.join('\n') + '\n\nFallos (' + fallos.length + '):\n' + fallos.join('\n');
  Logger.log(msg);
  return msg;
}

function agoraPlaneSyncProbarListado() {
  // Confirma si existe el endpoint "listar work items de un proyecto" tal
  // como se supone en este archivo (ver punto 7 de la cabecera). Corré esto
  // a mano UNA vez antes de confiar en agoraPlaneSyncEntrada / el trigger
  // automático de entrada. Prueba contra el primer proyecto cargado en
  // AGORA_PLANE_SYNC_ENTRADA_FIJA_ (es la única dirección que usa este endpoint).
  var cfg = agoraPlaneSyncConfigOFail_();
  var proyectos = agoraPlaneSyncProyectosEntrada_();
  if (!proyectos.length) throw new Error('Cargá al menos una fila en AGORA_PLANE_SYNC_ENTRADA_FIJA_ (sección 0) primero.');
  var resp = agoraPlaneSyncListarWorkItems_(cfg, proyectos[0].projectId, null);
  var texto = JSON.stringify(resp);
  Logger.log(texto.length > 2000 ? texto.slice(0, 2000) + '…' : texto);
  return resp;
}

function agoraPlaneSyncInspeccionarWorkItem(projectId, workItemId) {
  var cfg = agoraPlaneSyncConfigOFail_();
  var wi = agoraPlaneSyncObtenerWorkItem_(cfg, projectId, workItemId);
  Logger.log(JSON.stringify(wi));
  return wi;
}

function agoraPlaneSyncVerificarSgcSaveR002() {
  // Confirma si sgcSaveR002 devuelve el objeto/id creado (lo usa
  // agoraPlaneSyncEntrada). No borra nada de tu hoja real, sólo crea una
  // fila de prueba bien marcada — borrala a mano después de mirar el log.
  var prueba = {
    tipo: 'Otro', fecha: new Date(),
    descripcion: '[PRUEBA agoraPlaneSyncVerificarSgcSaveR002 — borrar esta fila]',
    responsable: '', procedencia: 'Prueba', estado: 'Abierto', eficaz: '',
    accion_inmediata: '', causas: '', seguimiento: '', lograda: '', fecha_rev: '', fecha_baja: ''
  };
  var resultado = agoraPlaneSyncLlamarSgcSaveR002_(prueba);
  var msg = 'sgcSaveR002 devolvió: ' + JSON.stringify(resultado) +
    (resultado && resultado.id ? '\n\n✅ Devuelve id, agoraPlaneSyncEntrada puede confiar en él.' :
      '\n\n⚠️ No devuelve un id reconocible — revisar sgcSaveR002 en Codigo_final.gs o buscar el id recién creado a mano en r002_manual.');
  Logger.log(msg);
  return msg;
}
