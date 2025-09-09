import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function HomeUsuario2() {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("usuario"));
    const token = localStorage.getItem("token");
    if (!userData || !token || userData.rol !== 2) {
      navigate('/sesion', { replace: true });
      return;
    }
    setUsuario(userData);
  }, [navigate]);

  const cerrarSesion = () => {
    try {
      localStorage.removeItem("usuario");
      localStorage.removeItem("token");
      setUsuario(null);
      navigate('/sesion', { replace: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="d-flex vh-100">
      <Sidebar admin={usuario} cerrarSesion={cerrarSesion} />
      <main className="flex-grow-1 d-flex flex-column">
        {/* Navbar sin botón de crear */}
        <Navbar hideCrear={true} />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <h2>Bienvenido al panel de usuario tipo 2</h2>
        </div>
      </main>
    </div>
  );
}

export default HomeUsuario2;
