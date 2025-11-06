// src/utils/validations.js
import zxcvbn from "zxcvbn";

// --- Contraseña ---
export function validatePassword(password) {
  if (!password) return "La contraseña es obligatoria.";
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
    return "La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números.";
  }
  return null; // ✅ válida
}

// --- Fuerza de la contraseña ---
export function getPasswordStrength(password) {
  const result = zxcvbn(password);
  return result.score; // 0 (muy débil) a 4 (fuerte)
}

// --- Color de barra de progreso ---
export function getStrengthColor(score) {
  switch (score) {
    case 0: return "bg-danger";
    case 1: return "bg-warning";
    case 2: return "bg-info";
    case 3: return "bg-primary";
    case 4: return "bg-success";
    default: return "bg-secondary";
  }
}

// --- Texto de la fuerza ---
export function getStrengthText(score) {
  return ["Muy débil", "Débil", "Regular", "Buena", "Fuerte"][score];
}

// --- Regex generales ---
const regexNombre = /^[A-ZÁÉÍÓÚÑ\s]+$/;
const regexUsuario = /^[A-Z0-9_]{4,15}$/;
const regexCorreo = /^[^\s@]+@(gmail\.com)$/;
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

// --- Validaciones principales ---
export function validateForm(formData) {
  const newErrors = {};
  const upperCaseData = {
    ...formData,
    NOMBRE: formData.NOMBRE.toUpperCase(),
    APELLIDO_PATERNO: formData.APELLIDO_PATERNO.toUpperCase(),
    APELLIDO_MATERNO: formData.APELLIDO_MATERNO.toUpperCase(),
    USUARIO: formData.USUARIO.toUpperCase(),
    CURP: formData.CURP.toUpperCase(),
    RFC: formData.RFC.toUpperCase(),
  };

  // Nombre
  if (!upperCaseData.NOMBRE) newErrors.NOMBRE = 'El nombre es obligatorio.';
  else if (upperCaseData.NOMBRE.length > 50) newErrors.NOMBRE = 'El nombre no debe exceder 50 caracteres.';
  else if (!regexNombre.test(upperCaseData.NOMBRE)) newErrors.NOMBRE = 'El nombre solo debe contener letras en mayúsculas.';

  // Apellido paterno
  if (!upperCaseData.APELLIDO_PATERNO) newErrors.APELLIDO_PATERNO = 'El apellido paterno es obligatorio.';
  else if (upperCaseData.APELLIDO_PATERNO.length > 50) newErrors.APELLIDO_PATERNO = 'El apellido paterno no debe exceder 50 caracteres.';
  else if (!regexNombre.test(upperCaseData.APELLIDO_PATERNO)) newErrors.APELLIDO_PATERNO = 'El apellido paterno solo debe contener letras en mayúsculas.';

  // Apellido materno
  if (!upperCaseData.APELLIDO_MATERNO) newErrors.APELLIDO_MATERNO = 'El apellido materno es obligatorio.';
  else if (upperCaseData.APELLIDO_MATERNO.length > 50) newErrors.APELLIDO_MATERNO = 'El apellido materno no debe exceder 50 caracteres.';
  else if (!regexNombre.test(upperCaseData.APELLIDO_MATERNO)) newErrors.APELLIDO_MATERNO = 'El apellido materno solo debe contener letras en mayúsculas.';


  // Usuario
  if (!upperCaseData.USUARIO) newErrors.USUARIO = 'El usuario es obligatorio.';
  else if (!regexUsuario.test(upperCaseData.USUARIO)) {
    newErrors.USUARIO = 'El usuario debe tener entre 4 y 15 caracteres alfanuméricos o guion bajo en mayúsculas.';
  }

  // Contraseña
  if (!formData.CONTRASENA) newErrors.CONTRASENA = 'La contraseña es obligatoria.';
  else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(formData.CONTRASENA)) {
    newErrors.CONTRASENA = 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números.';
  }

  // Correo
  if (!formData.CORREO) newErrors.CORREO = 'El correo es obligatorio.';
  else if (!regexCorreo.test(formData.CORREO)) {
    newErrors.CORREO = 'El correo debe terminar en @gmail.com.';
  }

  // CURP
  if (!upperCaseData.CURP) {
    newErrors.CURP = 'La CURP es obligatoria.';
  } else if (upperCaseData.CURP.length !== 18) {
    newErrors.CURP = 'La CURP debe tener exactamente 18 caracteres.';
  } else if (!regexCURP.test(upperCaseData.CURP)) {
    newErrors.CURP = 'CURP no válido. Formato incorrecto.';
  } else {
    const { fullYear, mes, dia, fechaValida, esFebrero29, esBisiesto } = obtenerDatosFechaCURP(upperCaseData.CURP);
    if (
      fechaValida.getFullYear() !== fullYear ||
      fechaValida.getMonth() + 1 !== mes ||
      fechaValida.getDate() !== dia
    ) {
      newErrors.CURP = esFebrero29 && !esBisiesto
        ? 'CURP no válido. El año no es bisiesto, 29 de febrero no es válido.'
        : 'CURP no válido. Fecha de nacimiento inválida.';
    }
  }

  // RFC
  if (!upperCaseData.RFC) {
    newErrors.RFC = 'El RFC es obligatorio.';
  } else if (upperCaseData.RFC.length !== 12 && upperCaseData.RFC.length !== 13) {
    newErrors.RFC = 'El RFC debe tener 12 o 13 caracteres.';
  } else if (!regexRFC.test(upperCaseData.RFC)) {
    newErrors.RFC = 'RFC no válido. Formato incorrecto.';
  } else {
    const { fullYear, mes, dia, fechaValida, esFebrero29, esBisiesto } = obtenerDatosFechaRFC(upperCaseData.RFC);
    if (
      fechaValida.getFullYear() !== fullYear ||
      fechaValida.getMonth() + 1 !== mes ||
      fechaValida.getDate() !== dia
    ) {
      newErrors.RFC = esFebrero29 && !esBisiesto
        ? 'RFC no válido. El año no es bisiesto, 29 de febrero no es valido.'
        : 'RFC no válido. Fecha inválida.';
    }
  }
  return newErrors;

}
