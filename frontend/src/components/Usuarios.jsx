// src/components/Miembros.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import '../css/Usuarios.css'
import { FaUser, FaUserShield, FaArrowLeft } from 'react-icons/fa';

function Miembros() {
  const [usuarios, setUsuarios] = useState([]);
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  // Verificar autenticación al montar el componente (similar a Homeadmin.jsx)
  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem("usuario"));
    const token = localStorage.getItem("token");
    if (!adminData || !token) {
      navigate('/sesion', { replace: true });
      return;
    }
    setAdmin(adminData);
    fetchUsuarios();
  }, [navigate]);

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem("token");
      const adminData = JSON.parse(localStorage.getItem("usuario"));
      const rol = adminData?.rol || 1;
      const response = await axios.get(
        `http://localhost:5000/api/users/rol/${rol}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsuarios(response.data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/sesion', { replace: true });
      }
    }
  };

  const buscarUsuario = async (termino) => {
    try {
      const token = localStorage.getItem("token");
      const adminData = JSON.parse(localStorage.getItem("usuario"));
      const rol = adminData?.rol || 1;
      const url = termino.trim()
        ? `http://localhost:5000/api/users/buscar?nombre=${encodeURIComponent(termino)}&rol=${rol}`
        : `http://localhost:5000/api/users/rol/${rol}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(response.data);
    } catch (error) {
      console.error("Error al buscar usuario:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/sesion', { replace: true });
      }
    }
  };

  // Función para cerrar sesión (similar a Homeadmin.jsx)
  const cerrarSesion = () => {
    try {
      localStorage.removeItem("usuario");
      localStorage.removeItem("token");
      setAdmin(null);
      setUsuarios([]);
      navigate('/sesion', { replace: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem("usuario"));
    setAdmin(adminData);
    fetchUsuarios();
  }, []);

  // Pagina Principal
  return (
    <div className="d-flex vh-100">
      <Sidebar admin={admin} cerrarSesion={cerrarSesion} />
      <main className="flex-grow-1 d-flex flex-column">
        <Navbar onBuscar={buscarUsuario} hideCrear={admin?.rol !== 3} />
        <div className="container py-4">
          <div className="mb-4">
            <button 
              className="btn" 
              style={{ backgroundColor: "#7A1737", color: "#fff" }}
              onClick={() => navigate('/homeadmin')}
            >
              <FaArrowLeft className="me-2" />
              Regresar a Inicio
            </button>
          </div>
          {usuarios.length === 0 && (
            <div className="text-center py-4">Cargando usuarios...</div>
          )}
          <div className="row">
            {usuarios.map((usuario) => (
              <div key={usuario.id_personal} className="col-md-4 mb-4">
                <div
                  className="card text-center h-100 shadow-sm"
                  role="button"
                  onClick={() => navigate(`/Usuarios/${usuario.id_personal}`)}
                >
                  <div className="card-body">
                    <img
                      src={
                        usuario.foto_perfil
                          ? `http://localhost:5000/uploads/fotos/${usuario.id_personal}/${usuario.foto_perfil}`
                          : "http://localhost:5000/uploads/default-avatar.jpg"
                      }
                      alt={usuario.nombre}
                      crossOrigin="use-credentials"
                      className="img-fluid mb-3"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                      }}
                    />

                    <h6 className="card-title">
                      {usuario.nombre} {usuario.apellido_paterno} {usuario.apellido_materno}
                    </h6>
                    <span
                      className="user-status"
                      style={{
                        backgroundColor: usuario.rol === 2 ? '#4A2C2A' : '#8B6F47',
                      }}
                    >
                      {usuario.rol === 2 ? <FaUserShield className="me-1" /> : <FaUser className="me-1" />}
                      {usuario.rol === 2 ? 'Admin' : 'Usuario'}
                    </span>

                    <p className="mb-1">
                      <strong>CURP:</strong> {usuario.curp || "No disponible"}
                    </p>
                    <p className="mb-0">
                      <strong>RFC:</strong> {usuario.rfc || "No disponible"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Miembros;