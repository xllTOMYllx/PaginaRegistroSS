import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import zxcvbn from 'zxcvbn';
import jsPDF from 'jspdf';
import { validateForm } from '../utils/validations';
import { getPasswordStrength, getStrengthColor, getStrengthText } from "../utils/validations";
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

function CrearUsuario() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    // Ensure localStorage and context are in sync
    try {
      const stored = localStorage.getItem('usuario');
      if (!user && stored) setUser(JSON.parse(stored));
    } catch (e) {
      // ignore
    }
  }, [user, setUser]);

  // Si el usuario autenticado es Supervisor (rol 2), preseleccionar rol 1
  useEffect(() => {
    if (user?.rol === 2) {
      setFormData((prev) => ({ ...prev, ROL: '1' }));
    }
  }, [user]);

  const [formData, setFormData] = useState({
    NOMBRE: '',
    APELLIDO_PATERNO: '',
    APELLIDO_MATERNO: '',
    CURP: '',
    CORREO: '',
    USUARIO: '',
    CONTRASENA: '',
    RFC: '',
    ESTUDIOS: '',
    ROL: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'CORREO' || name === 'CONTRASENA' || name === 'ROL') ? value : value.toUpperCase()
    }));
    if (name === 'CONTRASENA') {
      setPasswordStrength(getPasswordStrength(value));
    }
    setError({ ...error, [name]: '' });
  };

  // Función para descargar el PDF de Carta Responsiva con datos del usuario
  const descargarPDF = async (datosUsuario) => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = 10;

    // Cargar imagen desde /public y dibujarla en el PDF (manteniendo proporción)
    const loadImageAsDataUrl = async (src) => {
      const response = await fetch(src);
      if (!response.ok) throw new Error('No se pudo cargar el logo');
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };

    const addLogo = async (src, format, targetY, fallback) => {
      try {
        const dataUrl = await loadImageAsDataUrl(src);
        const img = new Image();
        img.src = dataUrl;
        await img.decode();

        const maxW = 120; // más ancho para mejor nitidez
        const maxH = 50;
        let w = img.width;
        let h = img.height;
        const ratio = Math.min(maxW / w, maxH / h, 1);
        w = w * ratio;
        h = h * ratio;

        const x = pageWidth / 2 - w / 2;
        doc.addImage(dataUrl, format, x, targetY, w, h);
        return true;
      } catch (e) {
        if (fallback) fallback();
        return false;
      }
    };

    const logoSrc = '/ImagenSesver.png'; // coloca tu logo en frontend/public/ImagenSesver.png

    await addLogo(logoSrc, 'PNG', yPosition, () => {
      // Respaldo en texto si no se encuentra el logo
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(139, 0, 0);
      doc.text('SECRETARÍA DE SALUD', pageWidth / 2, yPosition + 10, { align: 'center' });
    });

    // Línea separadora
    doc.setDrawColor(139, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition + 22, pageWidth - margin, yPosition + 22);

    yPosition = 40;

    // Título del documento
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('CARTA RESPONSIVA', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    // Fecha
    const hoy = new Date();
    const dia = hoy.getDate();
    const mes = hoy.toLocaleString('es-MX', { month: 'long' });
    const anio = hoy.getFullYear();
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(
      `Veracruz de Ignacio de la Llave, a ${dia} de ${mes} de ${anio}`,
      pageWidth / 2,
      yPosition,
      { align: 'center' }
    );
    yPosition += 12;

    // Texto principal con datos rellenados
    const textoCompleto = `El (la) suscrito(a) ${datosUsuario.NOMBRE} ${datosUsuario.APELLIDO_PATERNO} ${datosUsuario.APELLIDO_MATERNO}, con Clave Única de Registro de Población ${datosUsuario.CURP}, persona física, mayor de edad, adscrito(a) a la Secretaría de Salud del Estado de Veracruz, Subdirección de Planeación, confirmo que, con esta fecha, recibo clave de usuario "${datosUsuario.USUARIO}" y contraseña "${datosUsuario.CONTRASENA}" para acceder al «Sistema de Expediente Académico», de aquí en adelante denominado el sistema; por lo que me hago responsable del buen uso de éstas, en el entendido de que son personales e intransferibles, es decir, bajo ningún concepto podré prestar mi clave y contraseña a otra persona, siendo de mi entera responsabilidad el mal uso de las mismas.

Que es mi obligación solicitar la baja de la clave al momento de ya no requerir el acceso al sistema, en el entendido de que aun posterior a esta baja seré obligado(a) a mantener la confidencialidad de la información a la que haya tenido acceso. Asimismo, estoy enterado(a) que el (la) administrador(a) de cuentas de acceso al sistema, puede dar de baja mi cuenta ante cualquier irregularidad detectada en su uso.

Manifiesto estar consciente que derivado del ingreso al sistema, tengo acceso a información privilegiada y confidencial, de exclusiva incumbencia al Sistema Nacional de Información en Salud, y su difusión puede tener efectos adversos al mismo en el cumplimiento de las actividades para el que fue creado. Desde este momento convengo de manera expresa, a guardar absoluta confidencialidad de los datos registrados en el sistema, obligándome a no hacer mal uso de los mismos o difundir información alguna a la que tenga acceso.

Estoy enterado(a) que fuera de los criterios y procedimientos a seguir para producir, captar, integrar, procesar, sistematizar, evaluar y divulgar la información en salud establecidos en la Norma Oficial Mexicana NOM-035-SSA3-2012, en materia de información en salud, los datos en el sistema no deberán ser reproducidos por ningún medio (físico o electrónico), ni vinculados con otros dispositivos (fijos o móviles); así como, evitar la interoperabilidad o intercambio con otros sistemas informáticos no certificados bajo la Norma Oficial Mexicana NOM-024-SSA3-2012, Sistemas de información de registro electrónico para la salud, intercambio de información en salud.

Reconozco y acepto que el acceso, uso y difusión de la información se sujetará a los principios de confidencialidad y reserva que establecen las disposiciones vigentes en materia de información como son la Ley del Sistema Nacional de Información Estadística y Geográfica, la Ley Federal de Transparencia y Acceso a la Información Pública Gubernamental, la Ley Federal de Protección de Datos Personales en Posesión de los Particulares y demás disposiciones jurídicas aplicables en materia de transparencia y protección de datos personales.

En caso de que el Organismo determine que, como servidor(a) público(a) pude haber incurrido en responsabilidades por el incumplimiento de los presentes lineamientos, lo hará del conocimiento al Órgano Interno de Control, a efecto de que éste determine lo conducente con base en el capítulo de Responsabilidades y Sanciones establecido en la Ley Federal de Responsabilidades Administrativas de los Servidores Públicos.`;

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    const lineas = doc.splitTextToSize(textoCompleto, pageWidth - 2 * margin);
    
    // Agregar contenido con justificación y manejar saltos de página
    lineas.forEach((linea) => {
      if (yPosition > pageHeight - margin - 40) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(linea, margin, yPosition, { align: 'justify', maxWidth: pageWidth - 2 * margin });
      yPosition += 4.5;
    });

    // Espacio para firma
    yPosition += 10;
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Firmo de conformidad', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;
    
    // Línea para firma
    doc.setLineWidth(0.3);
    doc.setDrawColor(0, 0, 0);
    doc.line(pageWidth / 2 - 40, yPosition, pageWidth / 2 + 40, yPosition);
    yPosition += 5;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('ATENTAMENTE', pageWidth / 2, yPosition, { align: 'center' });

    // Nueva página para datos de acceso
    doc.addPage();
    yPosition = margin + 10;

    // Sección de Liga de acceso al sistema
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Liga de acceso al sistema:', margin, yPosition);
    yPosition += 6;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('""', margin, yPosition);
    yPosition += 10;

    // La clave de acceso es la siguiente
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('La clave de acceso es la siguiente:', margin, yPosition);
    yPosition += 8;

    // Usuario y Contraseña con bullets
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('•', margin + 5, yPosition);
    doc.text(`Usuario: "${datosUsuario.USUARIO}"`, margin + 12, yPosition);
    yPosition += 7;
    
    doc.text('•', margin + 5, yPosition);
    doc.text(`Contraseña: "${datosUsuario.CONTRASENA}"`, margin + 12, yPosition);
    yPosition += 12;

    // Nota sobre contraseña temporal
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const notaTemporal = doc.splitTextToSize(
      'Esta clave fue generada automáticamente por el sistema, misma que es temporal. En su primer ingreso a la aplicación cambie la contraseña por una mas segura.',
      pageWidth - 2 * margin
    );
    notaTemporal.forEach((linea) => {
      doc.text(linea, margin, yPosition, { align: 'justify', maxWidth: pageWidth - 2 * margin });
      yPosition += 5;
    });

    yPosition += 5;

    // Nota de incidencias
    const notaIncidencias = doc.splitTextToSize(
      'En caso de incidencias, dudas o comentarios favor de reportarlos al teléfono "", extensión "".',
      pageWidth - 2 * margin
    );
    notaIncidencias.forEach((linea) => {
      doc.text(linea, margin, yPosition, { align: 'justify', maxWidth: pageWidth - 2 * margin });
      yPosition += 5;
    });

    // Pie de página con datos de contacto
    yPosition = pageHeight - 20;
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('Soconusco #31 Col. Aguacatal', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 4;
    doc.text('C.P. 91130, Xalapa, Veracruz', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 4;
    doc.text('Tel. 01 228 842 3000 ext. 2981', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 4;
    doc.setTextColor(0, 0, 255);
    doc.text('www.ssaver.gob.mx', pageWidth / 2, yPosition, { align: 'center' });

    // Descargar
    const nombreArchivo = `Carta_Responsiva_${datosUsuario.USUARIO}_${new Date().getTime()}.pdf`;
    doc.save(nombreArchivo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError({});
    const newErrors = validateForm(formData);
    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/users/register', {
        ...formData,
        NOMBRE: formData.NOMBRE.toUpperCase(),
        APELLIDO_PATERNO: formData.APELLIDO_PATERNO.toUpperCase(),
        APELLIDO_MATERNO: formData.APELLIDO_MATERNO.toUpperCase(),
        USUARIO: formData.USUARIO.toUpperCase(),
        CURP: formData.CURP.toUpperCase(),
        RFC: formData.RFC.toUpperCase(),
        ESTUDIOS: formData.ESTUDIOS.toUpperCase(),
        ROL: formData.ROL
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensaje('Usuario creado correctamente');
      // Descargar PDF automáticamente tras crear usuario con sus datos
      setTimeout(() => {
        descargarPDF(formData);
      }, 500);
      setFormData({
        NOMBRE: '',
        APELLIDO_PATERNO: '',
        APELLIDO_MATERNO: '',
        CURP: '',
        CORREO: '',
        USUARIO: '',
        CONTRASENA: '',
        RFC: '',
        ESTUDIOS: '',
        ROL: ''
      });
      setPasswordStrength(0);
      setTimeout(() => setMensaje(''), 5000);
    } catch (error) {
      if (error.response && error.response.data.error) {
        setError({ general: error.response.data.error });
      } else {
        setError({ general: 'Error al crear usuario. Intenta de nuevo.' });
      }
    }
  };
  const cerrarSesion = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    if (setUser) setUser(null);
    navigate('/sesion', { replace: true });
  };

  return (
    <div className="d-flex vh-100 crear-usuario-container">
      <Sidebar admin={user} cerrarSesion={cerrarSesion} />
      <main className="flex-grow-1 d-flex flex-column main-content">
        <Navbar hideCrear={user?.rol !== 3} />

        <div className="container mt-4" style={{ maxWidth: "800px" }}>
          <div className="card shadow mb-4">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h4 style={{ color: "#7A1737" }}>CREAR USUARIO</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Campos de datos personales */}
                {["NOMBRE", "APELLIDO_PATERNO", "APELLIDO_MATERNO", "CURP", "RFC", "CORREO", "USUARIO"].map((field, index) => (
                  <div className="mb-3" key={index}>
                    <label className="form-label">{field.replace("_", " ")}</label>
                    <input
                      type={field === "CORREO" ? "email" : "text"}
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      placeholder={`Ingresa ${field.replace("_", " ").toLowerCase()}`}
                      className="form-control rounded-3"
                      required={field !== "APELLIDO_MATERNO"}
                    />
                    {error[field] && <div className="text-danger small mt-1">{error[field]}</div>}
                  </div>
                ))}

                {/* Campo de estudios */}
                <div className="mb-3">
                  <label className="form-label">ESTUDIOS</label>
                  <select
                    name="ESTUDIOS"
                    value={formData.ESTUDIOS}
                    onChange={handleChange}
                    className="form-select rounded-3"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="PRIMARIA">Primaria</option>
                    <option value="SECUNDARIA">Secundaria</option>
                    <option value="PREPARATORIA">Preparatoria</option>
                    <option value="LICENCIATURA">Licenciatura</option>
                    <option value="MAESTRÍA">Maestría</option>
                    <option value="DOCTORADO">Doctorado</option>
                    <option value="PREFIERO NO DECIRLO">Prefiero no decirlo</option>
                  </select>
                  {error.ESTUDIOS && <div className="text-danger small mt-1">{error.ESTUDIOS}</div>}
                </div>

                {/* Campo de contraseña */}
                <div className="mb-4">
                  <label className="form-label">CONTRASEÑA</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="CONTRASENA"
                      value={formData.CONTRASENA}
                      onChange={handleChange}
                      placeholder="Ingresa la contraseña"
                      className="form-control rounded-3"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-end"
                      onClick={togglePasswordVisibility}
                      style={{ zIndex: 1, padding: '0 10px', border: 'none' }}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {error.CONTRASENA && <div className="text-danger small mt-1">{error.CONTRASENA}</div>}
                  <div className="mt-2">
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className={`progress-bar ${getStrengthColor(passwordStrength)}`}
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                        role="progressbar"
                        aria-valuenow={passwordStrength}
                        aria-valuemin="0"
                        aria-valuemax="4"
                      ></div>
                    </div>
                    <small className="text-muted">
                      Fuerza de la contraseña: {getStrengthText(passwordStrength)}
                    </small>
                  </div>
                </div>

                {/* Campo de rol */}
                <div className="mb-3">
                  <label className="form-label">ROL</label>
                  <select
                    name="ROL"
                    value={formData.ROL}
                    onChange={handleChange}
                    className="form-select rounded-3"
                    required
                  >
                    <option value="">Selecciona un rol</option>
                    {/* Si el usuario autenticado es Supervisor (rol 2), solo permitir crear rol 1 */}
                    {user?.rol === 2 ? (
                      <option value="1">Usuario normal</option>
                    ) : (
                      <>
                        <option value="1">Usuario normal</option>
                        <option value="2">Supervisor</option>
                        <option value="3">Administrador</option>
                      </>
                    )}
                  </select>
                  {error.ROL && <div className="text-danger small mt-1">{error.ROL}</div>}
                </div>

                {/* Botón de creación */}
                <button type="submit" className="btn btn-primary w-100 rounded-3" style={{ backgroundColor: '#7A1737', borderColor: '#7A1737' }}>
                  Crear Usuario
                </button>

                {/* Mensajes */}
                {mensaje && <div className="alert alert-success mt-3 text-center">{mensaje}</div>}
                {error.general && <div className="alert alert-danger mt-3 text-center">{error.general}</div>}
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CrearUsuario;