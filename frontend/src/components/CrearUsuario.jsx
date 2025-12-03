import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import zxcvbn from 'zxcvbn';
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
      });
      setMensaje('Usuario creado correctamente');
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
                    <option value="Primaria">Primaria</option>
                    <option value="Secundaria">Secundaria</option>
                    <option value="Preparatoria">Preparatoria</option>
                    <option value="Licenciatura">Licenciatura</option>
                    <option value="Maestría">Maestría</option>
                    <option value="Doctorado">Doctorado</option>
                    <option value="prefiero no decirlo">Prefiero no decirlo</option>
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
                    <option value="1">Usuario normal</option>
                    <option value="2">Supervisor</option>
                    <option value="3">Administrador</option>
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