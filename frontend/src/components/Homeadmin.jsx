// src/components/HomeAdmin.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

function HomeAdmin() {
  const navigate = useNavigate();

  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <aside className="bg-dark text-white p-3 d-flex flex-column justify-content-between" style={{ width: "250px" }}>
        <div>
          {/* Perfil */}
          <div className="text-center mb-4">
            <img
              src="/uploads/admin.jpg"
              alt="Admin"
              className="rounded-circle border border-light mb-2"
              style={{ width: "80px", height: "80px", objectFit: "cover" }}
            />
            <h5>Admin General</h5>
          </div>

          {/* Navegación */}
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

        {/* Cerrar sesión */}
        <button
          onClick={() => navigate("/login")}
          className="btn btn-danger w-100 mt-3"
        >
          🔒 Cerrar Sesión
        </button>
      </aside>

      {/* Contenido principal temporal */}
      <main className="flex-grow-1 d-flex align-items-center justify-content-center">
        <h2>Bienvenido al panel de administración</h2>
      </main>
    </div>
  );
}

export default HomeAdmin;
