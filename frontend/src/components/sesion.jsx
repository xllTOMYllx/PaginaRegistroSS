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
  const [showPrivacy, setShowPrivacy] = useState(false);
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

      if (usuario.rol === 4) {
        navigate('/homeadmin4', { state: { user: usuario } });
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
          <div className="text-center mb-3" style={{ fontSize: '0.9rem' }}>
            Consulta el {' '}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }}
              className="link-primary text-decoration-underline"
              style={{ background: 'transparent', padding: 0, border: 'none' }}
            >
              Aviso de Privacidad
            </a>
          </div>
          <button type="submit" className="btn btn-primary w-100 rounded-3" style={{ backgroundColor: '#7A1737', borderColor: '#7A1737', fontFamily: "Roboto, sans-serif" }}>
            Iniciar Sesión
          </button>
         
        </form>

        
        
        {showPrivacy && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Aviso de Privacidad Simplificado</h5>
                  <button type="button" className="btn-close" onClick={() => setShowPrivacy(false)}></button>
                </div>
                <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                  <p>
                    La Secretaría de Salud de Veracruz y Servicios de Salud de Veracruz son los responsables del tratamiento de los datos personales que nos proporcione, los cuales serán protegidos conforme a lo dispuesto por la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados y demás normatividad aplicable.
                  </p>
                  <h6>Finalidades necesarias</h6>
                  <ul>
                    <li><strong>Gestión Académica:</strong> Registrar su inscripción a la modalidad de capacitación elegida, generar listas de asistencia y realizar la validación de las mismas.</li>
                    <li><strong>Acreditación:</strong> Emisión de constancias, diplomas o certificados de acreditación o asistencia, según los criterios de la modalidad correspondiente.</li>
                    <li><strong>Comunicación:</strong> Establecer contacto para el seguimiento de los cursos, aclaración de dudas, y notificación de cambios de horario, sede o cancelaciones.</li>
                    <li><strong>Gestión Administrativa y Planeación:</strong> Puesta en conocimiento de la Dirección de Planeación y Desarrollo para optimizar la asignación de tareas y actualizar el registro de competencias del personal.</li>
                  </ul>
                  <h6>Finalidades secundarias</h6>
                  <ul>
                    <li>Envío de material didáctico, de exposición o de consulta.</li>
                    <li>Invitaciones a futuros eventos, cursos o talleres.</li>
                    <li>Generación de estadísticas para informes obligatorios ante organismos públicos o privados (de manera disociada).</li>
                  </ul>
                  <p>
                    En caso de que no desee que sus datos personales sean tratados para finalidades secundarias, usted puede manifestar su negativa enviando un correo electrónico a: <a href="mailto:capacitación.salud.ver@gmail.com">capacitación.salud.ver@gmail.com</a>.
                  </p>
                  <h6>Transferencias de Datos</h6>
                  <p>
                    No se realizarán transferencias de datos personales que requieran su consentimiento, salvo aquellas necesarias para atender requerimientos de una autoridad competente, debidamente fundados y motivados.
                  </p>
                  <p>
                    Para mayor información sobre el tratamiento de sus datos personales y el ejercicio de sus derechos ARCO, consulte el Aviso de Privacidad Integral en el siguiente enlace:
                    {' '}<a href="https://www.ssaver.gob.mx/transparencia/wp-content/uploads/sites/7/2022/06/Aviso-de-privacidad-simplificado-e-integral-Capacitacion.pdf" target="_blank" rel="noopener noreferrer">Aviso de Privacidad Integral (PDF)</a>.
                  </p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowPrivacy(false)}>Cerrar</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Sesion;

// Nota verificar el mensaje de error de la contraseña no se muestra :b