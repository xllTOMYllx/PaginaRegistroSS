// src/components/Miembros.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

function Miembros() {
  const [usuarios, setUsuarios] = useState([]);
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  // función para obtener usuarios
  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/users/rol/1",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsuarios(response.data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  // obtener datos del admin (desde localStorage al iniciar sesión)
  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem("usuario"));
    setAdmin(adminData);
    fetchUsuarios();
  }, []);

  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <Sidebar admin={admin} />

      {/* Contenido principal */}
      <main className="flex-grow-1 d-flex flex-column">
        {/* Navbar */}
        <Navbar />

        {/* Lista de miembros */}
        <div className="container py-4">
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
                    <h5 className="card-title">
                      {usuario.nombre} {usuario.apellido_paterno}{" "}
                      {usuario.apellido_materno}
                    </h5>
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
