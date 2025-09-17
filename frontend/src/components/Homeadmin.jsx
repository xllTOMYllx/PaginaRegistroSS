// src/components/HomeAdmin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import axios from "axios";

function HomeAdmin() {
  const [admin, setAdmin] = useState(null);
  const [fotoAdmin, setFotoAdmin] = useState(null);
  const [secundaria, setSecundaria] = useState(null);
  const [bachillerato, setBachillerato] = useState(null);
  const [universidad, setUniversidad] = useState(null);
  const [certificados, setCertificados] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const navigate = useNavigate();

  // Verificar autenticación al montar el componente
  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem("usuario"));
    const token = localStorage.getItem("token");
    if (!adminData || !token) {
      navigate('/sesion', { replace: true });
      return;
    }
    setAdmin(adminData);

    // Obtener documentos del admin
    fetchDocumentos(adminData.id_personal, token);
  }, [navigate]);

  const fetchDocumentos = async (idAdmin, token) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/documentos/mis-documentos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocumentos(res.data);
    } catch (err) {
      console.error("Error al obtener documentos:", err);
    }
  };

  // Función para cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    setAdmin(null);
    navigate('/sesion', { replace: true });
  };

  // Subir foto de perfil
  const subirFotoAdmin = async () => {
    if (!fotoAdmin || !["image/jpeg", "image/png", "image/jpg"].includes(fotoAdmin.type)) {
      alert("Selecciona una imagen válida (JPG o PNG)");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return;
    const formData = new FormData();
    formData.append("foto", fotoAdmin);
    try {
      await axios.post("http://localhost:5000/api/documentos/subir-foto", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const res = await axios.get("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmin(res.data);
    } catch (err) {
      console.error("Error al subir foto:", err);
    }
  };

  // Subir archivo PDF
  const subirArchivo = async (archivo, tipo) => {
    if (!archivo || archivo.type !== "application/pdf") return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("tipo", tipo);

    try {
      await axios.post("http://localhost:5000/api/documentos/subir-academico", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      fetchDocumentos(admin.id_personal, token);
    } catch (err) {
      console.error("Error al subir documento:", err);
    }
  };

  // Eliminar documento
  const eliminarDocumento = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await axios.delete(`http://localhost:5000/api/documentos/eliminar/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocumentos(prev => prev.filter(doc => doc.id !== id));
    } catch (err) {
      console.error("Error al eliminar documento:", err);
    }
  };

  if (!admin) return null;

  return (
    <div className="d-flex vh-100">
      <Sidebar admin={admin} cerrarSesion={cerrarSesion} />
      <main className="flex-grow-1 d-flex flex-column">
        <Navbar />

        <div className="container mt-4" style={{ maxWidth: "800px" }}>
          {/* Datos personales */}
          <div className="card shadow mb-4">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h4 style={{ color: "#7A1737" }}>Datos Personales del Administrador</h4>
            </div>
            <div className="row g-3 align-items-start p-3">
              <div className="col-12 col-md-8">
                <table className="table table-borderless align-middle mb-0">
                  <tbody>
                    <tr><th>Nombre</th><td>{admin.nombre}</td></tr>
                    <tr><th>Apellido Paterno</th><td>{admin.apellido_paterno}</td></tr>
                    <tr><th>Apellido Materno</th><td>{admin.apellido_materno}</td></tr>
                     <tr><th>CURP</th><td>{admin.curp}</td></tr>
                    <tr><th>RFC</th><td>{admin.rfc}</td></tr>
                    <tr><th>Correo</th><td>{admin.correo}</td></tr>
                    
                  </tbody>
                </table>
              </div>
              <div className="col-12 col-md-4 text-center d-flex flex-column align-items-center">
                {admin.foto_perfil ? (
                  <img
                    src={`http://localhost:5000/uploads/fotos/${admin.id_personal}/${admin.foto_perfil}`}
                    className="img-fluid mb-3 rounded-3"
                    alt="Foto administrador"
                    style={{ width: "220px", height: "220px", objectFit: "cover", border: "2px solid #7A1737" }}
                  />
                ) : <div className="text-muted mb-3">No hay foto</div>}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  className="form-control mb-2"
                  style={{ width: "90%" }}
                  onChange={e => setFotoAdmin(e.target.files[0])}
                />
                <button
                  className="btn mb-2"
                  style={{ backgroundColor: "#7A1737", color: "#fff", width: "90%" }}
                  onClick={subirFotoAdmin}
                >
                  Subir Foto
                </button>
              </div>
            </div>
          </div>

          {/* Documentos */}
          <div className="card shadow mb-4">
            <div className="card-header bg-white">
              <h4 style={{ color: "#7A1737" }}>Documentos Académicos</h4>
            </div>
            <div className="card-body">
              {["Secundaria", "Bachillerato", "Universidad"].map((nivel, idx) => {
                const stateMap = { 0: secundaria, 1: bachillerato, 2: universidad };
                const setMap = { 0: setSecundaria, 1: setBachillerato, 2: setUniversidad };
                const tipo = nivel.toLowerCase();
                const documentoExistente = documentos.find(doc => doc.tipo === tipo);

                return (
                  <div key={nivel} className="d-flex flex-wrap align-items-center mb-3">
                    <label className="form-label mb-2 me-2 flex-shrink-0" style={{ minWidth: 160 }}>{nivel}</label>

                    {!documentoExistente ? (
                      <>
                        <input
                          type="file"
                          accept=".pdf"
                          className="form-control mb-2 me-2 flex-grow-1"
                          style={{ flex: 1 }}
                          onChange={e => setMap[idx](e.target.files[0])}
                        />
                        <button
                          className="btn mb-2"
                          style={{ backgroundColor: "#7A1737", color: "#fff", borderColor: "#7A1737" }}
                          onClick={() => subirArchivo(stateMap[idx], tipo)}
                        >
                          Subir
                        </button>
                        {stateMap[idx] && <span className="ms-2 small text-muted">{stateMap[idx].name}</span>}
                      </>
                    ) : (
                      <div className="ms-auto d-flex align-items-center">
                        <a
                          href={`http://localhost:5000/uploads/academico/${admin.id_personal}/${documentoExistente.archivo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm me-2"
                          style={{ backgroundColor: "#7A1737", color: "#fff", border: "none" }}
                        >
                          Ver
                        </a>
                        <span className={`badge ms-2 ${documentoExistente.cotejado ? "bg-success" : "bg-warning text-dark"}`}>
                          {documentoExistente.cotejado ? "Cotejado" : "Pendiente"}
                        </span>
                        <button
                          className="btn btn-sm"
                          style={{ backgroundColor: "#dc3545", color: "#fff", border: "none" }}
                          onClick={() => eliminarDocumento(documentoExistente.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Certificados */}
              <div className="mt-4">
                <h5>Certificados</h5>
                <div className="d-flex align-items-center mb-2">
                  <input
                    type="file"
                    accept=".pdf"
                    className="form-control me-2"
                    onChange={e => setCertificados(e.target.files[0])}
                  />
                  <button
                    className="btn"
                    style={{ backgroundColor: "#7A1737", color: "#fff" }}
                    onClick={() => subirArchivo(certificados, "certificados")}
                  >
                    Subir
                  </button>
                  {certificados && <span className="ms-2 small text-muted">{certificados.name}</span>}
                </div>
                {documentos.filter(doc => doc.tipo === "certificados").map(doc => (
                  <div key={doc.id} className="d-flex align-items-center mb-2">
                    <span className="me-auto">{doc.nombre_original || doc.archivo}</span>
                    <a
                      href={`http://localhost:5000/uploads/academico/${admin.id_personal}/${doc.archivo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm me-2"
                      style={{ backgroundColor: "#7A1737", color: "#fff", border: "none" }}
                    >
                      Ver
                    </a>
                    <span className={`badge ms-2 ${doc.cotejado ? "bg-success" : "bg-warning text-dark"}`}>
                      {doc.cotejado ? "Cotejado" : "Pendiente"}
                    </span>
                    <button
                      className="btn btn-sm"
                      style={{ backgroundColor: "#dc3545", color: "#fff", border: "none" }}
                      onClick={() => eliminarDocumento(doc.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomeAdmin;
