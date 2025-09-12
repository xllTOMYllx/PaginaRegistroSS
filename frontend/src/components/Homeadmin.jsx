// src/components/HomeAdmin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import axios from "axios";

function HomeAdmin() {
  const [admin, setAdmin] = useState(null);
  const [foto, setFoto] = useState(null);
  const [docUniversidad, setDocUniversidad] = useState(null);
  const [docBachillerato, setDocBachillerato] = useState(null);
  const [docSecundaria, setDocSecundaria] = useState(null);
  const [certificado, setCertificado] = useState(null);

  const navigate = useNavigate();

  // Verificar autenticación
  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem("usuario"));
    const token = localStorage.getItem("token");
    if (!adminData || !token) {
      navigate("/sesion", { replace: true });
      return;
    }
    setAdmin(adminData);
  }, [navigate]);

  // Cerrar sesión
  const cerrarSesion = () => {
    try {
      localStorage.removeItem("usuario");
      localStorage.removeItem("token");
      setAdmin(null);
      navigate("/sesion", { replace: true });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Subir foto de perfil
  const handleFotoSubmit = async (e) => {
    e.preventDefault();
    if (!foto) return alert("Selecciona una foto antes de subir");

    const formData = new FormData();
    formData.append("foto", foto);

    try {
      const token = localStorage.getItem("token");
       await axios.post("http://localhost:5000/api/documentos/subir-foto", formData,{
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Foto de perfil subida correctamente ✅");
    } catch (error) {
      console.error("Error al subir la foto:", error);
      alert("Error al subir la foto ❌");
    }
  };

  // Subir documento académico
  const handleDocSubmit = async (e, tipo, archivo) => {
    e.preventDefault();
    if (!archivo) return alert(`Selecciona un archivo de ${tipo} antes de subir`);

    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("tipo", tipo);

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/documentos/subir-academico", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert(`Documento de ${tipo} subido correctamente ✅`);
    } catch (error) {
      console.error(`Error al subir documento de ${tipo}:`, error);
      alert(`Error al subir documento de ${tipo} ❌`);
    }
  };

  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <Sidebar admin={admin} cerrarSesion={cerrarSesion} />

      {/* Contenido principal */}
      <main className="flex-grow-1 d-flex flex-column">
        <Navbar />

        <div className="flex-grow-1 p-4">
          <h2 className="mb-4 text-center">Panel de Administración</h2>

          {/* Subir foto */}
          <div className="card p-3 mb-4 shadow">
            <h4>Foto de Perfil</h4>
            <form onSubmit={handleFotoSubmit}>
              <input
                type="file"
                className="form-control mb-2"
                onChange={(e) => setFoto(e.target.files[0])}
                accept="image/jpeg,image/png"
              />
              <button type="submit" className="btn btn-primary w-100">
                Subir Foto
              </button>
            </form>
          </div>

          {/* Subir documentos académicos */}
          <div className="card p-3 shadow">
            <h4>Documentos Académicos (PDF)</h4>

            <form onSubmit={(e) => handleDocSubmit(e, "universidad", docUniversidad)}>
              <label className="form-label">Universidad</label>
              <input
                type="file"
                className="form-control mb-2"
                onChange={(e) => setDocUniversidad(e.target.files[0])}
                accept="application/pdf"
              />
              <button type="submit" className="btn btn-success w-100 mb-3">
                Subir Universidad
              </button>
            </form>

            <form onSubmit={(e) => handleDocSubmit(e, "bachillerato", docBachillerato)}>
              <label className="form-label">Bachillerato</label>
              <input
                type="file"
                className="form-control mb-2"
                onChange={(e) => setDocBachillerato(e.target.files[0])}
                accept="application/pdf"
              />
              <button type="submit" className="btn btn-success w-100 mb-3">
                Subir Bachillerato
              </button>
            </form>

            <form onSubmit={(e) => handleDocSubmit(e, "secundaria", docSecundaria)}>
              <label className="form-label">Secundaria</label>
              <input
                type="file"
                className="form-control mb-2"
                onChange={(e) => setDocSecundaria(e.target.files[0])}
                accept="application/pdf"
              />
              <button type="submit" className="btn btn-success w-100 mb-3">
                Subir Secundaria
              </button>
            </form>

            <form onSubmit={(e) => handleDocSubmit(e, "certificado", certificado)}>
              <label className="form-label">Certificados</label>
              <input
                type="file"
                className="form-control mb-2"
                onChange={(e) => setCertificado(e.target.files[0])}
                accept="application/pdf"
              />
              <button type="submit" className="btn btn-success w-100">
                Subir Certificado
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomeAdmin;
