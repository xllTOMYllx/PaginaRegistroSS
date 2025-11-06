import { useNavigate } from "react-router-dom";
import { useState } from "react";
import '../css/Sidebar.css'

function Sidebar({ admin, Usuario2, cerrarSesion }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
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
        className={`text-white p-3 d-flex flex-column justify-content-between ${isOpen ? "d-block" : "d-none"} d-lg-flex`}
        style={{
          width: isCollapsed ? "80px" : "clamp(180px, 20vw, 250px)",
          minHeight: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1040,
          transition: "all 0.3s ease-in-out",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          background: "linear-gradient(135deg, #7A1737 0%, #ffffff 400%)",
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)"
        }}
      >
        <button
          className="btn btn-outline-light d-none d-lg-block"
          onClick={toggleCollapse}
          style={{
            position: "absolute",
            right: "-15px",
            top: "20px",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            padding: "0",
            zIndex: 1041,
            backgroundColor: "#7A1737",
            border: "2px solid white"
          }}
        >
          {isCollapsed ? "→" : "←"}
        </button>
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
                  width: isCollapsed ? "40px" : "clamp(80px, 15vw, 100px)",
                  height: isCollapsed ? "40px" : "clamp(80px, 15vw, 100px)",
                  border: "3px solid rgba(255, 255, 255, 0.8)",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
                }}
              />
              {!isCollapsed && (
                <h5 style={{ 
                  fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
                  color: "white",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.2)"
                }}>
                  {admin.nombre} {admin.apellido_paterno}
                </h5>
              )}
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
              className="btn mb-2 w-100 sidebar-btn"
              style={{ 
                fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "white",
                textAlign: isCollapsed ? "center" : "left",
                padding: isCollapsed ? "0.5rem" : "0.5rem 1rem",
                transition: "all 0.3s ease"
              }}
              title="Miembros"
            >
              {isCollapsed ? "👥" : "👥 Miembros"}
            </button>
            <button
              onClick={() => { navigate("/Baja_user"); setIsOpen(false); }}
              className="btn mb-2 w-100 sidebar-btn"
              style={{ 
                fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "white",
                textAlign: isCollapsed ? "center" : "left",
                padding: isCollapsed ? "0.5rem" : "0.5rem 1rem",
                transition: "all 0.3s ease"
              }}
              title="Bloquear usuario"
            >
              {isCollapsed ? "�" : "🚫 Bloquear usuario"}
            </button>
            <button
              onClick={() => { navigate("/recuperarcuent"); setIsOpen(false); }}
              className="btn mb-2 w-100 sidebar-btn"
              style={{ 
                fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "white",
                textAlign: isCollapsed ? "center" : "left",
                padding: isCollapsed ? "0.5rem" : "0.5rem 1rem",
                transition: "all 0.3s ease"
              }}
              title="Recuperar Cuentas"
            >
              {isCollapsed ? "🔄" : "� Recuperar Cuentas"}
            </button>
          </div>
        </div>

        {/* Cerrar sesión */}
        <button
          onClick={() => { cerrarSesion(); setIsOpen(false); }}
          className="btn w-100 mt-3"
          style={{ 
            fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)",
            backgroundColor: "#7A1737",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            textAlign: isCollapsed ? "center" : "left",
            padding: isCollapsed ? "0.5rem" : "0.5rem 1rem"
          }}
        >
          🔒 Cerrar Sesión
        </button>
      </aside>
    </>
  );
}

export default Sidebar;
