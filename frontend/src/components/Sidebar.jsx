// src/components/Sidebar.jsx
import { useNavigate } from "react-router-dom";

function Sidebar({ admin }) {
  const navigate = useNavigate();

  return (
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
            onClick={() => navigate("/Usuarios")}
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
  );
}

export default Sidebar;
