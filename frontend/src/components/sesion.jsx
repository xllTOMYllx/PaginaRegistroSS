// variables de entorno
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
//import '../css/sesion.css'
import { useAuth } from '../context/AuthContext';

// función principal del componente Sesion
function Sesion() {
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    USUARIO: '',
    CONTRASENA: ''
  });
  // Estado para mostrar/ocultar la contraseña
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();
  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};
    if (!formData.USUARIO) newErrors.USUARIO = 'El usuario es requerido.';
    else if (!/^[A-Z0-9_]{4,30}$/.test(formData.USUARIO.toUpperCase())) newErrors.USUARIO = 'Usuario inválido. Debe tener entre 4 y 30 caracteres alfanuméricos o guion bajo en mayúsculas.';

    if (!formData.CONTRASENA) newErrors.CONTRASENA = 'La contraseña es requerida.';

    return newErrors;
  };
  // Manejo del envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/users/login', {
        USUARIO: formData.USUARIO.trim().toUpperCase(),
        CONTRASENA: formData.CONTRASENA
      });
      const { token, usuario } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      // update global auth context so all components see the user immediately
      try {
        setUser(usuario);
      } catch (e) {
        // ignore if context not available
      }

      if (usuario.rol === 1) {
        navigate('/Home', { state: { user: usuario } });
      }

      if (usuario.rol === 2) {
        navigate('/Usuarios', { state: { user: usuario } });
      }

      if (usuario.rol === 3) {
        navigate('/Usuarios', { state: { user: usuario } });
      }


    } catch (error) {
      if (error.response) {
        if (error.response.data.error.includes('usuario')) {
          setError({ USUARIO: error.response.data.error });
        } else if (error.response.data.error.includes('contraseña')) {
          setError({ CONTRASENA: error.response.data.error });
        } else {
          setError({ general: error.response.data.error || 'Error al iniciar sesión. Intenta de nuevo.' });
        }
      } else {
        setError({ general: 'Error de conexión. Verifica el servidor.' });
      }
    }
  };
  // Función para alternar la visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  // Manejo del cambio en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'USUARIO' ? value.toUpperCase() : value });
    setError({ ...error, [name]: '' }); // Limpia el error al cambiar
  };
  // Pagina de inicio de sesión
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="p-4 rounded-4 shadow bg-white" style={{ width: '100%', maxWidth: '600px' }}>
        <h4 className="text-center mb-3" style={{ color: '#7A1737', fontSize: '30px', fontFamily: "Roboto, sans-serif" }}>INICIAR SESIÓN</h4>
        <form onSubmit={handleSubmit}>
          {error.general && <div className="alert alert-danger mt-3 text-center">{error.general}</div>}
          {/* Campo de usuario */}
          <div className="mb-3">
            <label className="form-label">Usuario</label>
            <input
              type="text"
              name="USUARIO"
              value={formData.USUARIO}
              onChange={handleChange}
              className="form-control rounded-3"
              required
            />
            {error.USUARIO && <div className="text-danger small mt-1">{error.USUARIO}</div>}
          </div>
          {/* Campo de contraseña */}
          <div className="mb-4">
            <label className="form-label">Contraseña</label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                name="CONTRASENA"
                value={formData.CONTRASENA}
                onChange={handleChange}
                placeholder="********"
                className="form-control rounded-3"
                required
              />
              {/* Icono para mostrar/ocultar contraseña */}
              <button
                type="button"
                className="btn btn-outline-secondary rounded-end mb-3"
                onClick={togglePasswordVisibility}
                style={{ zIndex: 1, border: 'none' }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {error.CONTRASENA && <div className="text-danger small mt-1">{error.CONTRASENA}</div>}
          </div>
          {/* Botón de inicio de sesión */}
          <button type="submit" className="btn btn-primary w-100 rounded-3" style={{ backgroundColor: '#7A1737', borderColor: '#7A1737', fontFamily: "Roboto, sans-serif" }}>
            Iniciar Sesión
          </button>
          <p className="text-center mt-3">¿No tienes una cuenta?</p>
        </form>
        <button type="button" className="btn btn-primary w-100 rounded-3 mt-2" style={{ backgroundColor: '#7A1737', borderColor: '#7A1737', fontFamily: "Roboto, sans-serif" }} onClick={() => navigate('/')}>
          Registrarse
        </button>

      </div>
    </div>
  );
}

export default Sesion;

// Nota verificar el mensaje de error de la contraseña no se muestra :b