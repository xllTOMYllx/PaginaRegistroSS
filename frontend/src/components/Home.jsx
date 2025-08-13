import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function Home() {
  const navigate = useNavigate(); 
  const location = useLocation();
  const [usuario, setUsuario] = useState(null);

  // Estados para archivos académicos
  const [secundaria, setSecundaria] = useState(null);
  const [bachillerato, setBachillerato] = useState(null);
  const [universidad, setUniversidad] = useState(null);

  useEffect(() => {
    if (location.state && location.state.user) {
      setUsuario(location.state.user);
    }
  }, [location.state]);

  const subirArchivo = async (archivo, tipo) => {
    if (!archivo) {
      alert("Selecciona un archivo primero");
      return;
    }

    // Verificar que sea PDF
    if (archivo.type !== "application/pdf") {
      alert("Solo se permiten archivos en formato PDF");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("No hay sesión activa");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("archivo", archivo);
      formData.append("tipo", tipo);

      await axios.post("http://localhost:5000/api/documentos/subir-academico", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token.trim()}`
        }
      });

      alert(`Archivo de ${tipo} subido correctamente`);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        console.error(`Error al subir archivo de ${tipo}:`, error);
        alert("Error al subir el archivo");
      }
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 700 }}>
      {/* Datos del Usuario */}
      <div className="card shadow mb-4">
        <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
          <h4 className="mb-0" style={{ color: "#7A1737" }}>
            <i className="bi bi-person-circle me-2"></i>
            Datos del Usuario: {usuario ? usuario.usuario : 'Desconocido'}
          </h4>
          <button
            onClick={() => navigate('/editarUsuario', { state: { user: usuario } })}
            style={{
              backgroundColor: "#7A1737",
              color: "#fff",
              border: "none",
              padding: "8px 20px",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              letterSpacing: "1px"
            }}
          >
            <i className="bi bi-pencil-square me-1"></i>
            Editar
          </button>
        </div>
        <div className="card-body">
          {usuario ? (
            <table className="table table-borderless align-middle mb-0">
              <tbody>
                <tr><th>Nombre</th><td>{usuario.nombre || 'No disponible'}</td></tr>
                <tr><th>Apellido Paterno</th><td>{usuario.apellido_paterno || 'No disponible'}</td></tr>
                <tr><th>Apellido Materno</th><td>{usuario.apellido_materno || 'No disponible'}</td></tr>
                <tr><th>CURP</th><td>{usuario.curp || 'No disponible'}</td></tr>
                <tr><th>RFC</th><td>{usuario.rfc || 'No disponible'}</td></tr>
                <tr><th>Correo Electrónico</th><td>{usuario.correo || 'No disponible'}</td></tr>
              </tbody>
            </table>
          ) : (
            <div className="text-center text-muted">No hay datos de usuario. Inicia sesión para ver tu información.</div>
          )}
        </div>
      </div>

      {/* Archivos académicos */}
      {["Secundaria", "Bachillerato", "Universidad"].map((nivel, idx) => {
        const stateMap = { 0: secundaria, 1: bachillerato, 2: universidad };
        const setMap = { 0: setSecundaria, 1: setBachillerato, 2: setUniversidad };
        return (
          <div key={nivel} className="card shadow-sm mb-4">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-mortarboard-fill fs-4 me-3" style={{ color: "#7A1737" }}></i>
              <label className="form-label mb-0 me-2" style={{ minWidth: 160 }}>
                {nivel}
              </label>
              <input
                type="file"
                accept=".pdf"
                className="form-control rounded-3 me-2"
                style={{ flex: 1 }}
                onChange={e => setMap[idx](e.target.files[0])}
              />
              <button
                type="button"
                className="btn"
                style={{ backgroundColor: "#7A1737", color: "#fff", borderColor: "#7A1737" }}
                onClick={() => subirArchivo(stateMap[idx], nivel.toLowerCase())}
              >
                <i className="bi bi-cloud-arrow-up-fill me-1"></i>
                Subir
              </button>
              {stateMap[idx] && (
                <span className="ms-2 small text-muted">{stateMap[idx].name}</span>
              )}
            </div>
          </div>
        );
      })}

      {/* Certificados */}
      <div className="card shadow-sm mb-4">
        <div className="card-body d-flex align-items-center">
          <i className="bi bi-award-fill fs-4 me-3" style={{ color: "#7A1737" }}></i>
          <label className="form-label mb-0 me-2" style={{ minWidth: 160 }}>
            Certificados
          </label>
          <input
            type="file"
            accept=".pdf"
            className="form-control rounded-3 me-2"
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="btn"
            style={{ backgroundColor: "#7A1737", color: "#fff", borderColor: "#7A1737" }}
          >
            <i className="bi bi-cloud-arrow-up-fill me-1"></i>
            Subir
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
