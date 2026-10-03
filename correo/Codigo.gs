/**
 * Agenda · Patri S. Rodeiro — Envío de correos desde tu Gmail
 *
 * Qué hace:
 *  1. Recibe de la agenda las reservas y planes semanales y los envía con diseño corporativo.
 *  2. Cada día, a la hora que elijas, envía solo los recordatorios del siguiente día laborable.
 *
 * Configuración: Configuración del proyecto (rueda dentada) → Propiedades de la secuencia de comandos.
 * Ver la guía CORREO-LEEME.md. No hace falta tocar este código.
 */

const TZ = "Europe/Madrid";
const REMITENTE = "Patri S. Rodeiro · Readaptación y rendimiento";
const LUGAR = "Clínica DCF · Mugardos";
const CANCELACION = "Si no avisas o no vienes, se aplicará un recargo.";

const FIRMA = {
  nombre: "Patri S. Rodeiro",
  titulo: "Readaptadora de lesiones · Colegiada nº 65.238",
  cv: [
    "Graduada en Ciencias de la Actividad Física y del Deporte",
    "Máster en Readaptación de Lesiones (FSI)",
    "Directora del Área de Rendimiento y Readaptación de lesiones · Racing Club Ferrol",
    "Ex readaptadora y especialista en fuerza · R.C. Deportivo de La Coruña",
    "Ex directora del Área de Rendimiento y Salud · Selección Nacional Femenina de fútbol de República Dominicana"
  ],
  telefono: "613 711 792",
  email: "patri.strengthcoach@gmail.com",
  lugar: LUGAR
};

const DIAS = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

/* ---------------- Configuración ---------------- */
function cfg_() {
  const p = PropertiesService.getScriptProperties();
  return {
    url: (p.getProperty("SUPABASE_URL") || "").replace(/\/+$/, ""),
    key: p.getProperty("SUPABASE_KEY") || "",
    botEmail: p.getProperty("BOT_EMAIL") || "",
    botPass: p.getProperty("BOT_PASSWORD") || "",
    web: (p.getProperty("WEB_URL") || "").replace(/\/+$/, ""),
    hora: Number(p.getProperty("HORA_RECORDATORIOS") || 10)
  };
}

/* ---------------- Web: la agenda llama aquí ---------------- */
function doGet() { return json_({ ok: true, servicio: "agenda-psr" }); }

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (!usuarioValido_(d.token)) return json_({ ok: false, error: "No autorizado" });
    if (!d.to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.to)) return json_({ ok: false, error: "Email no válido" });
    if (!d.asunto || !Array.isArray(d.lineas)) return json_({ ok: false, error: "Datos incompletos" });
    enviar_(d.to, d);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function usuarioValido_(token) {
  if (!token) return false;
  const c = cfg_();
  const r = UrlFetchApp.fetch(c.url + "/auth/v1/user", { headers: { apikey: c.key, Authorization: "Bearer " + token }, muteHttpExceptions: true });
  return r.getResponseCode() === 200;
}

/* ---------------- Envío ---------------- */
function enviar_(to, d) {
  const logo = logo_();
  const opts = { htmlBody: plantilla(d, logo ? "cid:logo" : ""), name: REMITENTE, replyTo: FIRMA.email };
  if (logo) opts.inlineImages = { logo: logo };
  const adj = adjuntos_(d.adjuntos);
  if (adj.length) opts.attachments = adj;
  GmailApp.sendEmail(to, d.asunto, textoPlano(d), opts);
}

/** Adjunta PDFs alojados en tu web (solo nombres de archivo .pdf de la propia agenda). */
function adjuntos_(lista) {
  const w = cfg_().web;
  if (!w || !Array.isArray(lista)) return [];
  return lista.filter(n => /^[\w.-]+\.pdf$/i.test(n)).slice(0, 3).map(n => {
    try {
      const r = UrlFetchApp.fetch(w + "/" + n, { muteHttpExceptions: true });
      return r.getResponseCode() === 200 ? r.getBlob().setName(n.replace("tarifas-2026", "Tarifas 2026 · Patri S. Rodeiro")) : null;
    } catch (e) { return null; }
  }).filter(Boolean);
}

function logo_() {
  const w = cfg_().web;
  if (!w) return null;
  try {
    const r = UrlFetchApp.fetch(w + "/logo.png", { muteHttpExceptions: true });
    return r.getResponseCode() === 200 ? r.getBlob().setName("logo.png") : null;
  } catch (e) { return null; }
}

/* ---------------- Recordatorios automáticos ---------------- */
function enviarRecordatorios() {
  const c = cfg_();
  const token = loginBot_(c);
  const sig = siguienteLaborable_();
  const filas = get_(c, token, "/rest/v1/sesiones?select=id,data&" + encodeURIComponent("data->>fecha") + "=eq." + sig);
  const pend = filas.filter(r => r.data && r.data.estado !== "cancelada" && !r.data.recordatorioEnviado);
  if (!pend.length) return;
  const ids = pend.map(r => r.data.clienteId).filter((v, i, a) => v && a.indexOf(v) === i);
  const aj = get_(c, token, "/rest/v1/ajustes?select=id,data&id=eq.tarifas");
  const tarifas = aj.length && aj[0].data && Array.isArray(aj[0].data.lista) ? aj[0].data.lista : [];
  const clientes = {};
  get_(c, token, "/rest/v1/clientes?select=id,data&id=in.(" + ids.map(encodeURIComponent).join(",") + ")").forEach(r => { clientes[r.id] = r.data; });
  pend.forEach(r => {
    const cl = clientes[r.data.clienteId];
    if (!cl || !cl.email) return; // sin email: se envía a mano por WhatsApp desde la agenda
    try {
      enviar_(cl.email, datosRecordatorio_(r.data, cl, tarifas));
      const ahora = new Date().toISOString();
      patch_(c, token, r.id, Object.assign({}, r.data, { recordatorioEnviado: true, recordatorioAuto: ahora, modPor: "Envío automático", modEn: ahora }));
    } catch (e) { console.error("Error con la sesión " + r.id + ": " + e); }
  });
}

function eur_(n) { n = Number(n) || 0; return (n % 1 ? n.toFixed(2).replace(".", ",") : String(n)) + " €"; }
function tipoTarifa_(t) { return t.tipo || (t.sesiones > 1 ? "bono" : "sesion"); }
function precio_(s, cl, tarifas) {
  if (s.precio != null && s.precio !== "") return eur_(s.precio);
  if (s.tipo === "valoracion") { const v = tarifas.find(t => t.id === "t26-val") || tarifas.find(t => /valoraci/i.test(t.nombre)); return eur_(v ? v.precio : 60); }
  const t = cl.tarifaId ? tarifas.find(x => x.id === cl.tarifaId) : null;
  if (!t) { const su = tarifas.find(x => x.id === "t26-suelta") || tarifas.find(x => tipoTarifa_(x) === "sesion" && /suelta/i.test(x.nombre)); return su ? eur_(su.precio) : ""; }
  const tp = tipoTarifa_(t);
  if (tp === "sesion") return eur_(t.precio);
  if (tp === "mes") return "Incluida en tu plan mensual (" + t.nombre + " · " + eur_(t.precio) + "/mes, pago el día 1)";
  return "Incluida en tu " + t.nombre + " (" + eur_(t.precio) + ")";
}

function datosRecordatorio_(s, cl, tarifas) {
  const d = fecha_(s.fecha);
  const manana = s.fecha === ymd_(sumarDias_(hoy_(), 1));
  const dia = DIAS[d.getUTCDay()], n = d.getUTCDate();
  const antes = DIAS[sumarDias_(d, -1).getUTCDay()];
  const val = s.tipo === "valoracion";
  const lineas = [["Tipo", val ? "Valoración funcional · 60 min" : "Sesión de readaptación · 45 min"], ["Día", cap_(dia) + " " + n + " de " + MESES[d.getUTCMonth()]], ["Hora", s.hora], ["Lugar", LUGAR]];
  const pr = precio_(s, cl, tarifas || []);
  if (pr) lineas.push(["Precio", pr]);
  return {
    tipo: "recordatorio", etiqueta: "Recordatorio", titulo: manana ? "Nos vemos mañana" : "Nos vemos el " + dia,
    nombre: String(cl.nombre || "").split(" ")[0],
    asunto: "Recordatorio: tu " + (val ? "valoración" : "sesión") + " " + (manana ? "de mañana" : "del " + dia) + " a las " + s.hora,
    intro: "te recuerdo tu " + (val ? "valoración funcional" : "sesión") + " " + (manana ? "mañana, " + dia + " " + n + "," : "del " + dia + " " + n) + " a las " + s.hora + "." + (val ? " Ven con ropa cómoda para hacer los tests." : ""),
    lineas: lineas,
    nota: "Si necesitas cancelar, avísame " + (manana ? "hoy antes de las " + s.hora : "antes del " + antes + " a las " + s.hora) + " respondiendo a este correo. " + CANCELACION
  };
}

/* ---------------- Supabase ---------------- */
function loginBot_(c) {
  const r = UrlFetchApp.fetch(c.url + "/auth/v1/token?grant_type=password", {
    method: "post", contentType: "application/json", headers: { apikey: c.key },
    payload: JSON.stringify({ email: c.botEmail, password: c.botPass }), muteHttpExceptions: true
  });
  if (r.getResponseCode() !== 200) throw new Error("No se puede entrar con el usuario robot: " + r.getContentText());
  return JSON.parse(r.getContentText()).access_token;
}
function get_(c, token, path) {
  const r = UrlFetchApp.fetch(c.url + path, { headers: { apikey: c.key, Authorization: "Bearer " + token }, muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) throw new Error("Error leyendo datos: " + r.getContentText());
  return JSON.parse(r.getContentText());
}
function patch_(c, token, id, data) {
  const r = UrlFetchApp.fetch(c.url + "/rest/v1/sesiones?id=eq." + encodeURIComponent(id), {
    method: "patch", contentType: "application/json", headers: { apikey: c.key, Authorization: "Bearer " + token },
    payload: JSON.stringify({ data: data }), muteHttpExceptions: true
  });
  if (r.getResponseCode() >= 300) throw new Error("Error guardando: " + r.getContentText());
}

/* ---------------- Fechas (hora de Madrid) ---------------- */
function hoy_() { return fecha_(Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd")); }
function fecha_(s) { const p = s.split("-").map(Number); return new Date(Date.UTC(p[0], p[1] - 1, p[2], 12)); }
function sumarDias_(d, n) { return new Date(d.getTime() + n * 86400000); }
function ymd_(d) { return d.getUTCFullYear() + "-" + ("0" + (d.getUTCMonth() + 1)).slice(-2) + "-" + ("0" + d.getUTCDate()).slice(-2); }
function siguienteLaborable_() { let d = sumarDias_(hoy_(), 1); if (d.getUTCDay() === 0) d = sumarDias_(d, 1); return ymd_(d); }
function cap_(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* ---------------- Instalación y pruebas ---------------- */
/** Ejecútala una vez: programa los recordatorios diarios. */
function instalarRecordatorios() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === "enviarRecordatorios").forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("enviarRecordatorios").timeBased().everyDays(1).atHour(cfg_().hora).nearMinute(0).inTimezone(TZ).create();
  console.log("Listo: los recordatorios se enviarán cada día sobre las " + cfg_().hora + ":00.");
}

/** Te envía a ti misma un correo de ejemplo para ver el diseño. */
function probarCorreo() {
  const yo = Session.getEffectiveUser().getEmail();
  enviar_(yo, {
    tipo: "reserva", etiqueta: "Reserva confirmada", titulo: "Tu próxima sesión", nombre: "Patri",
    asunto: "Prueba · Reserva confirmada", intro: "te confirmo tu próxima sesión de readaptación:",
    lineas: [["Día", "Lunes 5 de octubre"], ["Hora", "10:00"], ["Lugar", LUGAR], ["Sesión", "3 de 8 de octubre"], ["Tarifa", "Postoperatorio · Fase intensiva · 400 €/mes (pago el día 1 de cada mes)"]],
    nota: "Si no puedes venir, avísame con al menos 24 horas de antelación respondiendo a este correo. " + CANCELACION
  });
  console.log("Correo de prueba enviado a " + yo);
}

/* ---------------- Diseño del correo ---------------- */
function e_(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

function textoPlano(d) {
  return "Hola " + d.nombre + ", " + d.intro + "\n\n" + d.lineas.map(l => "· " + l[0] + ": " + l[1]).join("\n") + "\n\n" + d.nota +
    "\n\nUn saludo,\n\n" + FIRMA.nombre + "\n" + FIRMA.titulo + "\n" + FIRMA.telefono + " · " + FIRMA.email + "\n" + FIRMA.lugar;
}

function plantilla(d, logoSrc) {
  const F = "font-family:Arial,Helvetica,sans-serif;";
  const filas = d.lineas.map((l, i) =>
    '<tr><td style="' + F + 'padding:11px 16px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#687288;width:92px;vertical-align:top;' + (i ? "border-top:1px solid #E0E3EA;" : "") + '">' + e_(l[0]) + '</td>' +
    '<td style="' + F + 'padding:10px 16px;font-size:15px;line-height:21px;font-weight:bold;color:#14213D;' + (i ? "border-top:1px solid #E0E3EA;" : "") + '">' + e_(l[1]) + '</td></tr>').join("");
  const cv = FIRMA.cv.map(l => '<tr><td style="' + F + 'padding:0 0 3px 0;font-size:12.5px;line-height:18px;color:#3A4760"><span style="color:#F5B700;font-weight:bold">&#9656;</span>&nbsp; ' + e_(l) + '</td></tr>').join("");
  const cabecera = logoSrc
    ? '<img src="' + logoSrc + '" width="240" height="60" alt="Patri S. Rodeiro · Readaptación y rendimiento" style="display:block;border:0;width:240px;height:60px">'
    : '<div style="' + F + 'font-size:22px;font-weight:bold;color:#ffffff">Patri S. Rodeiro</div><div style="' + F + 'font-size:10px;letter-spacing:2px;color:#A9B4C4;text-transform:uppercase">Readaptación · Rendimiento</div>';

  return '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + e_(d.asunto) + '</title></head>' +
  '<body style="margin:0;padding:0;background:#F3F4F7">' +
  '<div style="display:none;max-height:0;overflow:hidden">' + e_(d.lineas.slice(0, 2).map(l => l[1]).join(" · ")) + '</div>' +
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3F4F7"><tr><td align="center" style="padding:24px 12px">' +
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #E0E3EA">' +
    '<tr><td style="background:#14213D;padding:18px 24px">' + cabecera + '</td></tr>' +
    '<tr><td style="height:4px;background:#F5B700;font-size:0;line-height:0">&nbsp;</td></tr>' +
    '<tr><td style="padding:26px 24px 6px 24px">' +
      '<div style="' + F + 'font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#687288;font-weight:bold">' + e_(d.etiqueta) + '</div>' +
      '<div style="' + F + 'font-size:23px;line-height:29px;font-weight:bold;color:#14213D;margin:6px 0 12px 0">' + e_(d.titulo) + '</div>' +
      '<div style="' + F + 'font-size:15px;line-height:22px;color:#3A4760;margin:0 0 16px 0">Hola ' + e_(d.nombre) + ', ' + e_(d.intro) + '</div>' +
    '</td></tr>' +
    '<tr><td style="padding:0 24px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F7F8FA;border:1px solid #E0E3EA;border-radius:10px">' + filas + '</table></td></tr>' +
    '<tr><td style="padding:18px 24px 4px 24px"><div style="' + F + 'font-size:13.5px;line-height:20px;color:#3A4760;border-left:3px solid #F5B700;padding:2px 0 2px 12px">' + e_(d.nota) + '</div></td></tr>' +
    '<tr><td style="padding:22px 24px 6px 24px;' + F + 'font-size:15px;color:#3A4760">Un saludo,</td></tr>' +
    '<tr><td style="padding:14px 24px 24px 24px"><table role="presentation" cellpadding="0" cellspacing="0" border="0">' +
      '<tr><td style="' + F + 'font-size:15px;line-height:20px;font-weight:bold;color:#14213D">' + e_(FIRMA.nombre) + '</td></tr>' +
      '<tr><td style="' + F + 'padding:2px 0 8px 0;font-size:13px;line-height:18px;color:#687288">' + e_(FIRMA.titulo) + '</td></tr>' +
      '<tr><td style="padding:0 0 8px 0"><div style="width:44px;height:3px;background:#F5B700;font-size:0;line-height:3px">&nbsp;</div></td></tr>' + cv +
      '<tr><td style="' + F + 'padding:10px 0 0 0;font-size:12.5px;line-height:18px;color:#14213D">&#128222; ' + e_(FIRMA.telefono) + ' &nbsp;·&nbsp; &#9993;&#65039; <a href="mailto:' + e_(FIRMA.email) + '" style="color:#14213D">' + e_(FIRMA.email) + '</a></td></tr>' +
      '<tr><td style="' + F + 'padding:2px 0 0 0;font-size:12.5px;line-height:18px;color:#14213D">&#128205; ' + e_(FIRMA.lugar) + '</td></tr>' +
    '</table></td></tr>' +
    '<tr><td style="background:#F7F8FA;border-top:1px solid #E0E3EA;padding:14px 24px;' + F + 'font-size:10.5px;line-height:15px;color:#9AA2B2">Este mensaje y sus adjuntos son confidenciales y van dirigidos solo a su destinatario. Tus datos se tratan para gestionar tus citas y no se ceden a terceros. Puedes ejercer tus derechos de acceso, rectificación y supresión respondiendo a este correo.</td></tr>' +
  '</table></td></tr></table></body></html>';
}
