
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

  // ✅ Función para cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem("token"); // elimina el token
    setUsuario(null); // limpia el estado del usuario
    navigate("/sesion"); // redirige a la ruta de login o inicio
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
    <div className="d-flex flex-column align-items-center min-vh-100">

      {/* Botón Cerrar Sesión */}
      <button
        onClick={cerrarSesion}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          backgroundColor: "#ff4d4f",
          color: "white",
          padding: "8px 16px",
          border: "none",
          borderRadius: "20px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Cerrar sesión
      </button>

      {/* Panel de Notificaciones */}
      <div style={{ position: "absolute", top: "10px", right: "160px" }}>
        <button
          className="btn position-relative"
          onClick={() => setMostrarPanel(!mostrarPanel)}  // 👈 toggle del panel
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
        > {/* Contenido del panel */}
          <div className="card-header bg-white">
            <strong style={{ color: "#7A1737" }}>Notificaciones</strong>
          </div>
          <div className="card-body p-2">
            {notificaciones.length > 0 ? (
              notificaciones.map((n) => (
                <div
                  key={n.id}
                  className={`d-flex justify-content-between align-items-start p-2 mb-2 rounded ${n.leido ? "bg-light" : "bg-white border"}`}
                >
                  {/* Texto de la notificación (clic = marcar como leída) */}
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
                  > {/* Contenido de la notificación */}
                    <small className="d-block">
                      <strong>{n.usuario}:</strong> {n.mensaje}
                    </small>
                    <small className="text-muted">
                      {new Date(n.fecha).toLocaleString()}
                    </small>
                  </div>

                  {/* Botón eliminar */}
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

      {/* Contenedor principal */}
      <div className="container py-4" style={{ maxWidth: '800px', width: '90%' }}>
        {/* Contenedor unificado de usuario + foto */}
        <div className="card shadow mb-4">
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
          <div className="card-body d-flex align-items-start">
            {/* Columna izquierda: info del usuario */}
            <div className="flex-grow-1 pe-4">
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
            <div className="d-flex flex-column align-items-center">
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
                style={{ width: "250px" }}   // más ancho y alineado con la imagen
                onChange={e => setFotoPerfil(e.target.files[0])}
              />
              {/* Botón Subir Foto */}
              <button
                type="button"
                className="btn"
                style={{ backgroundColor: "#7A1737", color: "#fff", borderColor: "#7A1737", width: "250px" }} // mismo ancho que el input
                onClick={subirFotoPerfil}
              >
                <i className="bi bi-cloud-arrow-up-fill me-1"></i>
                Subir Foto
              </button>
            </div>
          </div>
        </div>

        {/* Información Académica */}
      <div className="card shadow mb-4">
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
            {/* Renderizado de cada nivel académico */}
            return (
              <div key={nivel} className="mb-3 d-flex align-items-center">
                <i className="bi bi-mortarboard-fill fs-4 me-3" style={{ color: "#7A1737" }}></i>
                <label className="form-label mb-0 me-2" style={{ minWidth: 160 }}>{nivel}</label>
            
                {!documentoExistente ? (
                  <>
                  {/* Input y botón para subir documento */}
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
      </div>

      {/* Certificados */}
      <div className="card shadow mb-4">
        <div className="card-header bg-white border-0">
          <h4 className="mb-0" style={{ color: "#7A1737" }}>
            <i className="bi bi-award-fill me-2"></i>
            Certificados
          </h4>
        </div>
        {/* Cuerpo del card */}
        <div className="card-body"> 
          {(() => {
            const tipo = "certificados";
            const documentoExistente = documentos.find(doc => doc.tipo === tipo);
            {/* Renderizado del apartado de Certificados */}
            return (
              <div className="d-flex align-items-center">
                <i className="bi bi-file-earmark-text-fill fs-4 me-3" style={{ color: "#7A1737" }}></i>
                <label className="form-label mb-0 me-2" style={{ minWidth: 160 }}>Certificados</label>

                {!documentoExistente ? (
                  <> {/* Input y botón para subir documento */}
                    <input
                      type="file"
                      accept=".pdf"
                      className="form-control rounded-3 me-2"
                      style={{ flex: 1 }}
                      onChange={e => setCertificados(e.target.files[0])}
                    />
                    <button
                      type="button"
                      className="btn"
                      style={{ backgroundColor: "#7A1737", color: "#fff", borderColor: "#7A1737" }}
                      onClick={() => subirArchivo(Certificados, tipo)}
                    >
                      <i className="bi bi-cloud-arrow-up-fill me-1"></i>
                      Subir
                    </button>
                    {Certificados && (
                      <span className="ms-2 small text-muted">{Certificados.name}</span>
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
          })()}
        </div>
      </div>
    </div>
  </div>
);
}

export default Home;