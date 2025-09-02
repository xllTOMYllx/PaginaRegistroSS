// src/components/HomeAdmin.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function HomeAdmin() {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem("usuario"));
    setAdmin(adminData);
  }, []);

  

  return (
    <div className="d-flex vh-100">
      {/* Sidebar reutilizable */}
      <Sidebar admin={admin} />

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
