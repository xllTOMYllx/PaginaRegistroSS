import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import zxcvbn from 'zxcvbn';
import { validateForm } from '../utils/validations';
import { getPasswordStrength, getStrengthColor, getStrengthText } from "../utils/validations";

function CrearUsuario() {
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [formData, setFormData] = useState({
    NOMBRE: '',
    APELLIDO_PATERNO: '',
    APELLIDO_MATERNO: '',
    CURP: '',
    CORREO: '',
    USUARIO: '',
    CONTRASENA: '',
    RFC: '',
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

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="p-4 rounded-4 shadow bg-white" style={{ width: '100%', maxWidth: '600px' }}>
        <h4 className="text-center mb-3" style={{ color: '#7A1737', fontSize: '30px' }}>CREAR USUARIO</h4>
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

        {/* Botón opcional para volver */}
        <button type="button" className="btn btn-secondary w-100 rounded-3 mt-2" onClick={() => navigate(-1)}>
          ← Regresar
        </button>
      </div>
    </div>
  );
}

export default CrearUsuario;