// ⚠️ ARCHIVO DE REFERENCIA — SOLO LECTURA. NO ES PARTE DEL BUILD DE NEXT.JS.
//
// Esta es una copia LITERAL del Apps Script real y productivo que usa hoy el
// área de Calidad de Avenida+ (Google Sheets + Apps Script). El usuario lo
// subió tal cual al Project de Claude el 2026-09-06 para que sirviera de
// referencia de esquema al construir la integración con Plane (Fase 5 —
// ver apps-script/plane-integracion-sgc.gs y claude/progreso-implementacion.md).
//
// REGLA QUE APLICA SIN EXCEPCIÓN: nunca editar este archivo desde este repo,
// ni sugerir cambios "en caliente" sobre él, sin que el usuario lo pida
// explícitamente. Cualquier extensión (Plane u otra) se hace en archivos
// nuevos y aditivos (como apps-script/plane-integracion-sgc.gs), nunca
// tocando este archivo directamente. Si esta copia queda desactualizada
// respecto del Código real del usuario, hay que pedirle una copia nueva —
// no asumir ni inventar cambios.
//
// Ver claude/integracion-plane-appsscript.md sección 7 para el detalle de
// cómo se usa este esquema, y claude/progreso-implementacion.md para el
// historial completo (incluye el bug latente documentado, no corregido,
// de sgcGetR002/sgcSaveR002 definidas dos veces — la segunda, sobre la hoja
// r002_manual, es la que realmente se usa; la hoja r002 quedó huérfana).

// ─── SGC ISO 9001 — Apps Script Backend ──────────────────────────────
// Pegá este código en Código.gs dentro de tu Apps Script

const SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

// ─── doGet: sirve el HTML o responde consultas de datos ───────────────
function doGet(e) {
  const action = e.parameter.action;
  const invite = e.parameter.invite;

  // Con token de invitación → servir la app con el token embebido
  if (invite) {
    const template = HtmlService.createTemplateFromFile('Index');
    template.inviteToken = invite;
    return template.evaluate()
      .setTitle('SGC — Completar registro — avenida+')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  // Sin action → servir la app HTML
  if (!action) {
    const template = HtmlService.createTemplateFromFile('Index');
    template.inviteToken = '';
    return template.evaluate()
      .setTitle('SGC — Sistema de Gestión de Calidad ISO 9001')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  const sheet = SpreadsheetApp.openById(SHEET_ID);

  // ── getDocs ──
  if (action === 'getDocs') {
    const s = sheet.getSheetByName('documentos');
    const data = s.getDataRange().getValues();
    if (data.length <= 1) return json([]);
    const headers = data[0];
    const rows = data.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      if (obj.historial) {
        try { obj.historial = JSON.parse(obj.historial); } catch(e) { obj.historial = []; }
      }
      return obj;
    });
    return json(rows);
  }

  // ── getNcs ──
  if (action === 'getNcs') {
    const s = sheet.getSheetByName('no_conformidades');
    const data = s.getDataRange().getValues();
    if (data.length <= 1) return json([]);
    const headers = data[0];
    const rows = data.slice(1).map(row => {
      const obj = {}; headers.forEach((h, i) => obj[h] = row[i]); return obj;
    });
    return json(rows);
  }

  // ── getLog ──
  if (action === 'getLog') {
    const s = sheet.getSheetByName('log');
    const data = s.getDataRange().getValues();
    if (data.length <= 1) return json([]);
    const headers = data[0];
    const rows = data.slice(1).reverse().slice(0, 50).map(row => {
      const obj = {}; headers.forEach((h, i) => obj[h] = row[i]); return obj;
    });
    return json(rows);
  }

  // ── getUsuarios ──
  if (action === 'getUsuarios') {
    const s = sheet.getSheetByName('usuarios');
    if (!s) return json([]);
    const data = s.getDataRange().getValues();
    if (data.length <= 1) return json([]);
    const headers = data[0];
    const rows = data.slice(1).map(row => {
      const obj = {}; headers.forEach((h, i) => obj[h] = row[i]); return obj;
    });
    return json(rows);
  }

  // ── getAreas ──
  if (action === 'getAreas') {
    const s = sheet.getSheetByName('areas');
    if (!s) return json([]);
    const data = s.getDataRange().getValues();
    if (data.length <= 1) return json([]);
    const headers = data[0];
    const rows = data.slice(1).map(row => {
      const obj = {}; headers.forEach((h, i) => obj[h] = row[i]); return obj;
    });
    return json(rows);
  }

  // ── getTareas ──
  if (action === 'getTareas') {
    const s = sheet.getSheetByName('tareas');
    if (!s) return json([]);
    const data = s.getDataRange().getValues();
    if (data.length <= 1) return json([]);
    const headers = data[0];
    const rows = data.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      ['asignados','comentarios'].forEach(f => {
        if (obj[f]) { try { obj[f] = JSON.parse(obj[f]); } catch(e) { obj[f] = []; } }
        else obj[f] = [];
      });
      return obj;
    });
    return json(rows);
  }

  return json([]);
}

// ─── doPost: guarda datos ─────────────────────────────────────────────
function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  const { action, data } = payload;
  const sheet = SpreadsheetApp.openById(SHEET_ID);

  // ── saveDoc ──
  if (action === 'saveDoc') {
    const s = sheet.getSheetByName('documentos');
    const histStr = JSON.stringify(data.historial || []);
    const row = [
      data.id||'', data.codigo, data.titulo, data.area,
      data.clausula, data.tipo, data.version, data.estado,
      data.responsable||'', data.aprobador||'', data.link||'',
      data.descripcion||'', data.fecha, histStr
    ];
    if (data.id) {
      // Actualizar fila existente
      const vals = s.getDataRange().getValues();
      for (let i = 1; i < vals.length; i++) {
        if (String(vals[i][0]) === String(data.id)) {
          s.getRange(i + 1, 1, 1, 14).setValues([row]);
          return json(data);
        }
      }
    }
    // Insertar nueva fila
    const lastRow = s.getLastRow();
    const newId = lastRow > 1 ? (parseInt(s.getRange(lastRow, 1).getValue()) || 0) + 1 : 1;
    row[0] = newId;
    s.appendRow(row);
    data.id = newId;
    return json(data);
  }

  // ── saveNc ──
  if (action === 'saveNc') {
    const s = sheet.getSheetByName('no_conformidades');
    const lastRow = s.getLastRow();
    const newId = lastRow > 1 ? (parseInt(s.getRange(lastRow, 1).getValue()) || 0) + 1 : 1;
    s.appendRow([newId, data.doc_id||'', data.descripcion, data.responsable||'', data.estado||'abierta', data.accion||'', data.fecha,
      data.area_detecta||'', data.detectada_por||'', data.origen||'interno', data.reclamo||'no', data.requisito||'', data.causa_raiz||'',
      data.reincidente||'no', data.reincidente_ref||'', data.causa_detalle||'',
    data.eficaz||'', data.fecha_cierre||'', data.accion_lograda||'']);
    data.id = newId;
    return json(data);
  }

  // ── addLog ──
  if (action === 'addLog') {
    const s = sheet.getSheetByName('log');
    const lastRow = s.getLastRow();
    const newId = lastRow > 1 ? (parseInt(s.getRange(lastRow, 1).getValue()) || 0) + 1 : 1;
    s.appendRow([newId, data.usuario || 'Usuario', data.accion, new Date().toISOString()]);
    return json({ ok: true });
  }

  // ── saveArea ──
  if (action === 'saveArea') {
    const s = sheet.getSheetByName('areas');
    if (!s) return json({ error: 'Hoja areas no encontrada' });
    if (data.id) {
      const vals = s.getDataRange().getValues();
      for (let i = 1; i < vals.length; i++) {
        if (String(vals[i][0]) === String(data.id)) {
          s.getRange(i+1,1,1,5).setValues([[data.id, data.nombre, data.descripcion||'', data.responsable||'', '1']]);
          return json(data);
        }
      }
    }
    const lastRow = s.getLastRow();
    const newId = lastRow > 1 ? (parseInt(s.getRange(lastRow,1).getValue())||0)+1 : 1;
    s.appendRow([newId, data.nombre, data.descripcion||'', data.responsable||'', '1']);
    data.id = newId;
    return json(data);
  }

  // ── deleteArea ──
  if (action === 'deleteArea') {
    const s = sheet.getSheetByName('areas');
    if (!s) return json({ error: 'Hoja no encontrada' });
    const vals = s.getDataRange().getValues();
    for (let i = 1; i < vals.length; i++) {
      if (String(vals[i][0]) === String(data.id)) {
        s.deleteRow(i+1);
        return json({ ok: true });
      }
    }
    return json({ error: 'Área no encontrada' });
  }

  // ── saveTarea ──
  if (action === 'saveTarea') {
    const s = sheet.getSheetByName('tareas');
    if (!s) return json({ error: 'Hoja tareas no encontrada' });
    const asignadosStr = JSON.stringify(data.asignados || []);
    const comentariosStr = JSON.stringify(data.comentarios || []);
    const row = [
      data.id||'', data.titulo, data.descripcion||'', data.area||'',
      data.doc_id||'', data.estado||'pendiente', data.prioridad||'media',
      asignadosStr, data.fecha_inicio||'', data.fecha_fin||'',
      comentariosStr, data.fecha_creacion
    ];
    if (data.id) {
      const vals = s.getDataRange().getValues();
      for (let i = 1; i < vals.length; i++) {
        if (String(vals[i][0]) === String(data.id)) {
          s.getRange(i+1,1,1,12).setValues([row]);
          return json(data);
        }
      }
    }
    const lastRow = s.getLastRow();
    const newId = lastRow > 1 ? (parseInt(s.getRange(lastRow,1).getValue())||0)+1 : 1;
    row[0] = newId;
    s.appendRow(row);
    data.id = newId;
    return json(data);
  }

  // ── deleteTarea ──
  if (action === 'deleteTarea') {
    const s = sheet.getSheetByName('tareas');
    if (!s) return json({ error: 'Hoja no encontrada' });
    const vals = s.getDataRange().getValues();
    for (let i = 1; i < vals.length; i++) {
      if (String(vals[i][0]) === String(data.id)) {
        s.deleteRow(i+1);
        return json({ ok: true });
      }
    }
    return json({ error: 'Tarea no encontrada' });
  }

  // ── requestRecovery: genera código y lo guarda ──
  if (action === 'requestRecovery') {
    const usersSheet = sheet.getSheetByName('usuarios');
    const vals = usersSheet.getDataRange().getValues();
    const headers = vals[0];
    const emailCol = headers.indexOf('email');
    let found = false;
    for (let i = 1; i < vals.length; i++) {
      if (String(vals[i][emailCol]).toLowerCase() === String(data.email).toLowerCase()) { found = true; break; }
    }
    if (!found) return json({ error: 'No existe un usuario con ese email' });

    const codigo = Math.floor(100000 + Math.random()*900000).toString(); // 6 dígitos
    const expira = new Date(Date.now() + 15*60*1000).toISOString(); // 15 min

    let recSheet = sheet.getSheetByName('recovery');
    if (!recSheet) {
      recSheet = sheet.insertSheet('recovery');
      recSheet.getRange(1,1,1,3).setValues([['email','codigo','expira']]);
    }
    // Eliminar códigos previos del mismo email
    const recVals = recSheet.getDataRange().getValues();
    for (let i = recVals.length - 1; i >= 1; i--) {
      if (String(recVals[i][0]).toLowerCase() === String(data.email).toLowerCase()) recSheet.deleteRow(i+1);
    }
    recSheet.appendRow([data.email, codigo, expira]);

    // Enviar el código por mail al usuario
    try {
      MailApp.sendEmail({
        to: data.email,
        subject: 'SGC — Código de recuperación de contraseña',
        body: `Tu código de recuperación es: ${codigo}\n\nEste código vence en 15 minutos.\n\nSi no solicitaste este cambio, ignorá este mensaje.`
      });
    } catch(e) {
      // Si falla el envío de mail, igual devolvemos ok (el admin puede ver el código en el Sheet)
    }
    return json({ ok: true });
  }

  // ── verifyRecoveryAndReset: valida código y cambia la contraseña ──
  if (action === 'verifyRecoveryAndReset') {
    const recSheet = sheet.getSheetByName('recovery');
    if (!recSheet) return json({ error: 'No hay solicitudes de recuperación' });
    const recVals = recSheet.getDataRange().getValues();
    let rowIdx = -1;
    for (let i = 1; i < recVals.length; i++) {
      if (String(recVals[i][0]).toLowerCase() === String(data.email).toLowerCase() && String(recVals[i][1]) === String(data.codigo)) {
        rowIdx = i; break;
      }
    }
    if (rowIdx === -1) return json({ error: 'Código incorrecto' });
    const expira = new Date(recVals[rowIdx][2]);
    if (new Date() > expira) return json({ error: 'El código venció. Solicitá uno nuevo.' });

    // Actualizar contraseña del usuario
    const usersSheet = sheet.getSheetByName('usuarios');
    const uVals = usersSheet.getDataRange().getValues();
    const headers = uVals[0];
    const emailCol = headers.indexOf('email');
    const passCol = headers.indexOf('passHash');
    let updated = false;
    for (let i = 1; i < uVals.length; i++) {
      if (String(uVals[i][emailCol]).toLowerCase() === String(data.email).toLowerCase()) {
        usersSheet.getRange(i+1, passCol+1).setValue(data.newPassHash);
        updated = true; break;
      }
    }
    if (!updated) return json({ error: 'Usuario no encontrado' });

    // Borrar el código usado
    recSheet.deleteRow(rowIdx+1);
    return json({ ok: true });
  }

  // ── saveUsuario ──
  if (action === 'saveUsuario') {
    const s = sheet.getSheetByName('usuarios');
    if (!s) return json({ error: 'Hoja usuarios no encontrada' });
    // Usamos '1' y '0' para evitar que Sheets convierta 'true' a booleano TRUE
    const activoVal = (data.activo === 'true' || data.activo === true || data.activo === '1') ? '1' : '0';
    if (data.id) {
      const vals = s.getDataRange().getValues();
      for (let i = 1; i < vals.length; i++) {
        if (String(vals[i][0]) === String(data.id)) {
          s.getRange(i + 1, 1, 1, 7).setValues([[data.id, data.nombre, data.email, data.passHash, data.rol, data.area||'', activoVal]]);
          return json(data);
        }
      }
    }
    const lastRow = s.getLastRow();
    const newId = lastRow > 1 ? (parseInt(s.getRange(lastRow, 1).getValue()) || 0) + 1 : 1;
    s.appendRow([newId, data.nombre, data.email, data.passHash, data.rol, data.area||'', '1']);
    data.id = newId;
    return json(data);
  }

  // ── deleteUsuario ──
  if (action === 'deleteUsuario') {
    const s = sheet.getSheetByName('usuarios');
    if (!s) return json({ error: 'Hoja no encontrada' });
    const vals = s.getDataRange().getValues();
    for (let i = 1; i < vals.length; i++) {
      if (String(vals[i][0]) === String(data.id)) {
        s.deleteRow(i + 1);
        return json({ ok: true });
      }
    }
    return json({ error: 'Usuario no encontrado' });
  }

  // ── toggleUsuario ──
  if (action === 'toggleUsuario') {
    const s = sheet.getSheetByName('usuarios');
    if (!s) return json({ error: 'Hoja no encontrada' });
    const vals = s.getDataRange().getValues();
    for (let i = 1; i < vals.length; i++) {
      if (String(vals[i][0]) === String(data.id)) {
        s.getRange(i + 1, 7).setValue(data.activo ? '1' : '0');
        return json({ ok: true });
      }
    }
    return json({ error: 'Usuario no encontrado' });
  }

  return json({ error: 'Acción desconocida' });
}

// ─── Helper ───────────────────────────────────────────────────────────
function json(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── Crear hojas si no existen ────────────────────────────────────────
function inicializarHojas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const hojas = {
    'documentos': ['id','codigo','titulo','area','clausula','tipo','version','estado','responsable','aprobador','link','descripcion','fecha','historial','publico'],
    'no_conformidades': ['id','doc_id','descripcion','responsable','estado','accion','fecha','area_detecta','detectada_por','origen','reclamo','requisito','causa_raiz','reincidente','reincidente_ref','causa_detalle','eficaz','fecha_cierre','accion_lograda'],
    'log': ['id','usuario','accion','fecha'],
    'usuarios': ['id','nombre','email','passHash','rol','area','activo'],
    'areas': ['id','nombre','descripcion','responsable','activo'],
    'tareas': ['id','titulo','descripcion','area','doc_id','estado','prioridad','asignados','fecha_inicio','fecha_fin','comentarios','fecha_creacion'],
    'acciones_correctivas': ['id','titulo','descripcion','nc_ids','responsable','estado','fecha_compromiso','fecha_cierre','evidencia','fecha_creacion','eficaz'],
    'r002': ['id','tipo','nro','fecha','descripcion','responsable','procedencia','eficaz','implementacion','estado','fecha_revision','fecha_baja','accion_inmediata','detalle_causas','seguimiento','accion_lograda'],
    'recovery': ['email','codigo','expira']
  };

  Object.entries(hojas).forEach(([nombre, headers]) => {
    let hoja = ss.getSheetByName(nombre);
    if (!hoja) {
      hoja = ss.insertSheet(nombre);
      hoja.getRange(1, 1, 1, headers.length).setValues([headers]);
      hoja.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      hoja.setFrozenRows(1);
    } else {
      // Agregar columnas nuevas si no existen
      const existingHeaders = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
      headers.forEach(h => {
        if (!existingHeaders.includes(h)) {
          const newCol = hoja.getLastColumn() + 1;
          hoja.getRange(1, newCol).setValue(h);
          hoja.getRange(1, newCol).setFontWeight('bold');
          Logger.log(`Columna "${h}" agregada a hoja "${nombre}"`);
        }
      });
    }
  });

  SpreadsheetApp.getUi().alert('✅ Hojas del SGC creadas correctamente.');
}

// ─── Funciones públicas para google.script.run ────────────────────────
function sgcDeleteDoc(id) {
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('documentos');
  if (!s) return 'error';
  const vals = s.getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    if (String(vals[i][0]) === String(id)) { s.deleteRow(i+1); return 'ok'; }
  }
  return 'not found';
}

function sgcGetDocs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const s = ss.getSheetByName('documentos');
  if (!s) return JSON.stringify([]);
  const data = s.getDataRange().getValues();
  if (data.length <= 1) return JSON.stringify([]);
  const headers = data[0];
  // Agregar columna publico al Sheet si no existe
  if (!headers.includes('publico')) {
    const newCol = headers.length + 1;
    s.getRange(1, newCol).setValue('publico');
    s.getRange(1, newCol).setFontWeight('bold');
    headers.push('publico');
    Logger.log('Columna publico agregada a documentos');
  }
  const rows = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    // Parsear historial
    if (obj['historial']) { try { obj['historial'] = JSON.parse(obj['historial']); } catch(e) { obj['historial'] = []; } }
    else obj['historial'] = [];
    // Garantizar publico
    if (obj.publico === undefined || obj.publico === '') obj.publico = '0';
    return obj;
  });
  return JSON.stringify(rows);
}
function sgcGetNcs()      { return JSON.stringify(_getSheet('no_conformidades', [])); }

function sgcUpdateNc(dataJson) {
  const data = JSON.parse(dataJson);
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('no_conformidades');
  if (!s) return JSON.stringify({error:'Hoja no encontrada'});
  const vals = s.getDataRange().getValues();
  const headers = vals[0];
  for (let i = 1; i < vals.length; i++) {
    if (String(vals[i][0]) === String(data.id)) {
      // Update each column by header name
      headers.forEach((h, col) => {
        if (data[h] !== undefined) s.getRange(i+1, col+1).setValue(data[h]);
      });
      return JSON.stringify({ok:true});
    }
  }
  return JSON.stringify({error:'NC no encontrada'});
}

function sgcDeleteNc(id) {
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('no_conformidades');
  if (!s) return 'error';
  const vals = s.getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    if (String(vals[i][0]) === String(id)) { s.deleteRow(i+1); return 'ok'; }
  }
  return 'not found';
}
function sgcGetLog()      { return JSON.stringify(_getSheet('log', [], true)); }
function sgcGetAreas()    { return JSON.stringify(_getSheet('areas', [])); }
function sgcGetUsuarios() { return JSON.stringify(_getSheet('usuarios', [])); }
function sgcGetTareas()   { return JSON.stringify(_getSheet('tareas', ['asignados','comentarios'])); }
function sgcGetAC()       { return JSON.stringify(_getSheet('acciones_correctivas', ['nc_ids'])); }
function sgcGetR002()     { return JSON.stringify(_getSheet('r002', [])); }

function sgcSaveR002(dataJson) {
  const data = JSON.parse(dataJson);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName('r002');
  if (!s) {
    s = ss.insertSheet('r002');
    s.appendRow(['id','tipo','nro','fecha','descripcion','responsable','procedencia','eficaz','implementacion','estado','fecha_revision','fecha_baja','accion_inmediata','detalle_causas','seguimiento','accion_lograda']);
  }
  const row = [
    data.id||'', data.tipo, data.nro||'', data.fecha||'',
    data.descripcion||'', data.responsable||'', data.procedencia||'',
    data.eficaz||'', data.implementacion||'', data.estado||'Abierta',
    data.fecha_revision||'', data.fecha_baja||'',
    data.accion_inmediata||'', data.detalle_causas||'',
    data.seguimiento||'', data.accion_lograda||''
  ];
  if (data.id) {
    const vals = s.getDataRange().getValues();
    for (let i = 1; i < vals.length; i++) {
      if (String(vals[i][0]) === String(data.id)) {
        s.getRange(i+1,1,1,16).setValues([row]);
        return JSON.stringify(data);
      }
    }
  }
  const newId = s.getLastRow() > 1 ? (parseInt(s.getRange(s.getLastRow(),1).getValue())||0)+1 : 1;
  row[0] = newId; s.appendRow(row); data.id = newId;
  return JSON.stringify(data);
}

function sgcSaveAC(dataJson) {
  const data = JSON.parse(dataJson);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName('acciones_correctivas');
  if (!s) {
    s = ss.insertSheet('acciones_correctivas');
    s.appendRow(['id','titulo','descripcion','nc_ids','responsable','estado','fecha_compromiso','fecha_cierre','evidencia','fecha_creacion']);
  }
  const ncIdsStr = JSON.stringify(data.nc_ids || []);
  const row = [
    data.id||'', data.titulo, data.descripcion||'', ncIdsStr,
    data.responsable||'', data.estado||'pendiente',
    data.fecha_compromiso||'', data.fecha_cierre||'', data.evidencia||'',
    data.fecha_creacion||new Date().toISOString().slice(0,10),
    data.eficaz||''
  ];
  if (data.id) {
    const vals = s.getDataRange().getValues();
    for (let i = 1; i < vals.length; i++) {
      if (String(vals[i][0]) === String(data.id)) {
        s.getRange(i+1,1,1,11).setValues([row]);
        return JSON.stringify(data);
      }
    }
  }
  const newId = s.getLastRow() > 1 ? (parseInt(s.getRange(s.getLastRow(),1).getValue())||0)+1 : 1;
  row[0] = newId;
  s.appendRow(row);
  data.id = newId;
  return JSON.stringify(data);
}

function sgcDeleteAC(id) {
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('acciones_correctivas');
  if (!s) return 'error';
  const vals = s.getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    if (String(vals[i][0]) === String(id)) { s.deleteRow(i+1); return 'ok'; }
  }
  return 'not found';
}

function _getSheet(nombre, jsonCols, reverse) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const s = ss.getSheetByName(nombre);
  if (!s) return [];
  const data = s.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  let rows = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    jsonCols.forEach(f => {
      if (obj[f]) { try { obj[f] = JSON.parse(obj[f]); } catch(e) { obj[f] = []; } }
      else obj[f] = [];
    });
    return obj;
  });
  if (reverse) rows = rows.reverse().slice(0, 50);
  return rows;
}

function sgcSaveDoc(dataJson) {
  const data = JSON.parse(dataJson);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const s = ss.getSheetByName('documentos');
  const histStr = JSON.stringify(data.historial || []);
  const row = [data.id||'', data.codigo, data.titulo, data.area, data.clausula, data.tipo,
    data.version, data.estado, data.responsable||'', data.aprobador||'', data.link||'',
    data.descripcion||'', data.fecha, histStr, data.publico||'0'];
  if (data.id) {
    const vals = s.getDataRange().getValues();
    for (let i = 1; i < vals.length; i++) {
      if (String(vals[i][0]) === String(data.id)) {
        s.getRange(i+1,1,1,15).setValues([row]); return JSON.stringify(data);
      }
    }
  }
  const newId = s.getLastRow() > 1 ? (parseInt(s.getRange(s.getLastRow(),1).getValue())||0)+1 : 1;
  row[0] = newId; s.appendRow(row); data.id = newId;
  return JSON.stringify(data);
}

function sgcSaveNc(dataJson) {
  const data = JSON.parse(dataJson);
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('no_conformidades');
  const newId = s.getLastRow() > 1 ? (parseInt(s.getRange(s.getLastRow(),1).getValue())||0)+1 : 1;
  s.appendRow([
    newId,
    data.doc_id||'',
    data.descripcion,
    data.responsable||'',
    data.estado||'abierta',
    data.accion||'',
    data.fecha,
    data.area_detecta||'',
    data.detectada_por||'',
    data.origen||'interno',
    data.reclamo||'no',
    data.requisito||'',
    data.causa_raiz||'',
    data.reincidente||'no',
    data.reincidente_ref||'',
    data.causa_detalle||''
  ]);
  data.id = newId; return JSON.stringify(data);
}

function sgcAddLog(dataJson) {
  const data = JSON.parse(dataJson);
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('log');
  const newId = s.getLastRow() > 1 ? (parseInt(s.getRange(s.getLastRow(),1).getValue())||0)+1 : 1;
  s.appendRow([newId, data.usuario||'Usuario', data.accion, new Date().toISOString()]);
  return 'ok';
}

function sgcSaveTarea(dataJson) {
  const data = JSON.parse(dataJson);
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('tareas');
  if (!s) return JSON.stringify({error:'Hoja tareas no encontrada'});
  const row = [data.id||'', data.titulo, data.descripcion||'', data.area||'',
    data.doc_id||'', data.estado||'pendiente', data.prioridad||'media',
    JSON.stringify(data.asignados||[]), data.fecha_inicio||'', data.fecha_fin||'',
    JSON.stringify(data.comentarios||[]), data.fecha_creacion];
  if (data.id) {
    const vals = s.getDataRange().getValues();
    for (let i = 1; i < vals.length; i++) {
      if (String(vals[i][0]) === String(data.id)) {
        s.getRange(i+1,1,1,12).setValues([row]); return JSON.stringify(data);
      }
    }
  }
  const newId = s.getLastRow() > 1 ? (parseInt(s.getRange(s.getLastRow(),1).getValue())||0)+1 : 1;
  row[0] = newId; s.appendRow(row); data.id = newId;
  return JSON.stringify(data);
}

function sgcDeleteTarea(id) {
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('tareas');
  if (!s) return 'error';
  const vals = s.getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    if (String(vals[i][0]) === String(id)) { s.deleteRow(i+1); return 'ok'; }
  }
  return 'not found';
}

function sgcSaveUsuario(dataJson) {
  const data = JSON.parse(dataJson);
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('usuarios');
  const activoVal = (data.activo==='true'||data.activo===true||data.activo==='1') ? '1' : '0';
  if (data.id) {
    const vals = s.getDataRange().getValues();
    for (let i = 1; i < vals.length; i++) {
      if (String(vals[i][0]) === String(data.id)) {
        s.getRange(i+1,1,1,7).setValues([[data.id,data.nombre,data.email,data.passHash,data.rol,data.area||'',activoVal]]);
        return JSON.stringify(data);
      }
    }
  }
  const newId = s.getLastRow() > 1 ? (parseInt(s.getRange(s.getLastRow(),1).getValue())||0)+1 : 1;
  s.appendRow([newId,data.nombre,data.email,data.passHash,data.rol,data.area||'','1']);
  data.id = newId; return JSON.stringify(data);
}

function sgcToggleUsuario(dataJson) {
  const data = JSON.parse(dataJson);
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('usuarios');
  const vals = s.getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    if (String(vals[i][0]) === String(data.id)) {
      s.getRange(i+1,7).setValue(data.activo ? '1' : '0'); return 'ok';
    }
  }
  return 'not found';
}

function sgcDeleteUsuario(dataJson) {
  const data = JSON.parse(dataJson);
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('usuarios');
  const vals = s.getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    if (String(vals[i][0]) === String(data.id)) { s.deleteRow(i+1); return 'ok'; }
  }
  return 'not found';
}

function sgcSaveArea(dataJson) {
  const data = JSON.parse(dataJson);
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('areas');
  if (data.id) {
    const vals = s.getDataRange().getValues();
    for (let i = 1; i < vals.length; i++) {
      if (String(vals[i][0]) === String(data.id)) {
        s.getRange(i+1,1,1,5).setValues([[data.id,data.nombre,data.descripcion||'',data.responsable||'','1']]);
        return JSON.stringify(data);
      }
    }
  }
  const newId = s.getLastRow() > 1 ? (parseInt(s.getRange(s.getLastRow(),1).getValue())||0)+1 : 1;
  s.appendRow([newId,data.nombre,data.descripcion||'',data.responsable||'','1']);
  data.id = newId; return JSON.stringify(data);
}

function sgcDeleteArea(dataJson) {
  const data = JSON.parse(dataJson);
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('areas');
  const vals = s.getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    if (String(vals[i][0]) === String(data.id)) { s.deleteRow(i+1); return 'ok'; }
  }
  return 'not found';
}

function sgcRequestRecovery(email) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName('usuarios');
  const vals = usersSheet.getDataRange().getValues();
  const headers = vals[0];
  const emailCol = headers.indexOf('email');
  let found = false;
  for (let i = 1; i < vals.length; i++) {
    if (String(vals[i][emailCol]).toLowerCase() === String(email).toLowerCase()) { found = true; break; }
  }
  if (!found) return JSON.stringify({error:'No existe un usuario con ese email'});
  const codigo = Math.floor(100000 + Math.random()*900000).toString();
  const expira = new Date(Date.now() + 15*60*1000).toISOString();
  let recSheet = ss.getSheetByName('recovery');
  if (!recSheet) { recSheet = ss.insertSheet('recovery'); recSheet.appendRow(['email','codigo','expira']); }
  const recVals = recSheet.getDataRange().getValues();
  for (let i = recVals.length - 1; i >= 1; i--) {
    if (String(recVals[i][0]).toLowerCase() === String(email).toLowerCase()) recSheet.deleteRow(i+1);
  }
  recSheet.appendRow([email, codigo, expira]);
  try { MailApp.sendEmail({to:email, subject:'SGC — Código de recuperación', body:`Tu código es: ${codigo}\n\nVence en 15 minutos.`}); } catch(e){}
  return JSON.stringify({ok:true});
}

function sgcVerifyRecovery(dataJson) {
  const data = JSON.parse(dataJson);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const recSheet = ss.getSheetByName('recovery');
  if (!recSheet) return JSON.stringify({error:'No hay solicitudes'});
  const recVals = recSheet.getDataRange().getValues();
  let rowIdx = -1;
  for (let i = 1; i < recVals.length; i++) {
    if (String(recVals[i][0]).toLowerCase()===String(data.email).toLowerCase() && String(recVals[i][1])===String(data.codigo)) { rowIdx=i; break; }
  }
  if (rowIdx===-1) return JSON.stringify({error:'Código incorrecto'});
  if (new Date() > new Date(recVals[rowIdx][2])) return JSON.stringify({error:'Código vencido'});
  const usersSheet = ss.getSheetByName('usuarios');
  const uVals = usersSheet.getDataRange().getValues();
  const headers = uVals[0];
  for (let i = 1; i < uVals.length; i++) {
    if (String(uVals[i][headers.indexOf('email')]).toLowerCase()===String(data.email).toLowerCase()) {
      usersSheet.getRange(i+1, headers.indexOf('passHash')+1).setValue(data.newPassHash);
      recSheet.deleteRow(rowIdx+1);
      return JSON.stringify({ok:true});
    }
  }
  return JSON.stringify({error:'Usuario no encontrado'});
}

// ─── R-002 Registro unificado ─────────────────────────────────────────
function sgcGetR002() { return JSON.stringify(_getSheet('r002_manual', [])); }

function sgcSaveR002(dataJson) {
  const data = JSON.parse(dataJson);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName('r002_manual');
  if (!s) {
    s = ss.insertSheet('r002_manual');
    s.appendRow(['id','tipo','fecha','descripcion','responsable','procedencia','estado','eficaz',
      'accion_inmediata','causas','seguimiento','lograda','fecha_rev','fecha_baja']);
  }
  const row = [
    data.id||'', data.tipo, data.fecha||'', data.descripcion, data.responsable||'',
    data.procedencia||'', data.estado||'Abierto', data.eficaz||'',
    data.accion_inmediata||'', data.causas||'', data.seguimiento||'',
    data.lograda||'', data.fecha_rev||'', data.fecha_baja||''
  ];
  if (data.id) {
    const vals = s.getDataRange().getValues();
    for (let i = 1; i < vals.length; i++) {
      if (String(vals[i][0]) === String(data.id)) {
        s.getRange(i+1,1,1,14).setValues([row]);
        return JSON.stringify(data);
      }
    }
  }
  const newId = s.getLastRow() > 1 ? (parseInt(s.getRange(s.getLastRow(),1).getValue())||0)+1 : 1;
  row[0] = newId;
  s.appendRow(row);
  data.id = newId;
  return JSON.stringify(data);
}

function sgcDeleteR002(id) {
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('r002_manual');
  if (!s) return 'error';
  const vals = s.getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    if (String(vals[i][0]) === String(id)) { s.deleteRow(i+1); return 'ok'; }
  }
  return 'not found';
}

// ─── AUTORIZACIÓN (ejecutar una vez manualmente) ─────────────────────
function autorizarMail() {
  MailApp.sendEmail({
    to: Session.getActiveUser().getEmail(),
    subject: 'SGC — Autorización de mail habilitada',
    body: 'Los permisos de mail están configurados correctamente para el SGC de avenida+.'
  });
  Logger.log('Mail de autorización enviado correctamente.');
}

// ─── INVITACIONES ─────────────────────────────────────────────────────
function sgcSendInvitation(dataJson) {
  const data = JSON.parse(dataJson);
  const email = String(data.email).toLowerCase().trim();
  const area  = data.area  || '';
  const rol   = data.rol   || 'usuario';

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Verificar que no exista ya el usuario
  const usersSheet = ss.getSheetByName('usuarios');
  if (usersSheet) {
    const vals = usersSheet.getDataRange().getValues();
    const headers = vals[0];
    const emailCol = headers.indexOf('email');
    for (let i = 1; i < vals.length; i++) {
      if (String(vals[i][emailCol]).toLowerCase() === email) {
        return JSON.stringify({ error: 'Ya existe un usuario con ese email.' });
      }
    }
  }

  // Crear o acceder a la hoja de invitaciones
  let invSheet = ss.getSheetByName('invitaciones');
  if (!invSheet) {
    invSheet = ss.insertSheet('invitaciones');
    invSheet.appendRow(['token','email','area','rol','expira','usado']);
  }

  // Limpiar invitaciones previas para ese email
  const invVals = invSheet.getDataRange().getValues();
  for (let i = invVals.length - 1; i >= 1; i--) {
    if (String(invVals[i][1]).toLowerCase() === email) invSheet.deleteRow(i + 1);
  }

  // Generar token único
  const token  = Utilities.getUuid();
  const expira = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 días

  invSheet.appendRow([token, email, area, rol, expira, '0']);

  // URL de registro — apunta a la misma Web App con parámetros
  const appUrl = ScriptApp.getService().getUrl();
  const registerUrl = `${appUrl}?invite=${token}`;

  // Enviar mail
  try {
    MailApp.sendEmail({
      to: email,
      subject: 'Invitación al SGC — avenida+',
      htmlBody: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#0A0A0A">avenida<span style="color:#663EDD">+</span></h2>
          <h3 style="color:#0A0A0A;font-weight:600">Te invitaron al Sistema de Gestión de Calidad</h3>
          <p style="color:#555;line-height:1.6">
            Fuiste invitado/a a acceder al SGC ISO 9001 de avenida+ como <strong>${rol}</strong>
            ${area ? `del área <strong>${area}</strong>` : ''}.
          </p>
          <p style="color:#555;line-height:1.6">
            Hacé clic en el botón para completar tu registro. El link es válido por 7 días.
          </p>
          <a href="${registerUrl}" style="display:inline-block;background:#663EDD;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
            Completar registro →
          </a>
          <p style="color:#999;font-size:12px;margin-top:24px">
            Si no esperabas esta invitación, podés ignorar este mail.
          </p>
        </div>
      `
    });
  } catch(e) {
    return JSON.stringify({ error: 'No se pudo enviar el mail: ' + e.message });
  }

  return JSON.stringify({ ok: true });
}

function sgcVerifyInvitation(token) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const invSheet = ss.getSheetByName('invitaciones');
  if (!invSheet) return JSON.stringify({ error: 'No hay invitaciones pendientes.' });

  const vals = invSheet.getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    if (String(vals[i][0]) === String(token)) {
      if (String(vals[i][5]) === '1') return JSON.stringify({ error: 'Esta invitación ya fue usada.' });
      if (new Date() > new Date(vals[i][4])) return JSON.stringify({ error: 'Esta invitación venció. Pedí una nueva al administrador.' });
      return JSON.stringify({ ok: true, email: vals[i][1], area: vals[i][2], rol: vals[i][3] });
    }
  }
  return JSON.stringify({ error: 'Invitación inválida o no encontrada.' });
}

function sgcCompleteRegistration(dataJson) {
  const data = JSON.parse(dataJson);
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Marcar invitación como usada
  const invSheet = ss.getSheetByName('invitaciones');
  if (invSheet) {
    const vals = invSheet.getDataRange().getValues();
    for (let i = 1; i < vals.length; i++) {
      if (String(vals[i][0]) === String(data.token)) {
        invSheet.getRange(i + 1, 6).setValue('1');
        break;
      }
    }
  }

  // Crear usuario
  let usersSheet = ss.getSheetByName('usuarios');
  if (!usersSheet) {
    usersSheet = ss.insertSheet('usuarios');
    usersSheet.appendRow(['id','nombre','email','passHash','rol','area','activo']);
  }
  const lastRow = usersSheet.getLastRow();
  const newId = lastRow > 1 ? (parseInt(usersSheet.getRange(lastRow, 1).getValue()) || 0) + 1 : 1;
  usersSheet.appendRow([newId, data.nombre, data.email, data.passHash, data.rol, data.area, '1']);

  // Enviar mail de bienvenida con el link del SGC
  const appUrl = ScriptApp.getService().getUrl();
  try {
    MailApp.sendEmail({
      to: data.email,
      subject: 'Tu acceso al SGC está listo — avenida+',
      htmlBody: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#0A0A0A">avenida<span style="color:#663EDD">+</span></h2>
          <h3 style="color:#0A0A0A;font-weight:600">¡Bienvenido/a, ${data.nombre}!</h3>
          <p style="color:#555;line-height:1.6">
            Tu cuenta fue creada correctamente. A partir de ahora podés acceder al SGC con tu mail y contraseña.
          </p>
          <table style="margin:16px 0;font-size:13px;color:#555">
            <tr><td style="padding:3px 12px 3px 0;font-weight:600;color:#0A0A0A">Email:</td><td>${data.email}</td></tr>
            <tr><td style="padding:3px 12px 3px 0;font-weight:600;color:#0A0A0A">Rol:</td><td>${data.rol}</td></tr>
            ${data.area ? `<tr><td style="padding:3px 12px 3px 0;font-weight:600;color:#0A0A0A">Área:</td><td>${data.area}</td></tr>` : ''}
          </table>
          <a href="${appUrl}" style="display:inline-block;background:#663EDD;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:8px 0">
            Ingresar al SGC →
          </a>
          <p style="color:#999;font-size:11px;margin-top:20px">
            Guardá este mail para tener el acceso a mano.<br>
            Link: <a href="${appUrl}" style="color:#663EDD">${appUrl}</a>
          </p>
        </div>
      `
    });
  } catch(e) {
    Logger.log('Error enviando mail de bienvenida: ' + e.message);
  }

  return JSON.stringify({ ok: true });
}
