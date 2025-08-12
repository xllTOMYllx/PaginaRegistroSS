import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Sesion() {
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    USUARIO: '',
    CONTRASENA: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpia errores previos
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', formData);
      console.log('Sesión iniciada:', response.data);
     
      navigate('/home', { state: { user: response.data.usuario } });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      if (error.response) {
        // Captura el mensaje de error del backend
        setError(error.response.data.error || 'Error al iniciar sesión. Intenta de nuevo.');
      } else {
        setError('Error de conexión. Verifica el servidor.');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="p-4 rounded-4 shadow bg-white" style={{ width: '100%', maxWidth: '600px' }}>
        <h4 className="text-center mb-3" style={{ color: '#7A1737', fontSize: '30px' }}>INICIAR SESIÓN</h4>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger mt-3 text-center">{error}</div>}
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
          </div>
          <div className="mb-4">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              name="CONTRASENA"
              value={formData.CONTRASENA}
              onChange={handleChange}
              placeholder="********"
              className="form-control rounded-3"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 rounded-3" style={{ backgroundColor: '#7A1737', borderColor: '#7A1737' }}>
            Iniciar Sesión
          </button>
          <p className="text-center mt-3">¿No tienes una cuenta?</p>
        </form>
        <button type="button" className="btn btn-primary w-100 rounded-3 mt-2" style={{ backgroundColor: '#7A1737', borderColor: '#7A1737' }} onClick={() => navigate('/')}>
          Registrarse
        </button>
      </div>
    </div>
  );
}

export default Sesion;
