// importaciones necesarias
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaBell } from "react-icons/fa";
import '../css/Home.css'

// función principal del componente Home
function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [usuario, setUsuario] = useState(null);
  const [secundaria, setSecundaria] = useState(null);
  const [bachillerato, setBachillerato] = useState(null);
  const [universidad, setUniversidad] = useState(null);
  const [Certificados, setCertificados] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [nuevas, setNuevas] = useState(0);
  const [mostrarPanel, setMostrarPanel] = useState(false);


  // ✅ Función para cerrar sesión
  const cerrarSesion = async () => {
    try {
      const token = localStorage.getItem('token');
      // Opcional: notificar al backend para invalidar sesión/token
      if (token) {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          credentials: 'include'
        }).catch(() => {/* silenciar errores de logout backend */});
      }
    } catch (e) {
      // no interrumpir el flujo de cierre de sesión por errores de red
    } finally {
      // Limpiar almacenamiento y estado local
      localStorage.removeItem('token');
      localStorage.removeItem('usuario'); // <- agregar esto
      sessionStorage.clear(); // opcional: limpiar sessionStorage por si hay datos ahí
      setUsuario(null);
      setDocumentos([]);
      setNotificaciones([]);
      setSecundaria(null);
      setBachillerato(null);
      setUniversidad(null);
      setCertificados(null);
      navigate('/sesion', { replace: true });
    }
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

  // Polling de notificaciones cada 10 segundos
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    // Función para obtener notificaciones
    const fetchNotificaciones = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/documentos/notificaciones", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotificaciones(res.data);
      } catch (err) {
        console.error("Error al obtener notificaciones:", err);
      }
    };
    // Primera llamada inmediata
    fetchNotificaciones();
    const intervalo = setInterval(fetchNotificaciones, 10000); // cada 10s
    return () => clearInterval(intervalo);
  }, []);

  // Función para subir archivos PDF
  const subirArchivo = async (archivo, tipo) => {
    if (!archivo || archivo.type !== "application/pdf") {
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
    // Verificar si hay sesión activa
    const token = localStorage.getItem("token")?.trim();
    if (!token) {
      alert("No hay sesión activa");
      return;
    }
    // Crear FormData para enviar la foto
    const formData = new FormData();
    formData.append("foto", fotoPerfil);

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

    } catch (error) {
      console.error("Error al subir foto:", error);
      alert(error.response?.data?.error || "Error al subir la foto");
    }
  };

  // ---Diseño principal de la página--- //
  return (
    <>
      {/* Imagen superior (usa encodeURI para manejar espacios en el nombre) */}
      <div className="top-image-container" style={{ textAlign: 'center', padding: '8px 0' }}>
        <img
          src={encodeURI('/ImagenSesver.png')}
          alt="Imagen superior"
          style={{ maxWidth: '80%', height: '100%', display: 'block', margin: '0 auto' }}
        />
      </div>

      {/* Barra de navegación superior */}
      <nav className="navbar navbar-light shadow-sm mb-4" style={{ backgroundColor: "#7A1737" }}>
        <div className="container-fluid d-flex justify-content-end align-items-center flex-nowrap gap-1 navbar-actions">

          {/* Botón de Notificaciones */}
          <div>
          <button
            className="btn btn-sm position-relative"
            style={{ padding: "4px 8px" }}
            onClick={() => setMostrarPanel(!mostrarPanel)}
          >
            <FaBell size={16} color="white" />
            {notificaciones.filter(n => !n.leido).length > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: "0.6rem", padding: "2px 4px" }}
              >
                {notificaciones.filter(n => !n.leido).length}
              </span>
            )}
          </button>

          {/* Botón Cerrar Sesión */}
          <button
            onClick={cerrarSesion}
            style={{
              backgroundColor: "#ff4d4f",
              color: "white",
              padding: "6px 12px",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              fontSize: "0.875rem"
            }}
          >
            Cerrar Sesión
          </button>
          </div>
        </div>


        {/* Panel desplegable de notificaciones */}
        {mostrarPanel && (
          <div
            className="card shadow position-absolute"
            style={{
              top: "60px",
              right: "5px",
              width: "235px",
              zIndex: 1000,
              maxHeight: "400px",
              overflowY: "auto"
            }}
          >
            <div className="card-header bg-white">
              <strong style={{ color: "#7A1737" }}>Notificaciones</strong>
            </div>
            <div className="card-body p-2 w-100 w-md-50">
              {notificaciones.length > 0 ? (
                notificaciones.map((n) => (
                  <div
                    key={n.id}
                    className={`d-flex justify-content-between align-items-start p-2 mb-2 rounded ${n.leido ? "bg-light" : "bg-white border"}`}
                  >
                    <div
                      style={{ cursor: "pointer", flex: 1 }}
                      onClick={async () => {
                        const token = localStorage.getItem("token");
                        await axios.put(
                          `http://localhost:5000/api/documentos/notificaciones/${n.id}/leido`,
                          {},
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setNotificaciones(prev =>
                          prev.map(item =>
                            item.id === n.id ? { ...item, leido: true } : item
                          )
                        );
                      }}
                    >
                      <small className="d-block">
                        <strong>{n.usuario}:</strong> {n.mensaje}
                      </small>
                      <small className="text-muted">
                        {new Date(n.fecha).toLocaleString()}
                      </small>
                    </div>
                    <button
                      className="btn p-0 text-danger ms-2"
                      style={{ fontSize: "2.5rem" }}
                      onClick={async (e) => {
                        e.stopPropagation();
                        const token = localStorage.getItem("token");
                        await axios.delete(
                          `http://localhost:5000/api/documentos/notificaciones/${n.id}`,
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setNotificaciones(prev => prev.filter(item => item.id !== n.id));
                      }}
                    > &times;
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-muted text-center">No hay notificaciones</div>
              )}
            </div>
          </div>
        )}
      </nav >


      {/* Contenedor principal */}
      < main className="container mt-5" style={{ maxWidth: "800px" }
      }>
        {/* Contenedor unificado de usuario + foto */}
        < div className="card shadow mb-4 w-100" >
          <div className="card-header bg-white border-0 ">
            <div className="d-flex align-items-center gap-2">
            <h4 className="mb-0" style={{ color: "#7A1737" }}>
              <i className="bi bi-person-circle me-2"></i>
              {/* Datos del usuario */}
              Datos del Usuario: {usuario ? usuario.usuario : 'Desconocido'}
            </h4>
            <button
              onClick={() => navigate('/editarUsuario', { state: { user: usuario } })}
              className="btn edit-user-btn"
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
                  </tbody>
                </table>
              ) : (
                <div className="text-muted">No hay datos de usuario.</div>
              )}
            </div>

            {/* Columna derecha: foto y botones */}
            <div className="col-12 col-md-4 text-center d-flex flex-column align-items-center justify-content-start user-photo-section">
              {usuario?.foto_perfil ? (
                <img
                  src={`http://localhost:5000/uploads/fotos/${usuario.id_personal}/${usuario.foto_perfil}`}
                  className="img-fluid mb-3 rounded-3"  // cuadrado con esquinas redondeadas
                  alt="Foto de usuario"
                  crossOrigin="use-credentials"
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                    border: "2px solid #7A1737"
                  }}
                />
              ) : (
                <div className="text-muted mb-3">No hay foto de perfil</div>
              )}

              {/* Input y botón para subir nueva foto */}
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                className="form-control rounded-3 mb-2"
                style={{ width: "100%", maxWidth: "200px" }}   // más ancho y alineado con la imagen
                onChange={e => setFotoPerfil(e.target.files[0])}
              />

              {/* Botón Subir Foto */}
              <button
                type="button"
                className="btn mb-2"
                style={{ backgroundColor: "#7A1737", color: "#fff", borderColor: "#7A1737", width: "100%", maxWidth: "200px" }} // mismo ancho que el input
                onClick={subirFotoPerfil}
              >
                <i className="bi bi-cloud-arrow-up-fill me-1"></i>
                Subir Foto
              </button>
            </div>
          </div>
        </div >

        {/* Información Académica */}
        < div className="card shadow mb-4 w-100" >
          <div className="card-header bg-white border-0">
            <h4 className="mb-0" style={{ color: "#7A1737" }}>
              <i className="bi bi-journal-text me-2"></i>
              Información Académica
            </h4>
          </div>
          <div className="card-body">
            {["Secundaria", "Bachillerato", "Universidad"].map((nivel, idx) => {
              const stateMap = { 0: secundaria, 1: bachillerato, 2: universidad };
              const setMap = { 0: setSecundaria, 1: setBachillerato, 2: setUniversidad };
              const tipo = nivel.toLowerCase();
              const documentoExistente = documentos.find(doc => doc.tipo === tipo);

              {/* Renderizado de cada nivel académico */ }
              return (
                <div key={nivel} className="d-flex flex-wrap align-items-center mb-3 academic-level">
                  <i className="bi bi-mortarboard-fill fs-4 me-3" style={{ color: "#7A1737" }}></i>
                  <label className="form-label mb-2 me-2 flex-shrink-0" style={{ minWidth: 160 }}>{nivel}</label>
                  <div className="d-flex flex-grow-1 align-items-center">

                  {!documentoExistente ? (
                    <>
                      {/* Input y botón para subir documento */}
                      <input
                        type="file"
                        accept=".pdf"
                        className="form-control mb-2 me-2 flex-grow-1"
                        style={{ flex: 1 }}
                        onChange={e => setMap[idx](e.target.files[0])}
                      />
                      <button
                        type="button"
                        className="btn mb-2"
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
                    <div className="ms-auto d-flex align-items-center gap-2"> {/* Botones Ver y Eliminar */}
                      <a
                        href={`http://localhost:5000/uploads/academico/${usuario?.id_personal}/${encodeURIComponent(documentoExistente.archivo)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm"
                        style={{
                          backgroundColor: "#7A1737",
                          color: "#fff",
                          border: "none",
                          padding: "6px 16px",
                          fontSize: "0.875rem",
                          borderRadius: "4px"
                        }}
                      >
                        Ver documento
                      </a>
                      <span
                        className={`badge ${documentoExistente.cotejado ? "bg-success" : "bg-warning text-dark"}`}
                        style={{
                          padding: "6px 16px",
                          fontSize: "0.875rem",
                          borderRadius: "4px",

                          minHeight: "32px", // Altura mínima para igualar los botones
                          display: "inline-flex", // Cambia a flex para mejor alineación
                          alignItems: "center", // Centra el texto verticalmente
                          justifyContent: "center", // Centra el texto horizontalmente
                          lineHeight: "1.5" // Ajusta la altura de línea para consistencia
                        }}
                      >
                        {documentoExistente.cotejado ? "Cotejado" : "Pendiente"}
                      </span>
                      <button
                        className="btn btn-sm"
                        style={{
                          backgroundColor: "#dc3545",
                          color: "#fff",
                          border: "none",
                          padding: "6px 16px",
                          fontSize: "0.875rem",
                          borderRadius: "4px"
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
          </div>
        </div >

        {/* Certificados */}
        <div className="card shadow mb-4 w-100">
          <div className="card-header bg-white border-0">
            <h4 className="mb-0" style={{ color: "#7A1737" }}>
              <i className="bi bi-award-fill me-2"></i>
              Certificados
            </h4>
          </div>
          <div className="card-body">
            {/* Nueva certificación */}
            <div className="d-flex flex-wrap align-items-center mb-3 new-certification">
              <i className="bi bi-file-earmark-text-fill fs-4 me-3" style={{ color: "#7A1737" }}></i>
              <label className="form-label mb-2 me-2 flex-shrink-0" style={{ minWidth: 160 }}>Nuevo certificado</label>
              <input
                type="file"
                accept=".pdf"
                className="form-control mb-2 me-2 flex-grow-1"
                style={{ flex: 1 }}
                onChange={e => setCertificados(e.target.files[0])}
              />
              <button
                type="button"
                className="btn mb-2"
                style={{ backgroundColor: "#7A1737", color: "#fff", borderColor: "#7A1737" }}
                onClick={() => subirArchivo(Certificados, "certificados")}
              >
                <i className="bi bi-cloud-arrow-up-fill me-1"></i>
                Subir
              </button>
              {Certificados && (
                <span className="ms-2 small text-muted">{Certificados.name}</span>
              )}
            </div>

            {/* Lista de certificados subidos */}
            {usuario && documentos.filter(doc => doc.tipo === "certificados").map((doc, index) => (
              <div key={doc.id} className="d-flex align-items-center mb-2 gap-1 certificados-row">
                <div className="d-flex align-items-center flex-grow-1 document-info">
                  <i className="bi bi-file-earmark-text fs-5 me-2" style={{ color: "#7A1737" }}></i>
                  <span className="me-auto">{doc.nombre_original || doc.archivo}</span>
                </div>
                <a
                  href={`http://localhost:5000/uploads/academico/${usuario.id_personal}/${encodeURIComponent(doc.archivo)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm"
                  style={{
                    backgroundColor: "#7A1737",
                    color: "#fff",
                    border: "none",
                    padding: "6px 16px",
                    fontSize: "0.875rem",
                    borderRadius: "4px"
                  }}
                >
                  Ver
                </a>
                <span
                  className={`badge ${doc.cotejado ? "bg-success" : "bg-warning text-dark"}`}
                  style={{
                    padding: "6px 16px",
                    fontSize: "0.875rem",
                    borderRadius: "4px",
                    minHeight: "32px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: "1.5"
                  }}
                >
                  {doc.cotejado ? "Cotejado" : "Pendiente"}
                </span>
                <button
                  className="btn btn-sm"
                  style={{
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    border: "none",
                    padding: "6px 16px",
                    fontSize: "0.875rem",
                    borderRadius: "4px"
                  }}
                  onClick={() => eliminarDocumento(doc.id)}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      </main >
    </>
  );
}

export default Home;