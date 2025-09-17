import { useNavigate } from "react-router-dom";
import { useState } from "react";
import '../css/Sidebar.css'

function Sidebar({ admin, Usuario2, cerrarSesion }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        className="btn btn-dark d-lg-none p-2"
        onClick={toggleSidebar}
        style={{
          position: "fixed",
          top: "10px",
          left: "10px",
          zIndex: 1050,
          fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
        }}
      >
        {isOpen ? "✖" : "☰"}
      </button>

      <aside
        className={`bg-dark text-white p-3 d-flex flex-column justify-content-between ${isOpen ? "d-block" : "d-none"} d-lg-flex`}
        style={{
          width: "clamp(180px, 20vw, 250px)",
          minHeight: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1040,
          transition: "transform 0.3s ease-in-out",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <div>
          {/* Usuario admin */}
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
                className="img-fluid rounded-circle mb-3"
                style={{
                  objectFit: "cover",
                  width: "clamp(80px, 15vw, 100px)",
                  height: "clamp(80px, 15vw, 100px)",
                }}
              />
              <h5 style={{ fontSize: "clamp(1rem, 2.5vw, 1.1rem)" }}>
                {admin.nombre} {admin.apellido_paterno}
              </h5>
            </div>
          )}

          {/* Usuario2 */}
          {Usuario2 && (
            <div className="text-center mb-4">
              <img
                src={
                  Usuario2.foto_perfil
                    ? `http://localhost:5000/uploads/fotos/${Usuario2.id_personal}/${Usuario2.foto_perfil}`
                    : "http://localhost:5000/uploads/default-avatar.jpg"
                }
                alt="Foto de perfil"
                crossOrigin="use-credentials"
                className="img-fluid rounded-circle mb-3"
                style={{
                  objectFit: "cover",
                  width: "clamp(80px, 15vw, 100px)",
                  height: "clamp(80px, 15vw, 100px)",
                }}
              />
              <h5 style={{ fontSize: "clamp(1rem, 2.5vw, 1.1rem)" }}>
                {Usuario2.nombre} {Usuario2.apellido_paterno}
              </h5>
            </div>
          )}

          {/* Navegación */}
          <div className="nav flex-column">
            <button
              onClick={() => { navigate("/Usuarios"); setIsOpen(false); }}
              className="btn btn-outline-light text-start mb-2 w-100"
              style={{ fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)" }}
            >
              👥 Miembros
            </button>
            <button
              onClick={() => { navigate("/documentos"); setIsOpen(false); }}
              className="btn btn-outline-light text-start w-100"
              style={{ fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)" }}
            >
              📑 Documentos Revisados
            </button>
          </div>
        </div>

        {/* Cerrar sesión */}
        <button
          onClick={() => { cerrarSesion(); setIsOpen(false); }}
          className="btn btn-danger w-100 mt-3"
          style={{ fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)" }}
        >
          🔒 Cerrar Sesión
        </button>
      </aside>
    </>
  );
}

export default Sidebar;
