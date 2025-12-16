// importaciones necesarias
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaBell } from "react-icons/fa";
import { formatEstudios, normalizarTipoDocumento } from '../utils/validations';
import { useAuth } from '../context/AuthContext';
import '../css/Home.css'
// función principal del componente Home
function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [usuario, setUsuario] = useState(null);
  const [secundaria, setSecundaria] = useState(null);
  const [bachillerato, setBachillerato] = useState(null);
  const [universidad, setUniversidad] = useState(null);
  const [Certificados, setCertificados] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [nuevas, setNuevas] = useState(0);
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [activeSection, setActiveSection] = useState('user');


  // ✅ Función para cerrar sesión
  const cerrarSesion = () => {
    // Limpiar almacenamiento local
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    sessionStorage.clear();

    // Limpiar contexto global
    setUser(null);

    // Limpiar estado local del componente
    setUsuario(null);
    setDocumentos([]);
    setNotificaciones([]);
    setSecundaria(null);
    setBachillerato(null);
    setUniversidad(null);
    setCertificados(null);

    // Navegar a la página de sesión
    navigate('/sesion', { replace: true });
  };

  // Obtener el usuario autenticado al cargar el componente
  useEffect(() => {
    const token = localStorage.getItem('token'); // obtener token del almacenamiento local
    if (token) {
      fetch('http://localhost:5000/api/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          setUsuario(data);
        })
        .catch(err => {
          console.error('Error al obtener usuario:', err);
        });
    }
  }, []);

  // Si se pasa un usuario desde la navegación, actualizar el estado
  useEffect(() => {
    if (location.state && location.state.user) {
      setUsuario(location.state.user);
    }
  }, [location.state]);

  // Obtener documentos del usuario autenticado
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

  //----DOCUMENTOS ACADEMICOS-----//
  // Función para subir archivos PDF
  const subirArchivo = async (archivo, tipo) => {
    if (!archivo || archivo.type !== "application/pdf") {
      return;
    }

    // Evitar clics múltiples durante la carga
    if (isUploading) {
      return;
    }

    // Verificar si hay sesión activa
    const token = localStorage.getItem("token")?.trim();
    if (!token) {
      alert("No hay sesión activa");
      return;
    }

    // Crear FormData para enviar el archivo
    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("tipo", tipo);

    setIsUploading(true);
    try {
      await axios.post("http://localhost:5000/api/documentos/subir-academico", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        }
      });
      window.location.reload();
    } catch (error) {
      console.error("Error al subir archivo:", error);
      setIsUploading(false);
    }
  };

  // Función para eliminar un documento
  const eliminarDocumento = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await axios.delete(`http://localhost:5000/api/documentos/eliminar/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocumentos(prev => prev.filter(doc => doc.id !== id));
    } catch (error) {
      console.error("Error al eliminar documento:", error);
    }
  };

  //----IMAGENES-----//
  // variables de estado para la foto de perfil
  const [fotoPerfil, setFotoPerfil] = useState(null);
  // Función para subir la foto de perfil
  const subirFotoPerfil = async () => {
    if (!fotoPerfil || !["image/jpeg", "image/png", "image/jpg"].includes(fotoPerfil.type)) {
      alert("Selecciona una imagen válida (JPG o PNG)");
      return;
    }
    // Evitar clics múltiples durante la carga
    if (isUploading) {
      return;
    }
    // Verificar si hay sesión activa
    const token = localStorage.getItem("token")?.trim();
    if (!token) {
      alert("No hay sesión activa");
      return;
    }
    // Crear FormData para enviar la foto
    const formData = new FormData();
    formData.append("foto", fotoPerfil);

    setIsUploading(true);
    try {
      await axios.post("http://localhost:5000/api/documentos/subir-foto", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        }
      });
      // Vuelve a consultar los datos del usuario para obtener la nueva foto
      const userRes = await axios.get("http://localhost:5000/api/users/me", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      setUsuario(userRes.data);
      setIsUploading(false);

    } catch (error) {
      console.error("Error al subir foto:", error);
      alert(error.response?.data?.error || "Error al subir la foto");
      setIsUploading(false);
    }
  };

  // ---Diseño principal de la página--- //
  return (
    <div className="home-page">
      {/* Imagen superior (usa encodeURI para manejar espacios en el nombre) */}
      <div className="top-image-container">
        <img
          src={encodeURI('/ImagenSesver.png')}
          alt="Imagen superior"
          className="top-image"
        />
      </div>

      {/* Barra de navegación superior */}
      <nav className="navbar navbar-light shadow-sm mb-4 home-navbar">
        <div className="container-fluid d-flex align-items-center flex-nowrap gap-2 navbar-actions">
          <div className="d-flex align-items-center flex-wrap gap-2 home-nav-left">
            <button
              className="btn btn-sm text-white home-nav-btn"
              onClick={() => setActiveSection('user')}
            >
              Datos del usuario
            </button>
            <button
              className="btn btn-sm text-white home-nav-btn"
              onClick={() => setActiveSection('academic')}
            >
              Información académica
            </button>
            <button
              className="btn btn-sm text-white home-nav-btn"
              onClick={() => setActiveSection('certs')}
            >
              Certificados
            </button>
          </div>
          <div className="d-flex align-items-center ms-auto home-nav-right">
            <button
              onClick={cerrarSesion}
              className="btn logout-btn-nav"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

      </nav >

      {/* Contenedor principal */}
      < main className="container mt-5 home-main auto flex">
        {/* Contenedor unificado de usuario + foto */}
        {activeSection === 'user' && (
          < div className="card shadow mb-4 w-100" >
            <div className="card-header bg-white border-0 ">
              <div className="d-flex align-items-center gap-2">
                <h4 className="mb-0 home-title">
                  <i className="bi bi-person-circle me-2"></i>
                  {/* Datos del usuario */}
                  Datos del Usuario: {usuario ? usuario.usuario : 'Desconocido'}
                </h4>
                <button
                  onClick={() => navigate('/editarUsuario', { state: { user: usuario } })}
                  className="btn edit-user-btn"
                >
                  {/* Botón Editar */}
                  <i className="bi bi-pencil-square me-1"></i>
                  Editar
                </button>
              </div>
            </div>

            {/* Cuerpo con dos columnas: info usuario + foto */}
            <div className="row g-3 align-items-start flex-column flex-md-row">
              {/* Columna izquierda: info del usuario */}
              <div className="col-12 col-md-8">
                {usuario ? (
                  <table className="table table-borderless align-middle mb-0 user-info-table">
                    <tbody>
                      <tr><th>Nombre</th><td>{usuario.nombre || 'No disponible'}</td></tr>
                      <tr><th>Apellido Paterno</th><td>{usuario.apellido_paterno || 'No disponible'}</td></tr>
                      <tr><th>Apellido Materno</th><td>{usuario.apellido_materno || 'No disponible'}</td></tr>
                      <tr><th>CURP</th><td>{usuario.curp || 'No disponible'}</td></tr>
                      <tr><th>RFC</th><td>{usuario.rfc || 'No disponible'}</td></tr>
                      <tr><th>Correo Electrónico</th><td>{usuario.correo || 'No disponible'}</td></tr>
                      <tr><th>Estudios</th><td>{formatEstudios(usuario.estudios)}</td></tr>
                    </tbody>
                  </table>
                ) : (
                  <div className="text-muted">No hay datos de usuario.</div>
                )}
              </div>

              {/* Columna derecha: foto y botones */}
              <div className="col-12 col-md-4 text-center d-flex flex-column align-items-center justify-content-start user-photo-section">
                <img
                  src={
                    usuario?.foto_perfil
                      ? `http://localhost:5000/uploads/fotos/${usuario.id_personal}/${usuario.foto_perfil}`
                      : "http://localhost:5000/uploads/default-avatar.jpg"
                  }
                  className="img-fluid mb-3 rounded-3 user-photo-img"
                  alt="Foto de usuario"
                  crossOrigin="use-credentials"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "http://localhost:5000/uploads/default-avatar.jpg";
                  }}
                />

                {/* Input y botón para subir nueva foto */}
                <div className="alert alert-info py-1 mb-2" role="alert" style={{ fontSize: '0.85rem' }}>
                  Formatos permitidos: JPG o PNG.
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  className="form-control rounded-3 mb-2 user-photo-input"
                  id="fotoPerfil"
                  onChange={e => setFotoPerfil(e.target.files[0])}
                />

                {/* Botón Subir Foto */}
                <button
                  type="button"
                  className="btn mb-2 user-photo-upload"
                  onClick={subirFotoPerfil}
                  disabled={isUploading}
                >
                  <i className="bi bi-cloud-arrow-up-fill me-1"></i>
                  {isUploading ? "Subiendo..." : "Subir Foto"}
                </button>
              </div>
            </div>
          </div >
        )}

        {/* Información Académica */}
        {activeSection === 'academic' && (
          < div className="card shadow mb-4 w-100" >
            <div className="card-header bg-white border-0">
              <h4 className="mb-0 home-title">
                <i className="bi bi-journal-text me-2"></i>
                Información Académica
              </h4>
            </div>
            <div className="card-body">
              <div className="alert alert-info py-1 mb-3" role="alert" style={{ fontSize: '0.85rem' }}>
                Formato permitido: PDF únicamente. Sugerencia: No subir documentos con el mismo nombre.
              </div>
              {["Secundaria", "Bachillerato", "Universidad"].map((nivel, idx) => {
                const stateMap = { 0: secundaria, 1: bachillerato, 2: universidad };
                const setMap = { 0: setSecundaria, 1: setBachillerato, 2: setUniversidad };
                const tipo = normalizarTipoDocumento(nivel);
                const documentoExistente = documentos.find(doc => doc.tipo === tipo);

                {/* Renderizado de cada nivel académico */ }
                return (
                  <div key={nivel} className="d-flex flex-wrap align-items-center mb-3 academic-level">
                    <i className="bi bi-mortarboard-fill fs-4 me-3 academic-icon"></i>
                    <label className="form-label mb-2 me-2 flex-shrink-0 academic-label">{nivel}</label>
                    <div className="d-flex flex-grow-1 align-items-center">

                      {!documentoExistente ? (
                        <>
                          {/* Input y botón para subir documento */}
                          <input
                            type="file"
                            accept=".pdf"
                            className="form-control mb-2 me-2 flex-grow-1 academic-input"
                            onChange={e => setMap[idx](e.target.files[0])}
                          />
                          <button
                            type="button"
                            className="btn mb-2 academic-upload-btn"
                            onClick={() => subirArchivo(stateMap[idx], tipo)}
                            disabled={isUploading}
                          >
                            <i className="bi bi-cloud-arrow-up-fill me-1"></i>
                            {isUploading ? "Subiendo..." : "Subir"}
                          </button>
                          {stateMap[idx] && (
                            <span className="ms-2 small text-muted">{stateMap[idx].name}</span>
                          )}
                        </>
                      ) : (
                        <div className="ms-auto d-flex align-items-center gap-2"> {/* Botones Ver y Eliminar */}
                          <a
                            href={`http://localhost:5000/uploads/academico/${usuario?.id_personal}/${encodeURIComponent(documentoExistente.archivo)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm doc-view-btn"
                          >
                            Ver documento
                          </a>
                          <span
                            className={`badge ${documentoExistente.cotejado ? "bg-success" : "bg-warning text-dark"} doc-badge`}
                          >
                            {documentoExistente.cotejado ? "Cotejado" : "Pendiente"}
                          </span>
                          <button
                            className="btn btn-sm doc-delete-btn"
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
            </div>
          </div >
        )}

        {/* Certificados */}
        {activeSection === 'certs' && (
          <div className="card shadow mb-4 w-100">
            <div className="card-header bg-white border-0">
              <h4 className="mb-0 home-title">
                <i className="bi bi-award-fill me-2"></i>
                Certificados
              </h4>
            </div>
            <div className="card-body">
              <div className="alert alert-info py-1 mb-3" role="alert" style={{ fontSize: '0.85rem' }}>
                Formato permitido: PDF únicamente. Sugerencia: No subir documentos con el mismo nombre.
              </div>
              {/* Nueva certificación */}
              <div className="d-flex flex-wrap align-items-center mb-3 new-certification">
                <i className="bi bi-file-earmark-text-fill fs-4 me-3 academic-icon"></i>
                <label className="form-label mb-2 me-2 flex-shrink-0 academic-label">Nuevo certificado</label>
                <input
                  type="file"
                  accept=".pdf"
                  className="form-control mb-2 me-2 flex-grow-1 academic-input"
                  onChange={e => setCertificados(e.target.files[0])}
                />
                <button
                  type="button"
                  className="btn mb-2 academic-upload-btn"
                  onClick={() => subirArchivo(Certificados, "certificados")}
                  disabled={isUploading}
                >
                  <i className="bi bi-cloud-arrow-up-fill me-1"></i>
                  {isUploading ? "Subiendo..." : "Subir"}
                </button>
                {Certificados && (
                  <span className="ms-2 small text-muted">{Certificados.name}</span>
                )}
              </div>

              {/* Lista de certificados subidos */}
              {usuario && documentos.filter(doc => doc.tipo === "certificados").map((doc, index) => (
                <div key={doc.id} className="d-flex align-items-center mb-2 gap-1 certificados-row">
                  <div className="d-flex align-items-center flex-grow-1 document-info">
                    <i className="bi bi-file-earmark-text fs-5 me-2 doc-icon"></i>
                    <span className="me-auto">{doc.nombre_original || doc.archivo}</span>
                  </div>
                  <a
                    href={`http://localhost:5000/uploads/academico/${usuario.id_personal}/${encodeURIComponent(doc.archivo)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm doc-view-btn"
                  >
                    Ver
                  </a>
                  <span
                    className={`badge ${doc.cotejado ? "bg-success" : "bg-warning text-dark"} doc-badge`}
                  >
                    {doc.cotejado ? "Cotejado" : "Pendiente"}
                  </span>
                  <button
                    className="btn btn-sm doc-delete-btn"
                    onClick={() => eliminarDocumento(doc.id)}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main >
    </div>
  );
}

export default Home;