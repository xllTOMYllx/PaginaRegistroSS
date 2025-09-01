// src/components/Miembros.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
      <aside
        className="bg-dark text-white p-3 d-flex flex-column justify-content-between"
        style={{ width: "250px" }}
      >
        <div>
          {/* Perfil admin */}
          {admin && (
            <div className="text-center mb-4">
              <img
                src={
                  admin.foto_perfil
                    ? `http://localhost:5000/uploads/fotos/${admin.id_personal}/${admin.foto_perfil}`
                    : "http://localhost:5000/uploads/default-avatar.jpg"
                }
                alt="Foto de perfil"
                crossOrigin="use-credentials"
                className="rounded-circle shadow"
                width="120"
                height="120"
              />
              <h5>
                {admin.nombre} {admin.apellido_paterno}
              </h5>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="nav flex-column">
            <button
              onClick={() => navigate("/miembros")}
              className="btn btn-outline-light text-start mb-2"
            >
              👥 Miembros
            </button>
            <button
              onClick={() => navigate("/documentos")}
              className="btn btn-outline-light text-start"
            >
              📑 Documentos Revisados
            </button>
          </div>
        </div>

        {/* Botón cerrar sesión */}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            navigate("/login");
          }}
          className="btn btn-danger w-100 mt-3"
        >
          🔒 Cerrar Sesión
        </button>
      </aside>

      {/* Contenido principal */}
      <main className="flex-grow-1 d-flex flex-column">
        {/* Navbar superior */}
        <nav className="navbar navbar-light bg-white shadow-sm px-4">
          <form className="d-flex w-50">
            <input
              className="form-control me-2"
              type="search"
              placeholder="Buscar miembros..."
              aria-label="Buscar"
            />
            <button className="btn btn-outline-success" type="submit">
              🔍
            </button>
          </form>

          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-light">🔔</button>
            <button
              onClick={() => navigate("/crear-usuario")}
              className="btn btn-primary"
            >
              ➕ Crear Usuario
            </button>
          </div>
        </nav>

        {/* Lista de miembros */}
        <div className="container py-4">
          <div className="row">
            {usuarios.map((usuario) => (
              <div key={usuario.id_personal} className="col-md-4 mb-4">
                <div
                  className="card text-center h-100 shadow-sm"
                  role="button"
                  onClick={() => navigate(`/miembros/${usuario.id_personal}`)}
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
                      className="rounded-circle mb-3"
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