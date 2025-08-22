
// importaciones necesarias
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// función principal del componente Home
function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [usuario, setUsuario] = useState(null);
  const [secundaria, setSecundaria] = useState(null);
  const [bachillerato, setBachillerato] = useState(null);
  const [universidad, setUniversidad] = useState(null);
  const  [Certificados, setCertificados] = useState(null);
  const [documentos, setDocumentos] = useState([]);

  // ✅ Función para cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem("token"); // elimina el token
    setUsuario(null); // limpia el estado del usuario
    navigate("/sesion"); // redirige a la ruta de login o inicio
  };

  // Obtener el usuario autenticado al cargar el componente
  useEffect(() => {
    const token = localStorage.getItem('token'); // o donde guardes tu JWT

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
      //console.log("Usuario recibido:", location.state.user);
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
      ////alert("Selecciona un archivo PDF válido");
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

      //alert(`Archivo de ${tipo} subido correctamente`);
      window.location.reload();
    } catch (error) {
      console.error("Error al subir archivo:", error);
      //alert(error.response?.data?.error || "Error al subir el archivo");
    }
  };
  // Función para eliminar un documento
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

  //IMAGENES
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
      //alert("Foto subida correctamente");
      //window.location.reload();

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

  // diseño principal de la página
  return (


    
    <div className="d-flex flex-column align-items-center min-vh-100">

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
      <div className="container py-4" style={{ maxWidth: '800px', width: '90%' }}>
        {/* Contenedor unificado de usuario + foto */}
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

              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                className="form-control rounded-3 mb-2"
                style={{ width: "250px" }}   // más ancho y alineado con la imagen
                onChange={e => setFotoPerfil(e.target.files[0])}
              />
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
        {/* Documentos Académicos */}
        {["Secundaria", "Bachillerato", "Universidad", "Certificados"].map((nivel, idx) => {
          const stateMap = { 0: secundaria, 1: bachillerato, 2: universidad, 3: Certificados };
          const setMap = { 0: setSecundaria, 1: setBachillerato, 2: setUniversidad, 3: setCertificados };
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
      </div>
    </div>
  );
}
export default Home;
