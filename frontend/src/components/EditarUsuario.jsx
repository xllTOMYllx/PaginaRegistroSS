//librerias necesarias
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/EditarUsuario.css";

// función principal del componente EditarUsuario
function EditarUsuario() {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id_personal: "", // Añadido para incluir el ID si está en location.state
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    curp: "",
    rfc: "",
    correo: "",
    estudios: "",
  });
  // Estados para mensajes y errores
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState({});
  const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwdMsg, setPwdMsg] = useState("");
  const [showPwd, setShowPwd] = useState({ currentPassword: false, newPassword: false, confirmPassword: false });

  // Efecto para cargar los datos del usuario desde location.state
  useEffect(() => {
    if (location.state && location.state.user) {
      setFormData({
        ...location.state.user,
        id_personal: location.state.user.id_personal || "", // Asegura que el ID esté disponible
      });
    }
  }, [location.state]);

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};
    const upperCaseData = {
      nombre: formData.nombre.toUpperCase(),
      apellido_paterno: formData.apellido_paterno.toUpperCase(),
      apellido_materno: formData.apellido_materno.toUpperCase(),
      curp: formData.curp.toUpperCase(),
      rfc: formData.rfc.toUpperCase(),
    };

    // ---Validaciones para cada campo--- //
    //validacion de nombre
    if (!upperCaseData.nombre) newErrors.nombre = "El nombre es obligatorio.";
    else if (upperCaseData.nombre.length > 50)
      newErrors.nombre = "El nombre no debe exceder 50 caracteres.";
    else if (!/^[A-ZÁÉÍÓÚÑ\s]+$/.test(upperCaseData.nombre))
      newErrors.nombre = "El nombre solo debe contener letras en mayúsculas.";

    //validacion de apellido paterno
    if (!upperCaseData.apellido_paterno)
      newErrors.apellido_paterno = "El apellido paterno es obligatorio.";
    else if (upperCaseData.apellido_paterno.length > 50)
      newErrors.apellido_paterno = "El apellido paterno no debe exceder 50 caracteres.";
    else if (!/^[A-ZÁÉÍÓÚÑ\s]+$/.test(upperCaseData.apellido_paterno))
      newErrors.apellido_paterno = "El apellido paterno solo debe contener letras en mayúsculas.";
    
    //validacion de apellido materno
    if (upperCaseData.apellido_materno && !/^[A-ZÁÉÍÓÚÑ\s]+$/.test(upperCaseData.apellido_materno))
      newErrors.apellido_materno = "El apellido materno solo debe contener letras en mayúsculas.";
    else if (upperCaseData.apellido_materno && upperCaseData.apellido_materno.length > 50)
      newErrors.apellido_materno = "El apellido materno no debe exceder 50 caracteres.";
    
    //validacion de curp
    if (!formData.curp) newErrors.curp = "La CURP es obligatoria.";
    else if (!/^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/.test(upperCaseData.curp))
      newErrors.curp = "CURP no válido. Debe tener 18 caracteres: 4 letras, 6 dígitos y 8 alfanuméricos.";
    
    //validacion de rfc
    if (!formData.rfc) newErrors.rfc = "El RFC es obligatorio.";
    else if (!/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(upperCaseData.rfc))
      newErrors.rfc = "RFC no válido. Debe tener 12 o 13 caracteres: 3-4 letras, 6 dígitos y 3 alfanuméricos.";
    
    //validacion de estudios no se requiere ya que es un select

    //validacion de correo
    if (!formData.correo) newErrors.correo = "El correo es obligatorio.";
    else if (!/^[^\s@]+@(gmail\.com)$/.test(formData.correo))
      newErrors.correo = "El correo debe terminar en @gmail.com.";

    return newErrors;
  };

  // Manejo del cambio en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "nombre" || name === "apellido_paterno" || name === "apellido_materno" || name === "curp" || name === "rfc" ? value.toUpperCase() : value,
    }));
    setError({ ...error, [name]: "" }); // Limpia el error al cambiar
  };

  // Manejo del envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError({});
    // Validar el formulario antes de enviarlo
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return;
    }
    // Enviar datos al backend
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/users/${formData.id_personal}`,
        formData,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );
      // Refrescar usuario con rol desde /me para mantener sesión consistente
      let updatedUser = response.data.user;
      try {
        if (token) {
          const meRes = await axios.get('http://localhost:5000/api/users/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          updatedUser = meRes.data || updatedUser;
          localStorage.setItem('usuario', JSON.stringify(updatedUser));
        }
      } catch {}

      setMensaje("Datos actualizados correctamente.");
      // Mantenerse en la misma vista y reflejar datos actualizados
      setFormData((prev) => ({ ...prev, ...updatedUser }));
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data.error) {
        setError({ general: err.response.data.error });
      } else {
        setError({ general: "Error al actualizar los datos. Intenta de nuevo." });
      }
    }
  };

  // Manejo de cambio de contraseña
  const handlePwdChange = (e) => {
    const { name, value } = e.target;
    setPwdForm((p) => ({ ...p, [name]: value }));
    setPwdMsg("");
  };

  const toggleShow = (field) => {
    setShowPwd((s) => ({ ...s, [field]: !s[field] }));
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    setPwdMsg("");

    // Validaciones básicas
    if (!pwdForm.newPassword) return setPwdMsg('La nueva contraseña es requerida.');
    // Reglas de fortaleza: mínimo 8, mayúscula, minúscula, número y símbolo
    const strongPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!strongPwd.test(pwdForm.newPassword)) {
      return setPwdMsg('La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula, número y símbolo.');
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) return setPwdMsg('Las contraseñas no coinciden.');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:5000/api/users/${formData.id_personal}/password`, {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword
      }, { headers: { Authorization: `Bearer ${token}` } });

      setPwdMsg(res.data.message || 'Contraseña actualizada.');
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwdMsg(err.response?.data?.error || 'Error al actualizar la contraseña.');
    }
  };

//pagina de edición de usuario
  return ( // Contenedor principal
    <div className="editar-page">
      <div className="top-image-container">
        <img
          src={encodeURI('/ImagenSesver.png')}
          alt="Imagen superior"
          className="top-image"
        />
      </div>
      <nav className="navbar navbar-light shadow-sm mb-4 home-navbar editar-navbar">
        <div className="container-fluid d-flex align-items-center flex-nowrap gap-2 navbar-actions"></div>
      </nav>
      <div className="container py-5">
      <div>
        {/* Botón para regresar a la página de inicio */}
        <button
          onClick={() => {
            const stored = (() => { try { return JSON.parse(localStorage.getItem('usuario')); } catch { return null; } })();
            const rol = Number(stored?.rol);
            const route = rol === 2 ? '/usuarios' : rol === 3 ? '/homeadmin' : rol === 4 ? '/homeadmin4' : '/home';
            navigate(route, { state: { user: formData } });
          }}
          className="btn editar-back-btn"
        >
          Regresar
        </button>
      </div>

      {/* Encabezado de la página */}
      <div className="row justify-content-center editar-row">
        <div className="col-12 col-md-8 col-lg-6">
          <h3 className="mb-4 text-center editar-title">
            Editar Datos Personales
          </h3>
          {/* Formulario de edición */}
          <form onSubmit={handleSubmit}>
            {["nombre", "apellido_paterno", "apellido_materno", "curp", "rfc", "correo"].map((field) => (
              <div className="mb-3" key={field}>
                <label className="form-label text-capitalize">
                  {field.replace("_", " ")}
                </label>
                <input
                  type="text"
                  name={field}
                  value={formData[field] || ""}
                  onChange={handleChange}
                  className="form-control rounded-3"
                  required
                />
                {error[field] && <div className="text-danger small mt-1">{error[field]}</div>}
              </div>
            ))}
            
            {/* Campo de estudios */}
            <div className="mb-3">
              <label className="form-label">Estudios</label>
              <select
                name="estudios"
                value={formData.estudios || ""}
                onChange={handleChange}
                className="form-control rounded-3"
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
              {error.estudios && <div className="text-danger small mt-1">{error.estudios}</div>}
            </div>
            
            {/* Botón para enviar el formulario y guardar cambios */}
            <button
              type="submit"
              className="btn w-100 editar-submit-btn"
            >
              Guardar Cambios
            </button>

            {/* Mensajes de éxito o error */}
            {mensaje && <div className="alert alert-success mt-3 text-center">{mensaje}</div>}
            {error.general && <div className="alert alert-danger mt-3 text-center">{error.general}</div>}
          </form>

          <hr className="my-4" />

          <h5 className="mb-3 text-center editar-subtitle">Cambiar contraseña</h5>
          <form onSubmit={handlePwdSubmit}>
            <div className="mb-2">
              <label className="form-label">Contraseña actual</label>
              <div className="d-flex align-items-center">
                <input type={showPwd.currentPassword ? 'text' : 'password'} name="currentPassword" value={pwdForm.currentPassword} onChange={handlePwdChange} className="form-control" />
                <button type="button" aria-label="Ver contraseña actual" className="btn btn-sm btn-outline-secondary ms-2" onClick={() => toggleShow('currentPassword')}>
                  {showPwd.currentPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>
            <div className="mb-2">
              <label className="form-label">Nueva contraseña</label>
              <div className="d-flex align-items-center">
                <input type={showPwd.newPassword ? 'text' : 'password'} name="newPassword" value={pwdForm.newPassword} onChange={handlePwdChange} className="form-control" />
                <button type="button" aria-label="Ver nueva contraseña" className="btn btn-sm btn-outline-secondary ms-2" onClick={() => toggleShow('newPassword')}>
                  {showPwd.newPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
              <div className="form-text text-muted mt-1">
                Debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Confirmar nueva contraseña</label>
              <div className="d-flex align-items-center">
                <input type={showPwd.confirmPassword ? 'text' : 'password'} name="confirmPassword" value={pwdForm.confirmPassword} onChange={handlePwdChange} className="form-control" />
                <button type="button" aria-label="Ver confirmar contraseña" className="btn btn-sm btn-outline-secondary ms-2" onClick={() => toggleShow('confirmPassword')}>
                  {showPwd.confirmPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>
            {pwdMsg && (
              <div className={`text-center mb-2 editar-pwd-msg ${pwdMsg.includes('actualizada') ? 'pwd-success' : 'pwd-error'}`}>
                {pwdMsg}
              </div>
            )}
            <button type="submit" className="btn w-100 editar-submit-btn">Actualizar contraseña</button>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
}

export default EditarUsuario;