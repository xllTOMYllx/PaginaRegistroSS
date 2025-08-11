import { useState } from 'react';
import axios from 'axios';

function Sesion() {
  const [formData, setFormData] = useState({
    USUARIO: '',
    CONTRASENA: ''  // sin ñ para evitar problemas
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', formData);
      console.log('Sesión iniciada:', response.data);

      // Si tu backend devuelve un token y usuario, guarda el token:
      // localStorage.setItem('token', response.data.token);

      alert(`Bienvenido ${response.data.usuario}, rol: ${response.data.rol}`);
      // Aquí puedes redirigir con useNavigate o window.location, ej:
      // window.location.href = '/dashboard';
    } catch (error) {
      console.error('Fallo al iniciar sesión:', error);
      alert('Usuario o contraseña incorrectos');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="p-4 rounded-4 shadow bg-white" style={{ width: '100%', maxWidth: '420px' }}>
        <h4 className="text-center mb-3">INICIAR SESIÓN</h4>
        <form onSubmit={handleSubmit}>
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
          <button type="submit" className="btn btn-danger w-100 rounded-3">
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export default Sesion;
