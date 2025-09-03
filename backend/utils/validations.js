// backend/utils/validations.js

const validator = require("validator");

// --- Regex generales ---
const regexNombre = /^[A-ZÁÉÍÓÚÑ\s]+$/;
const regexUsuario = /^[A-Z0-9_]{4,15}$/;
const regexCorreo = /^[^\s@]+@(gmail\.com|hotmail\.com|outlook\.com)$/;
const regexCURP = /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/;
const regexRFC = /^([A-ZÑ&]{3})(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([A-Z\d]{2})([A\d])$|^([A-ZÑ&]{4})(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([A-Z\d]{2})([A\d])$/;

// --- Auxiliares para fechas del CURP ---
function obtenerDatosFechaCURP(CURP) {
  const fecha = CURP.substring(4, 10); // AAMMDD
  const anio = parseInt(fecha.substring(0, 2), 10);
  const mes = parseInt(fecha.substring(2, 4), 10);
  const dia = parseInt(fecha.substring(4, 6), 10);
  const fullYear = anio >= 0 && anio <= 25 ? 2000 + anio : 1900 + anio;

  const fechaValida = new Date(`${fullYear}-${mes}-${dia}`);
  const esFebrero29 = mes === 2 && dia === 29;
  const esBisiesto = (fullYear % 4 === 0 && fullYear % 100 !== 0) || (fullYear % 400 === 0);

  return { fullYear, mes, dia, fechaValida, esFebrero29, esBisiesto };
}

// --- Auxiliares para fechas del RFC ---
function obtenerDatosFechaRFC(RFC) {
  const fecha = RFC.length === 13 ? RFC.substring(4, 10) : RFC.substring(3, 9);
  const anio = parseInt(fecha.substring(0, 2), 10);
  const mes = parseInt(fecha.substring(2, 4), 10);
  const dia = parseInt(fecha.substring(4, 6), 10);
  const fullYear = anio >= 0 && anio <= 25 ? 2000 + anio : 1900 + anio;

  const fechaValida = new Date(`${fullYear}-${mes}-${dia}`);
  const esFebrero29 = mes === 2 && dia === 29;
  const esBisiesto = (fullYear % 4 === 0 && fullYear % 100 !== 0) || (fullYear % 400 === 0);

  return { fullYear, mes, dia, fechaValida, esFebrero29, esBisiesto };
}

// --- Validadores principales ---
// --- Validar nombre ---
function validarNombre(nombre) {
  if (!nombre) return "El nombre es obligatorio.";
  if (nombre.length > 50) return "El nombre no debe exceder 50 caracteres.";
  if (!regexNombre.test(nombre)) return "El nombre solo debe contener letras.";
  return null;
}
// --- Validar usuario ---
function validarUsuario(usuario) {
  if (!usuario) return "El usuario es obligatorio.";
  if (!regexUsuario.test(usuario)) return "El usuario debe tener entre 4 y 15 caracteres alfanuméricos o guion bajo en mayúsculas.";
  return null;
}
// --- Validar correo ---
function validarCorreo(correo) {
  if (!correo) return "El correo es obligatorio.";
  if (!regexCorreo.test(correo)) return "El correo debe terminar en @gmail.com, @hotmail.com o @outlook.com.";
  if (!validator.isEmail(correo)) return "Correo electrónico no válido.";
  return null;
}
// --- Validar contraseña ---
function validarPassword(password) {
  if (!password) return "La contraseña es obligatoria.";
  if (!validator.isStrongPassword(password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
    return "La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y un caracter especial.";
  }
  return null;
}
// --- Validar CURP ---
function validarCURP(CURP) {
  if (!CURP) return "La CURP es obligatoria.";
  if (CURP.length !== 18) return "La CURP debe tener exactamente 18 caracteres.";
  if (!regexCURP.test(CURP)) return "CURP no válido. Formato incorrecto.";
    // Validar fecha de nacimiento en CURP
  const { fullYear, mes, dia, fechaValida, esFebrero29, esBisiesto } = obtenerDatosFechaCURP(CURP);
  if (
    fechaValida.getFullYear() !== fullYear ||
    fechaValida.getMonth() + 1 !== mes ||
    fechaValida.getDate() !== dia
  ) {// manejo de errores
    return esFebrero29 && !esBisiesto
      ? "CURP no válido. El año no es bisiesto."
      : "CURP no válido. Fecha de nacimiento inválida.";
  }
  return null;
}
// --- Validar RFC ---
function validarRFC(RFC) {
  if (!RFC) return "El RFC es obligatorio.";
  if (RFC.length !== 12 && RFC.length !== 13) return "El RFC debe tener 12 o 13 caracteres.";
  if (!regexRFC.test(RFC)) return "RFC no válido. Formato incorrecto.";
    // Validar fecha en RFC
  const { fullYear, mes, dia, fechaValida, esFebrero29, esBisiesto } = obtenerDatosFechaRFC(RFC);
  if (
    fechaValida.getFullYear() !== fullYear ||
    fechaValida.getMonth() + 1 !== mes ||
    fechaValida.getDate() !== dia
  ) {// manejo de errores
    return esFebrero29 && !esBisiesto
      ? "RFC no válido. El año no es bisiesto."
      : "RFC no válido. Fecha inválida.";
  }
  return null;
}
// --- Validar todo el formulario ---
module.exports = {
  validarNombre,
  validarUsuario,
  validarCorreo,
  validarPassword,
  validarCURP,
  validarRFC
};
