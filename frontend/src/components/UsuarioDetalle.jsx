import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import '../css/UsuarioDetalle.css'

function UsuarioDetalle() {
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  // Depuración: Verificar si cerrarSesion se define
  const cerrarSesion = () => {
    try {
      console.log("Ejecutando cerrarSesion en UsuarioDetalle.jsx");
      localStorage.removeItem("usuario");
      localStorage.removeItem("token");
      setAdmin(null);
      setUsuario(null);
      navigate('/sesion', { replace: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem("usuario"));
    setAdmin(adminData);

    const fetchUsuario = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/users/usuarios/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsuario(response.data);
      } catch (error) {
        console.error("Error al obtener usuario:", error);
      }
    };

    fetchUsuario();
  }, [id]);


  // Función para marcar un documento como cotejado
  const toggleCotejado = async (docId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/documentos/${docId}/cotejado`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Actualizar estado local
      setUsuario(prev => ({
        ...prev,
        documentos: prev.documentos.map(doc =>
          doc.id === docId ? { ...doc, cotejado: true } : doc
        )
      }));
    } catch (error) {
      console.error("Error al actualizar cotejado:", error);
    }
  };

  if (!usuario) {
    return <p className="text-center mt-5">Cargando información...</p>;
  }

  // Separar documentos por tipo
  const documentosAcademicos = usuario.documentos?.filter(doc =>
    ["secundaria", "bachillerato", "universidad"].includes(doc.tipo.toLowerCase())
  ) || [];

  const certificados = usuario.documentos?.filter(doc =>
    doc.tipo.toLowerCase().includes("certificado")
  ) || [];

  // Orden documentos académicos
  const ordenAcademico = { secundaria: 1, bachillerato: 2, universidad: 3 };
  const documentosAcademicosOrdenados = documentosAcademicos.sort((a, b) => {
    const tipoA = ordenAcademico[a.tipo.toLowerCase()] || 99;
    const tipoB = ordenAcademico[b.tipo.toLowerCase()] || 99;
    return tipoA - tipoB;
  });


  return (
    <div className="d-flex flex-column flex-lg-row min-vh-100">
      <Sidebar admin={admin} cerrarSesion={cerrarSesion} />
      <main className="flex-grow-1 d-flex flex-column">
        <Navbar hideCrear={admin?.rol === 2} />
        <div className="container py-4">
          <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}
            style={{ fontSize: "clamp(0.9rem, 2.5vw, 1rem)", fontFamily: "Roboto, sans-serif" }}>

            ← Regresar
          </button>

          <div className="card shadow-sm p-3 p-md-4">
            {/* Datos del usuario */}
            <div className="d-flex flex-column flex-md-row align-items-center mb-4">
              <img
                src={
                  usuario.foto_perfil
                    ? `http://localhost:5000/uploads/fotos/${usuario.id_personal}/${usuario.foto_perfil}`
                    : "http://localhost:5000/uploads/default-avatar.jpg"
                }
                alt={usuario.nombre}
                crossOrigin="use-credentials"
                className="img-fluid mb-3"
                style={{
                  width: "clamp(80px, 15vw, 100px)",
                  height: "clamp(80px, 15vw, 100px)",
                  objectFit: "cover",
                }}
              />
              <div className="ms-md-4 text-center text-md-start">
                <p className="mb-1" style={{ fontSize: "clamp(0.9rem, 2.5vw, 1rem)", fontFamily: "Roboto, sans-serif" }}>
                  <strong>Nombre:</strong> {usuario.nombre}
                </p>
                <p className="mb-1" style={{ fontSize: "clamp(0.9rem, 2.5vw, 1rem)", fontFamily: "Roboto, sans-serif" }}>
                  <strong>Apellido Paterno:</strong> {usuario.apellido_paterno}
                </p>
                <p className="mb-1" style={{ fontSize: "clamp(0.9rem, 2.5vw, 1rem)", fontFamily: "Roboto, sans-serif" }}>
                  <strong>Apellido Materno:</strong> {usuario.apellido_materno}
                </p>
                <p className="mb-1" style={{ fontSize: "clamp(0.9rem, 2.5vw, 1rem)", fontFamily: "Roboto, sans-serif" }}>
                  <strong>Usuario:</strong> {usuario.usuario}
                </p>
                <p className="mb-1" style={{ fontSize: "clamp(0.9rem, 2.5vw, 1rem)", fontFamily: "Roboto, sans-serif" }}>
                  <strong>Correo:</strong> {usuario.correo}
                </p>
                <p className="mb-1" style={{ fontSize: "clamp(0.9rem, 2.5vw, 1rem)", fontFamily: "Roboto, sans-serif" }}>
                  <strong>CURP:</strong> {usuario.curp}
                </p>
                <p className="mb-1" style={{ fontSize: "clamp(0.9rem, 2.5vw, 1rem)", fontFamily: "Roboto, sans-serif" }}>
                  <strong>RFC:</strong> {usuario.rfc}
                </p>
              </div>
            </div>

            {/* Documentos Académicos */}
            <h5 className="mb-3" style={{ fontSize: "clamp(1.1rem, 3vw, 1.25rem)", fontFamily: "Roboto, sans-serif" }}>
              📚 Documentos Académicos
            </h5>
            {documentosAcademicosOrdenados.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-striped table-bordered">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col" style={{ fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)", fontFamily: "Roboto, sans-serif" }}>Tipo</th>
                      <th scope="col" style={{ fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)", fontFamily: "Roboto, sans-serif" }}>Archivo</th>
                      <th scope="col" style={{ fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)", fontFamily: "Roboto, sans-serif" }}>Fecha subida</th>
                      <th scope="col" style={{ fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)", fontFamily: "Roboto, sans-serif" }}>Cotejado</th>
                      <th scope="col" style={{ fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)", fontFamily: "Roboto, sans-serif" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentosAcademicosOrdenados.map((doc) => (
                      <tr key={doc.id}>
                        <td style={{ fontSize: "clamp(0.8rem, 2vw, 0.9rem)", fontFamily: "Roboto, sans-serif" }}>{doc.tipo}</td>
                        <td style={{ fontSize: "clamp(0.8rem, 2vw, 0.9rem)", fontFamily: "Roboto, sans-serif" }}>{doc.archivo}</td>
                        <td style={{ fontSize: "clamp(0.8rem, 2vw, 0.9rem)", fontFamily: "Roboto, sans-serif" }}>
                          {new Date(doc.fecha_subida).toLocaleDateString()}
                        </td>
                        <td className="text-center" style={{ fontSize: "clamp(0.8rem, 2vw, 0.9rem)", fontFamily: "Roboto, sans-serif" }}>
                          {doc.cotejado ? "✅" : "❌"}
                        </td>
                        <td>
                          <div className="d-flex flex-column flex-sm-row gap-2">
                            <a
                              href={`http://localhost:5000/uploads/academico/${usuario.id_personal}/${doc.archivo}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-primary"
                              style={{ fontSize: "clamp(0.75rem, 2vw, 0.85rem)", fontFamily: "Roboto, sans-serif" }}
                            >
                              Ver PDF
                            </a>
                            {!doc.cotejado && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => toggleCotejado(doc.id)}
                                style={{ fontSize: "clamp(0.75rem, 2vw, 0.85rem)", fontFamily: "Roboto, sans-serif" }}
                              >
                                Marcar Cotejado
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted" style={{ fontSize: "clamp(0.9rem, 2.5vw, 1rem)", fontFamily: "Roboto, sans-serif" }}>
                No hay documentos académicos registrados.
              </p>
            )}

            <h5 className="mb-3 mt-4" style={{ fontSize: "clamp(1.1rem, 3vw, 1.25rem)", fontFamily: "Roboto, sans-serif" }}>
              🎓 Certificados
            </h5>
            {certificados.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-striped table-bordered">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col" style={{ fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)", fontFamily: "Roboto, sans-serif" }}>Tipo</th>
                      <th scope="col" style={{ fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)", fontFamily: "Roboto, sans-serif" }}>Archivo</th>
                      <th scope="col" style={{ fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)", fontFamily: "Roboto, sans-serif" }}>Fecha subida</th>
                      <th scope="col" style={{ fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)", fontFamily: "Roboto, sans-serif" }}>Cotejado</th>
                      <th scope="col" style={{ fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)", fontFamily: "Roboto, sans-serif" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificados.map((doc) => (
                      <tr key={doc.id}>
                        <td style={{ fontSize: "clamp(0.8rem, 2vw, 0.9rem)", fontFamily: "Roboto, sans-serif" }}>{doc.tipo}</td>
                        <td style={{ fontSize: "clamp(0.8rem, 2vw, 0.9rem)", fontFamily: "Roboto, sans-serif" }}>{doc.archivo}</td>
                        <td style={{ fontSize: "clamp(0.8rem, 2vw, 0.9rem)", fontFamily: "Roboto, sans-serif" }}>
                          {new Date(doc.fecha_subida).toLocaleDateString()}
                        </td>
                        <td className="text-center" style={{ fontSize: "clamp(0.8rem, 2vw, 0.9rem)", fontFamily: "Roboto, sans-serif" }}>
                          {doc.cotejado ? "✅" : "❌"}
                        </td>
                        <td>
                          <div className="d-flex flex-column flex-sm-row gap-2">
                            <a
                              href={`http://localhost:5000/uploads/academico/${usuario.id_personal}/${doc.archivo}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-primary"
                              style={{ fontSize: "clamp(0.75rem, 2vw, 0.85rem)", fontFamily: "Roboto, sans-serif" }}
                            >
                              Ver PDF
                            </a>
                            {!doc.cotejado && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => toggleCotejado(doc.id)}
                                style={{ fontSize: "clamp(0.75rem, 2vw, 0.85rem)", fontFamily: "Roboto, sans-serif" }}
                              >
                                Marcar Cotejado
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted" style={{ fontSize: "clamp(0.9rem, 2.5vw, 1rem)", fontFamily: "Roboto, sans-serif" }}>
                No hay certificados registrados.
              </p>
            )}
          </div>
        </div>
      </main>

    </div>
  );
}

export default UsuarioDetalle;
