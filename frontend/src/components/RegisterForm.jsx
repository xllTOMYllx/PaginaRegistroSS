
//librerias necesarias
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import zxcvbn from 'zxcvbn';

//función principal del componente RegisterForm
function RegisterForm() {
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({

    NOMBRE: '',
    APELLIDO_PATERNO: '',
    APELLIDO_MATERNO: '',
    CURP: '',
    CORREO: '',
    USUARIO: '',
    CONTRASENA: '',
    RFC: ''
  });

  // Estado para mostrar/ocultar la contraseña
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Validación del formulario
  const validateForm = () => {
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

    // Validaciones para cada campo
    if (!upperCaseData.NOMBRE) newErrors.NOMBRE = 'El nombre es obligatorio.';
    else if (upperCaseData.NOMBRE.length > 50) newErrors.NOMBRE = 'El nombre no debe exceder 50 caracteres.';
    else if (!/^[A-ZÁÉÍÓÚÑ\s]+$/.test(upperCaseData.NOMBRE)) newErrors.NOMBRE = 'El nombre solo debe contener letras en mayúsculas.';

    if (!upperCaseData.APELLIDO_PATERNO) newErrors.APELLIDO_PATERNO = 'El apellido paterno es obligatorio.';
    else if (upperCaseData.APELLIDO_PATERNO.length > 50) newErrors.APELLIDO_PATERNO = 'El apellido paterno no debe exceder 50 caracteres.';
    else if (!/^[A-ZÁÉÍÓÚÑ\s]+$/.test(upperCaseData.APELLIDO_PATERNO)) newErrors.APELLIDO_PATERNO = 'El apellido paterno solo debe contener letras en mayúsculas.';

    if (upperCaseData.APELLIDO_MATERNO && !/^[A-ZÁÉÍÓÚÑ\s]+$/.test(upperCaseData.APELLIDO_MATERNO)) newErrors.APELLIDO_MATERNO = 'El apellido materno solo debe contener letras en mayúsculas.';
    else if (upperCaseData.APELLIDO_MATERNO && upperCaseData.APELLIDO_MATERNO.length > 50) newErrors.APELLIDO_MATERNO = 'El apellido materno no debe exceder 50 caracteres.';

    if (!upperCaseData.USUARIO) newErrors.USUARIO = 'El usuario es obligatorio.';
    else if (!/^[A-Z0-9_]{4,15}$/.test(upperCaseData.USUARIO)) newErrors.USUARIO = 'El usuario debe tener entre 4 y 15 caracteres alfanuméricos o guion bajo en mayúsculas.';

    if (!formData.CONTRASENA) newErrors.CONTRASENA = 'La contraseña es obligatoria.';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(formData.CONTRASENA)) newErrors.CONTRASENA = 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y un caracter especial.';

    if (!formData.CORREO) newErrors.CORREO = 'El correo es obligatorio.';
    else if (!/^[^\s@]+@(gmail\.com|hotmail\.com|outlook\.com)$/.test(formData.CORREO)) newErrors.CORREO = 'El correo debe terminar en @gmail.com, @hotmail.com o @outlook.com.'

    // Función para obtener y validar la fecha de nacimiento desde la CURP
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
    
    // Validación específica para CURP
    if (!upperCaseData.CURP) {
      newErrors.CURP = 'La CURP es obligatoria.';
    } else if (upperCaseData.CURP.length !== 18) {
      newErrors.CURP = 'La CURP debe tener exactamente 18 caracteres.';
    } else {
      const regexCURP = /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/;
      
      // Validar formato general de CURP
      if (!regexCURP.test(upperCaseData.CURP)) {
        newErrors.CURP = 'CURP no válido. Formato incorrecto.';
      } else {
        const { fullYear, mes, dia, fechaValida, esFebrero29, esBisiesto } = obtenerDatosFechaCURP(upperCaseData.CURP);
        
        // Validar fecha de nacimiento
        if (
          fechaValida.getFullYear() !== fullYear ||
          fechaValida.getMonth() + 1 !== mes ||
          fechaValida.getDate() !== dia
        ) { 
          newErrors.CURP = esFebrero29 && !esBisiesto 
            ? 'CURP no válido. El año no es bisiesto, 29 de febrero no es válido.'
            : 'CURP no válido. Fecha de nacimiento inválida o inexistente.';
        }
      }
    }
    
    // Validación específica para RFC
    if (!upperCaseData.RFC) newErrors.RFC = 'El RFC es obligatorio.';
    else if (!/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(upperCaseData.RFC)) newErrors.RFC = 'RFC no válido. Debe tener 12 o 13 caracteres: 3-4 letras, 6 dígitos y 3 alfanuméricos.';

    return newErrors;
  };

  // Manejo del cambio en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'CORREO' || name === 'CONTRASENA') ? value : value.toUpperCase()
    }));
    if (name === 'CONTRASENA') {
      const result = zxcvbn(value); // Evalúa la fuerza
      setPasswordStrength(result.score); // 0 (débil) a 4 (fuerte)
    }
    setError({ ...error, [name]: '' });
  };

  // Manejo del envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError({});
    // Validación del formulario
    const newErrors = validateForm();
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

  // Función para alternar la visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Función para obtener el color de la barra de progreso según la fuerza de la contraseña
  const getStrengthColor = (score) => {
    switch (score) {
      case 0: return 'bg-danger';
      case 1: return 'bg-warning';
      case 2: return 'bg-info';
      case 3: return 'bg-primary';
      case 4: return 'bg-success';
      default: return 'bg-secondary';
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
                Fuerza de la contraseña: {['Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte'][passwordStrength]}
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
