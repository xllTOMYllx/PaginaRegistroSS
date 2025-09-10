
// importaciones necesarias
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaBell } from "react-icons/fa";

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
  const cerrarSesion = () => {
  localStorage.removeItem('token'); // Elimina el token
  setUsuario(null); // Limpia el estado del usuario
  setDocumentos([]); // Limpia los documentos
  setNotificaciones([]); // Limpia las notificaciones
  setSecundaria(null); // Limpia estado de secundaria
  setBachillerato(null); // Limpia estado de bachillerato
  setUniversidad(null); // Limpia estado de universidad
  setCertificados(null); // Limpia estado de certificados
  navigate('/sesion', { replace: true }); // Redirige sin guardar en historial
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
      {/* Barra de navegación superior */}
      <nav className="navbar navbar-light bg-white shadow-sm mb-4">
        <div className="container-fluid d-flex justify-content-end align-items-center gap-3">

          {/* Botón de Notificaciones */}
          <button
            className="btn position-relative"
            onClick={() => setMostrarPanel(!mostrarPanel)}
          >
            <FaBell size={20} />
            {notificaciones.filter(n => !n.leido).length > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: "0.7rem" }}
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
              padding: "8px 16px",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}
            className="btn btn-danger btn-sm"
          >
            Cerrar sesión
          </button>
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
      < main className="container mt-4" style={{ maxWidth: "800px"}
      }>
        {/* Contenedor unificado de usuario + foto */}
        < div className="card shadow mb-4 w-100" >
          <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
            <h4 className="mb-0" style={{ color: "#7A1737" }}>
              <i className="bi bi-person-circle me-2"></i>
              {/* Datos del usuario */}
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
              {/* Botón Editar */}
              <i className="bi bi-pencil-square me-1"></i>
              Editar
            </button>
          </div>

          {/* Cuerpo con dos columnas: info usuario + foto */}
          <div className="row g-3 align-items-start">
            {/* Columna izquierda: info del usuario */}
            <div className="col-12 col-md-8">
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
                <div className="text-muted">No hay datos de usuario.</div>
              )}
            </div>

            {/* Columna derecha: foto y botones */}
            <div className="col-12 col-md-4 text-center d-flex flex-column align-items-center justify-content-start">
              {usuario?.foto_perfil ? (
                <img
                  src={`http://localhost:5000/uploads/fotos/${usuario.id_personal}/${usuario.foto_perfil}`}
                  className="img-fluid mb-3 rounded-3"  // cuadrado con esquinas redondeadas
                  alt="Foto de usuario"
                  crossOrigin="use-credentials"
                  style={{
                    width: "220px",
                    height: "220px",
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
                style={{ width: "90%" }}   // más ancho y alineado con la imagen
                onChange={e => setFotoPerfil(e.target.files[0])}
              />

              {/* Botón Subir Foto */}
              <button
                type="button"
                className="btn mb-2"
                style={{ backgroundColor: "#7A1737", color: "#fff", borderColor: "#7A1737", width: "90%" }} // mismo ancho que el input
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
                <div key={nivel} className="d-flex flex-wrap align-items-center mb-3">
                  <i className="bi bi-mortarboard-fill fs-4 me-3" style={{ color: "#7A1737" }}></i>
                  <label className="form-label mb-2 me-2 flex-shrink-0" style={{ minWidth: 160 }}>{nivel}</label>

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
                    <div className="ms-auto d-flex align-items-center"> {/* Botones Ver y Eliminar */}
                      <a
                        href={`http://localhost:5000/uploads/academico/${usuario.id_personal}/${documentoExistente.archivo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm me-2"
                        style={{ backgroundColor: "#7A1737", color: "#fff", border: "none" }}
                      >
                        Ver documento
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
          </div>
        </div >

        {/* Certificados */}
        < div className="card shadow mb-4 w-100" >
          <div className="card-header bg-white border-0">
            <h4 className="mb-0" style={{ color: "#7A1737" }}>
              <i className="bi bi-award-fill me-2"></i>
              Certificados
            </h4>
          </div>
          <div className="card-body">
            {/* Input para subir un nuevo certificado */}
            <div className="row g-2 align-items-center">
              <div className="col-12 col-md-auto">
                <i className="bi bi-file-earmark-text-fill fs-4" style={{ color: "#7A1737" }}></i>
              </div>
              <div className="col-12 col-md-auto">
                <label className="form-label mb-0">Nuevo certificado</label>
              </div>
              <div className="col col-md">
                <input
                  type="file"
                  accept=".pdf"
                  className="form-control rounded-3 mb-2 w-100"
                  onChange={e => setCertificados(e.target.files[0])}
                />
              </div>
              <div className="col-12 col-md-auto">
                <button
                  type="button"
                  className="btn mb-2"
                  style={{ backgroundColor: "#7A1737", color: "#fff", borderColor: "#7A1737" }}
                  onClick={() => subirArchivo(Certificados, "certificados")}
                >
                  <i className="bi bi-cloud-arrow-up-fill me-1"></i>
                  Subir
                </button>
              </div>

              {Certificados && (
                <div className="col-12">
                  <span className="small text-muted">{Certificados.name}</span>
                </div>
              )}
            </div>

            {/* Lista de certificados subidos */}
            {usuario && documentos.filter(doc => doc.tipo === "certificados").map((doc, index) => (
              <div key={doc.id} className="d-flex align-items-center mb-2">
                <i className="bi bi-file-earmark-text fs-5 me-3" style={{ color: "#7A1737" }}></i>
                <span className="me-auto">{doc.nombre_original || doc.archivo} </span>
                <a
                  href={`http://localhost:5000/uploads/academico/${usuario.id_personal}/${doc.archivo}`}
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
        </div >
      </main >
    </>
  );
}

export default Home;