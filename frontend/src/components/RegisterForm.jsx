import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/users/register', formData);
      setMensaje('Usuario registrado correctamente');
      setError('');
      // Limpia el formulario usando los mismos nombres del estado inicial
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
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="p-4 rounded-4 shadow bg-white" style={{ width: '100%', maxWidth: '600px' }}>

        <h4 className="text-center mb-3" style={{ color: '#7A1737', fontSize: '30px' }}> CREACIÓN DE CUENTA</h4>

        <form onSubmit={handleSubmit} >
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              name="NOMBRE"
              value={formData.NOMBRE}
              onChange={handleChange}
              placeholder="Ingresa tu nombre"
              className="form-control rounded-3"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Apellido Paterno</label>
            <input
              type="text"
              name="APELLIDO_PATERNO"
              value={formData.APELLIDO_PATERNO}
              onChange={handleChange}
              placeholder="Ingresa tu apellido paterno"
              className="form-control rounded-3"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Apellido Materno</label>
            <input
              type="text"
              name="APELLIDO_MATERNO"
              value={formData.APELLIDO_MATERNO}
              onChange={handleChange}
              placeholder="Ingresa tu apellido materno"
              className="form-control rounded-3"
              required
            />
          </div>

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
          </div>
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
          </div>

          <div className="mb-3">
            <label className="form-label">Correo Electrónico</label>
            <input
              type="email"
              name="CORREO"
              value={formData.CORREO}
              onChange={handleChange}
              placeholder="Ingresa tu correo electrónico"
              className="form-control rounded-3"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Usuario</label>
            <input
              type="text"
              name="USUARIO"
              value={formData.USUARIO}
              onChange={handleChange}
              placeholder="Ingresa tu usuario"
              className="form-control rounded-3"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              name="CONTRASENA"
              value={formData.CONTRASENA}
              onChange={handleChange}
              placeholder="Ingresa tu contraseña"
              className="form-control rounded-3"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 rounded-3" 
          style= {{ backgroundColor: '#7A1737', borderColor: '#7A1737'}}>
            Registrar
          </button>
          <p className="text-center mt-3">¿Ya tienes una cuenta?</p>
          {mensaje && <div className="alert alert-success mt-3 text-center">{mensaje}</div>}
          {error && <div className="alert alert-danger mt-3 text-center">{error}</div>}
        </form>
        <button type="button" className="btn btn-primary w-100 rounded-3 mt-2" 
          style= {{ backgroundColor: '#7A1737', borderColor: '#7A1737'}}
          onClick={() => navigate('/sesion')}>
            Inicia Sesión
        </button>
        <p className="text-center text-muted mt-4 small"></p>
      </div>
    </div>
  );
}

export default RegisterForm;
