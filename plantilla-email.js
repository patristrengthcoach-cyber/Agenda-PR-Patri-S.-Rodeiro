/* Plantilla de correo corporativo · Patri S. Rodeiro (compartida por la agenda y plantillas-email.html) */
(function(){
const LUGAR = "Clínica DCF · Mugardos";
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
function e_(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
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
/* Solo el bloque del correo (para pegar en Gmail) */
function bloque(d, logoSrc){
  const h = plantilla(d, logoSrc);
  const i = h.indexOf('<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px');
  const j = h.lastIndexOf('</table></td></tr></table>');
  return h.slice(i, j) + '</table>';
}
function texto(d){
  return "Hola " + d.nombre + ", " + d.intro + "\n\n" + d.lineas.map(l => "· " + l[0] + ": " + l[1]).join("\n") + "\n\n" + d.nota +
    "\n\nUn saludo,\n\n" + FIRMA.nombre + "\n" + FIRMA.titulo + "\n" + FIRMA.telefono + " · " + FIRMA.email + "\n" + FIRMA.lugar;
}
async function copiar(d){
  const logo = new URL("logo.png", location.href).href;
  const html = bloque(d, logo), plano = texto(d);
  try {
    await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([html], { type:"text/html" }), "text/plain": new Blob([plano], { type:"text/plain" }) })]);
  } catch(e) {
    const box = document.createElement("div"); box.innerHTML = html; box.style.cssText = "position:fixed;left:-9999px;top:0"; document.body.appendChild(box);
    const r = document.createRange(); r.selectNodeContents(box); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
    const ok = document.execCommand("copy"); sel.removeAllRanges(); box.remove(); if (!ok) throw e;
  }
}
window.PlantillaEmail = { plantilla, bloque, texto, copiar, FIRMA, LUGAR };
})();
