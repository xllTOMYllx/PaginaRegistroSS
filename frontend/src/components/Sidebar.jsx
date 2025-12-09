import { useNavigate } from "react-router-dom";
import { useState } from "react";
import '../css/Sidebar.css'
import { useAuth } from '../context/AuthContext';

function Sidebar({ admin, Usuario2, cerrarSesion }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Prefer the user from context; fall back to prop or localStorage if needed.
  let currentAdmin = user || admin;
  if (!currentAdmin) {
    try {
      const stored = localStorage.getItem('usuario');
      if (stored) currentAdmin = JSON.parse(stored);
    } catch (e) {
      currentAdmin = admin;
    }
  }
  const [isOpen, setIsOpen] = useState(true);
  // Persistir el estado de colapso en localStorage para que no se pierda al navegar
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    } catch (e) {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem('sidebarCollapsed', next ? 'true' : 'false');
    } catch (e) {
      // ignore
    }
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div 
          className="sidebar-backdrop d-lg-none"
          onClick={toggleSidebar}
        />
      )}
      
      <button
        className="btn btn-dark d-lg-none p-2 mobile-menu-btn"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        style={{
          position: "fixed",
          top: "10px",
          left: "10px",
          zIndex: 1050,
          fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
        }}
      >
        <span className="hamburger" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      <aside
        className={`app-sidebar text-white p-3 d-flex flex-column justify-content-between ${isOpen ? "d-block" : "d-none"} d-lg-flex ${isCollapsed ? 'collapsed' : ''}`}
        style={{
          width: isCollapsed ? "80px" : "clamp(180px, 20vw, 250px)",
          minHeight: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1040,
          transition: "all 0.25s ease-in-out",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {/* Collapse button placed inside the sidebar, above the profile */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            className="d-none d-lg-block sidebar-collapse-btn"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            <span className="hamburger" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
        <div>
          {/* Usuario admin */}
          {currentAdmin && (
            <div className="text-center mb-4">
              <img
                src={
                  currentAdmin.foto_perfil
                    ? `http://localhost:5000/uploads/fotos/${currentAdmin.id_personal}/${currentAdmin.foto_perfil}`
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
                  {currentAdmin.nombre} {currentAdmin.apellido_paterno}
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
              onClick={() => { navigate(currentAdmin?.rol === 4 ? '/homeadmin4' : '/homeadmin'); if (window.innerWidth < 992) setIsOpen(false); }}
              className="btn mb-3 w-100 sidebar-btn"
              style={{
                fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)",
                textAlign: isCollapsed ? "center" : "left",
                padding: isCollapsed ? "0.5rem" : "0.5rem 1rem",
                transition: "all 0.3s ease"
              }}
            >
              {isCollapsed ? '🏠' : '🏠 Inicio'}
            </button>
            <button
              onClick={() => { navigate("/usuarios"); if (window.innerWidth < 992) setIsOpen(false); }}
              className="btn mb-2 w-100 sidebar-btn"
              style={{
                fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)",
                textAlign: isCollapsed ? "center" : "left",
                padding: isCollapsed ? "0.5rem" : "0.5rem 1rem",
                transition: "all 0.3s ease"
              }}
              title="Miembros"
            >
              {isCollapsed ? "👥" : "👥 Miembros"}
            </button>
            {/* Botón Crear (solo visible para rol 3 - Jefe) */}
            {currentAdmin && [3, 4].includes(currentAdmin.rol) && (
              <button
                onClick={() => { navigate('/crearUsuario'); if (window.innerWidth < 992) setIsOpen(false); }}
                className="btn mb-2 w-100 sidebar-btn"
                style={{
                  fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)",
                  textAlign: isCollapsed ? "center" : "left",
                  padding: isCollapsed ? "0.5rem" : "0.5rem 1rem",
                  transition: "all 0.3s ease",
                  backgroundColor: "#7A1737",
                  color: "#ffffff"
                }}
                title="Crear Usuario"
              >
                {isCollapsed ? '➕' : '➕ Crear Usuario'}
              </button>
            )}
            {/* Botón Búsqueda Avanzada (solo visible para rol 3 y 4) */}
            {currentAdmin && [3, 4].includes(currentAdmin.rol) && (
              <button
                onClick={() => { navigate('/busqueda-avanzada'); if (window.innerWidth < 992) setIsOpen(false); }}
                className="btn mb-2 w-100 sidebar-btn"
                style={{
                  fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)",
                  textAlign: isCollapsed ? "center" : "left",
                  padding: isCollapsed ? "0.5rem" : "0.5rem 1rem",
                  transition: "all 0.3s ease",
                  backgroundColor: "#7A1737",
                  color: "#ffffff"
                }}
                title="Búsqueda Avanzada"
              >
                {isCollapsed ? '🔍' : '🔍 Búsqueda Avanzada'}
              </button>
            )}
            <button
              onClick={() => { navigate("/baja_user"); if (window.innerWidth < 992) setIsOpen(false); }}
              className="btn mb-2 w-100 sidebar-btn"
              style={{
                fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)",
                textAlign: isCollapsed ? "center" : "left",
                padding: isCollapsed ? "0.5rem" : "0.5rem 1rem",
                transition: "all 0.3s ease"
              }}
              title="Bloquear usuario"
            >
              {isCollapsed ? "🚫" : "🚫 Bloquear usuario"}
            </button>
            <button
              onClick={() => { navigate("/Recuperarcuent"); if (window.innerWidth < 992) setIsOpen(false); }}
              className="btn mb-2 w-100 sidebar-btn"
              style={{
                fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)",
                textAlign: isCollapsed ? "center" : "left",
                padding: isCollapsed ? "0.5rem" : "0.5rem 1rem",
                transition: "all 0.3s ease"
              }}
              title="Recuperar Cuentas"
            >
              {isCollapsed ? "🔄" : "🔄 Recuperar Cuentas"}
            </button>
            <button
              onClick={() => { navigate("/grupos"); if (window.innerWidth < 992) setIsOpen(false); }}
              className="btn mb-2 w-100 sidebar-btn"
              style={{
                fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)",
                textAlign: isCollapsed ? "center" : "left",
                padding: isCollapsed ? "0.5rem" : "0.5rem 1rem",
                transition: "all 0.3s ease"
              }}
              title="Gestionar Grupos"
            >
              {isCollapsed ? "👥" : "👥 Grupos"}
            </button>
          </div>
        </div>

        {/* Cerrar sesión */}
        <button
          onClick={() => { cerrarSesion(); if (window.innerWidth < 992) setIsOpen(false); }}
          className={`btn w-100 mt-3 logout-btn`}
        >
          🔒
          Cerrar Sesión
        </button>
      </aside>
    </>
  );
}

export default Sidebar;
