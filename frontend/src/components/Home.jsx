
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa';

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [usuario, setUsuario] = useState(null);

  const [secundaria, setSecundaria] = useState(null);
  const [bachillerato, setBachillerato] = useState(null);
  const [universidad, setUniversidad] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null); // Estado para la imagen de perfil
  const [profileUrl, setProfileUrl] = useState('default-avatar.jpg'); // URL inicial de imagen (ajusta si tienes una por defecto)

  useEffect(() => {
    if (location.state && location.state.user) {
      setUsuario(location.state.user);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchDocumentos = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:5000/api/documentos/mis-documentos", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDocumentos(res.data);
      } catch (error) {
        console.error("Error al obtener documentos:", error);
      }
    };

    fetchDocumentos();
  }, []);

  const subirArchivo = async (archivo, tipo) => {
    if (!archivo || archivo.type !== "application/pdf") {
      ////alert("Selecciona un archivo PDF válido");
      return;
    }

    const token = localStorage.getItem("token")?.trim();
    if (!token) {
      alert("No hay sesión activa");
      return;
    }

    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("tipo", tipo);

    try {
      await axios.post("http://localhost:5000/api/documentos/subir-academico", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        }
      });

      //alert(`Archivo de ${tipo} subido correctamente`);
      window.location.reload();
    } catch (error) {
      console.error("Error al subir archivo:", error);
      //alert(error.response?.data?.error || "Error al subir el archivo");
    }
  };
  //subir foto de perfil
  const subirProfilePicture = async () => {
    if (!profilePicture) return;

    const token = localStorage.getItem("token")?.trim();
    if (!token) {
      alert("No hay sesión activa");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", profilePicture);

    try {
      const res = await axios.post("http://localhost:5000/api/documentos/subir-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        }
      });
      setProfileUrl(res.data.file); // Ajusta según la respuesta del backend
    alert("Imagen de perfil subida correctamente");
  } catch (error) {
    console.error("Error al subir imagen:", error.response?.data || error.message);
    alert(error.response?.data?.error || "Error al subir la imagen");
  }
  };

  const eliminarProfilePicture = async () => {
    const token = localStorage.getItem("token")?.trim();
    if (!token) {
      alert("No hay sesión activa");
      return;
    }

    try {
      await axios.delete("http://localhost:5000/api/documentos/eliminar-profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileUrl('default-avatar.jpg'); // Vuelve a default
      alert("Imagen de perfil eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar imagen:", error);
      alert(error.response?.data?.error || "Error al eliminar la imagen");
    }
  };

  const eliminarDocumento = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    //if (!window.confirm("¿Estás seguro de que deseas eliminar este documento?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/documentos/eliminar/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocumentos(prev => prev.filter(doc => doc.id !== id));
      //alert("Documento eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar documento:", error);
      //alert("No se pudo eliminar el documento");
    }
  };

  return (
   <div className="d-flex flex-column align-items-center min-vh-100">
      <div className="container py-4" style={{ maxWidth: '800px', width: '90%' }}>
       {/* Foto de Perfil */}
<div className="card shadow mb-4 text-center">
  <div className="card-header bg-white border-0">
    <h4 className="mb-0" style={{ color: "#7A1737" }}>
      Foto de Perfil
    </h4>
  </div>
  <div className="card-body d-flex flex-column align-items-center">
    <div style={{ position: "relative", width: "160px", height: "160px" }}>
      <img
        src={profileUrl}
        alt="Foto de perfil"
        className="rounded-circle shadow"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          border: "4px solid #7A1737",
        }}
      />
      {/* Icono hover */}
      <label
        htmlFor="profileUpload"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          cursor: "pointer",
          backgroundColor: "rgba(122,23,55,0.7)",
          borderRadius: "50%",
          padding: "10px",
        }}
      >
        <FaPencilAlt size={20} color="#fff" />
      </label>
      <input
        type="file"
        id="profileUpload"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => setProfilePicture(e.target.files[0])}
      />
    </div>

    {/* Botones de acción */}
    <div className="mt-3 d-flex gap-2">
      <button
        type="button"
        onClick={subirProfilePicture}
        className="btn"
        style={{
          backgroundColor: "#7A1737",
          color: "#fff",
          borderColor: "#7A1737",
          minWidth: "120px",
        }}
      >
        <i className="bi bi-cloud-arrow-up-fill me-1"></i>
        Subir
      </button>

      {profileUrl !== "default-avatar.jpg" && (
        <button
          type="button"
          onClick={eliminarProfilePicture}
          className="btn"
          style={{
            backgroundColor: "#dc3545",
            color: "#fff",
            borderColor: "#dc3545",
            minWidth: "120px",
          }}
        >
          <FaTrashAlt className="me-1" /> Eliminar
        </button>
      )}
    </div>
  </div>
</div>

    {/* Datos del Usuario */}
    <div className="container mt-5" style={{ maxWidth: 700 }}>
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

      {["Secundaria", "Bachillerato", "Universidad"].map((nivel, idx) => {
        const stateMap = { 0: secundaria, 1: bachillerato, 2: universidad };
        const setMap = { 0: setSecundaria, 1: setBachillerato, 2: setUniversidad };
        const tipo = nivel.toLowerCase();
        const documentoExistente = documentos.find(doc => doc.tipo === tipo);

        return (
          <div key={nivel} className="card shadow-sm mb-4">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-mortarboard-fill fs-4 me-3" style={{ color: "#7A1737" }}></i>
              <label className="form-label mb-0 me-2" style={{ minWidth: 160 }}>
                {nivel}
              </label>

              {!documentoExistente ? (
                <>
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
                    onClick={() => subirArchivo(stateMap[idx], tipo)}
                  >
                    <i className="bi bi-cloud-arrow-up-fill me-1"></i>
                    Subir
                  </button>
                  {stateMap[idx] && (
                    <span className="ms-2 small text-muted">{stateMap[idx].name}</span>
                  )}
                </>
              ) : (
                <div className="ms-auto d-flex align-items-center">
                  <a
                    href={`http://localhost:5000/uploads/academico/${usuario.id_personal}/${documentoExistente.archivo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm me-2"
                    style={{
                      backgroundColor: "#7A1737",
                      color: "#fff",
                      border: "none"
                    }}
                  >
                    Ver documento
                  </a>
                  <button
                    className="btn btn-sm"
                    style={{
                      backgroundColor: "#dc3545",
                      color: "#fff",
                      border: "none"
                    }}
                    onClick={() => eliminarDocumento(documentoExistente.id)}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

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
  </div>
</div>
  );
}
export default Home;
