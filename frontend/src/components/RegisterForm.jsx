import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Importar useNavigate

function RegisterForm() {
  const navigate = useNavigate();  // Hook para navegación
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/users/register', formData);
      setMensaje(response.data.message || 'Usuario registrado correctamente');
      setError('');
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
    } catch (error) {
      setMensaje('');
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Fallo en el registro');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Función para ir a la pantalla de login
  const irALogin = () => {
    navigate('/sesion');  // Cambia '/login' si tu ruta es otra
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="p-4 rounded-4 shadow bg-white" style={{ width: '100%', maxWidth: '600px' }}>
        <h4 className="text-center mb-3" style={{ color: '#7A1737', fontSize: '30px' }}>
          CREACIÓN DE CUENTA
        </h4>

        <form onSubmit={handleSubmit}>
          {[
            { label: 'Nombre', name: 'NOMBRE', type: 'text' },
            { label: 'Apellido Paterno', name: 'APELLIDO_PATERNO', type: 'text' },
            { label: 'Apellido Materno', name: 'APELLIDO_MATERNO', type: 'text' },
            { label: 'CURP', name: 'CURP', type: 'text' },
            { label: 'RFC', name: 'RFC', type: 'text' },
            { label: 'Correo Electrónico', name: 'CORREO', type: 'email' },
            { label: 'Usuario', name: 'USUARIO', type: 'text' },
            { label: 'Contraseña', name: 'CONTRASENA', type: 'password' },
          ].map((field, idx) => (
            <div className="mb-3" key={idx}>
              <label className="form-label">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={`Ingresa tu ${field.label.toLowerCase()}`}
                className="form-control rounded-3"
                required
              />
            </div>
          ))}

          <button
            type="submit"
            className="btn btn-primary w-100 rounded-3"
            style={{ backgroundColor: '#7A1737', borderColor: '#7A1737' }}
          >
            Registrar
          </button>

          {mensaje && <div className="alert alert-success mt-3 text-center">{mensaje}</div>}
          {error && <div className="alert alert-danger mt-3 text-center">{error}</div>}
        </form>

        <button
          type="button"
          className="btn btn-outline-success w-100 rounded-3 mt-2"
          style={{ borderColor: '#7A1737', color: '#7A1737' }}
          onClick={irALogin}
        >
          Inicia Sesión
        </button>
      </div>
    </div>
  );
}

export default RegisterForm;
