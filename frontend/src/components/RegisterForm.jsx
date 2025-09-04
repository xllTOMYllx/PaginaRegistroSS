
//librerias necesarias
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import zxcvbn from 'zxcvbn';
import { validateForm } from '../utils/validations';
import { getPasswordStrength, getStrengthColor, getStrengthText} from "../utils/validations";

//función principal del componente RegisterForm
function RegisterForm() {
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const [passwordStrength, setPasswordStrength] = useState(0); // Fuerza de la contraseña (0-4)
  const [formData, setFormData] = useState({

    NOMBRE: '',
    APELLIDO_PATERNO: '',
    APELLIDO_MATERNO: '',
    CURP: '',
    CORREO: '',
    USUARIO: '',
    CONTRASENA: '',
    RFC: '',
    ROL: '1'
  });

  // Manejo del cambio en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'CORREO' || name === 'CONTRASENA') ? value : value.toUpperCase()
    }));
    if (name === 'CONTRASENA') {
      const result = zxcvbn(value); // Evalúa la fuerza
      setPasswordStrength(getPasswordStrength(value)); // 0 (débil) a 4 (fuerte)
    }
    setError({ ...error, [name]: '' });
  };

  // Manejo del envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError({});
    // Validación del formulario
    const newErrors = validateForm( formData);
    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return;
    }

    // Envío de datos al backend
    try {
      const response = await axios.post('http://localhost:5000/api/users/register', {
        ...formData,
        NOMBRE: formData.NOMBRE.toUpperCase(),
        APELLIDO_PATERNO: formData.APELLIDO_PATERNO.toUpperCase(),
        APELLIDO_MATERNO: formData.APELLIDO_MATERNO.toUpperCase(),
        USUARIO: formData.USUARIO.toUpperCase(),
        CURP: formData.CURP.toUpperCase(),
        RFC: formData.RFC.toUpperCase(),
        ROL: formData.ROL
      });// petición POST al backend
      setMensaje('Usuario registrado correctamente');
      setError({});
      setFormData({
        NOMBRE: '',
        APELLIDO_PATERNO: '',
        APELLIDO_MATERNO: '',
        CURP: '',
        CORREO: '',
        USUARIO: '',
        CONTRASENA: '',
        RFC: ''
      });
      // Reiniciar la fuerza de la contraseña
      setPasswordStrength(0);
      // Limpiar el mensaje después de 5 segundos
      setTimeout(() => setMensaje(''), 5000);
    } catch (error) {
      if (error.response && error.response.data.error) {
        setError({ general: error.response.data.error });
      } else {
        setError({ general: 'Error al registrar. Intenta de nuevo.' });
      }
    }
  };

  //pagina de registro
  return ( //contenedor principal
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="p-4 rounded-4 shadow bg-white" style={{ width: '100%', maxWidth: '600px' }}>
        <h4 className="text-center mb-3" style={{ color: '#7A1737', fontSize: '30px' }}>CREACIÓN DE CUENTA</h4>
        <form onSubmit={handleSubmit}>
          {/* Campo de nombre */}
          <div className="mb-3">
            <label className="form-label">NOMBRE</label>
            <input
              type="text"
              name="NOMBRE"
              value={formData.NOMBRE}
              onChange={handleChange}
              placeholder="Ingresa tu nombre"
              className="form-control rounded-3"
              required
            />
            {error.NOMBRE && <div className="text-danger small mt-1">{error.NOMBRE}</div>}
          </div>

          {/* Campo de apellido paterno */}
          <div className="mb-3">
            <label className="form-label">APELLIDO PATERNO</label>
            <input
              type="text"
              name="APELLIDO_PATERNO"
              value={formData.APELLIDO_PATERNO}
              onChange={handleChange}
              placeholder="Ingresa tu apellido paterno"
              className="form-control rounded-3"
              required
            />
            {error.APELLIDO_PATERNO && <div className="text-danger small mt-1">{error.APELLIDO_PATERNO}</div>}
          </div>

          {/* Campo de apellido materno */}
          <div className="mb-3">
            <label className="form-label">APELLIDO MATERNO</label>
            <input
              type="text"
              name="APELLIDO_MATERNO"
              value={formData.APELLIDO_MATERNO}
              onChange={handleChange}
              placeholder="Ingresa tu apellido materno"
              className="form-control rounded-3"
            />
            {error.APELLIDO_MATERNO && <div className="text-danger small mt-1">{error.APELLIDO_MATERNO}</div>}
          </div>

          {/* Campo de CURP */}
          <div className="mb-3">
            <label className="form-label">CURP</label>
            <input
              type="text"
              name="CURP"
              value={formData.CURP}
              onChange={handleChange}
              placeholder="Ingresa tu CURP"
              className="form-control rounded-3"
              required
            />
            {error.CURP && <div className="text-danger small mt-1">{error.CURP}</div>}
          </div>

          {/* Campo RFC */}
          <div className="mb-3">
            <label className="form-label">RFC</label>
            <input
              type="text"
              name="RFC"
              value={formData.RFC}
              onChange={handleChange}
              placeholder="Ingresa tu RFC"
              className="form-control rounded-3"
              required
            />
            {error.RFC && <div className="text-danger small mt-1">{error.RFC}</div>}
          </div>

          {/* Campo de correo electrónico */}
          <div className="mb-3">
            <label className="form-label">CORREO ELECTRÓNICO</label>
            <input
              type="email"
              name="CORREO"
              value={formData.CORREO}
              onChange={handleChange}
              placeholder="Ingresa tu correo electrónico"
              className="form-control rounded-3"
              required
            />
            {error.CORREO && <div className="text-danger small mt-1">{error.CORREO}</div>}
          </div>

          {/* Campo de usuario */}
          <div className="mb-4">
            <label className="form-label">USUARIO</label>
            <input
              type="text"
              name="USUARIO"
              value={formData.USUARIO}
              onChange={handleChange}
              placeholder="Ingresa tu usuario"
              className="form-control rounded-3"
              required
            />
            {error.USUARIO && <div className="text-danger small mt-1">{error.USUARIO}</div>}
          </div>

          {/* Contraseña con visibilidad alternable y barra de progreso */}
          <div className="mb-4">
            <label className="form-label">CONTRASENA</label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                name="CONTRASENA"
                value={formData.CONTRASENA}
                onChange={handleChange}
                placeholder="Ingresa tu contraseña"
                className="form-control rounded-3"
                required
              />
              {/* Botón para alternar la visibilidad de la contraseña */}
              <button
                type="button"
                className="btn btn-outline-secondary rounded-end"
                onClick={togglePasswordVisibility}
                style={{ zIndex: 1, padding: '0 10px', border: 'none' }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {/* Mostrar error de contraseña si existe */}
            {error.CONTRASENA && <div className="text-danger small mt-1">{error.CONTRASENA}</div>}
            {/* Barra de progreso para la fuerza de la contraseña */}
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

          {/* Botón de registro */}
          <button type="submit" className="btn btn-primary w-100 rounded-3" style={{ backgroundColor: '#7A1737', borderColor: '#7A1737' }}>
            Registrar
          </button>
          <p className="text-center mt-3">¿Ya tienes una cuenta?</p>
          {mensaje && <div className="alert alert-success mt-3 text-center">{mensaje}</div>}
          {error.general && <div className="alert alert-danger mt-3 text-center">{error.general}</div>}
        </form>

        {/* Botón para navegar a la página de inicio de sesión */}
        <button type="button" className="btn btn-primary w-100 rounded-3 mt-2" style={{ backgroundColor: '#7A1737', borderColor: '#7A1737' }} onClick={() => navigate('/sesion')}>
          Inicia Sesión
        </button>
        <p className="text-center text-muted mt-4 small"></p>
      </div>
    </div>
  );
}

export default RegisterForm;
