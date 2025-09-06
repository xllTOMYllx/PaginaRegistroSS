// src/components/HomeAdmin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function HomeAdmin() {
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  // Verificar autenticación al montar el componente
  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem("usuario"));
    const token = localStorage.getItem("token");
    if (!adminData || !token) {
      navigate('/sesion', { replace: true }); // Redirigir si no hay usuario o token
      return;
    }
    setAdmin(adminData);
  }, [navigate]);

  // Función para cerrar sesión
  const cerrarSesion = () => {
    try {
      localStorage.removeItem("usuario"); // Elimina los datos del usuario
      localStorage.removeItem("token"); // Elimina el token
      setAdmin(null); // Limpia el estado del admin
      navigate('/sesion', { replace: true }); // Redirige sin guardar en historial
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="d-flex vh-100">
      {/* Sidebar reutilizable */}
      <Sidebar admin={admin} cerrarSesion={cerrarSesion} />

      {/* Contenido principal */}
      <main className="flex-grow-1 d-flex flex-column">
        {/* Navbar reutilizable */}
        <Navbar />

        {/* Contenido temporal */}
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <h2>Bienvenido al panel de administración</h2>
        </div>
      </main>
    </div>
  );
}

export default HomeAdmin;
