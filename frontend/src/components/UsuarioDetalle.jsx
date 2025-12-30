import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import GmailCredentialsModal from "./GmailCredentialsModal";
import { formatEstudios } from '../utils/validations';
import { GROUP_BADGE_COLORS } from '../utils/config';
import '../css/UsuarioDetalle.css'

function UsuarioDetalle() {
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);

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


  const handleCotejarClick = (docId) => {
    setSelectedDocId(docId);
    setIsModalOpen(true);
  };

  const handleCotejarTodosClick = () => {
    setSelectedDocId('ALL');
    setIsModalOpen(true);
  };

  // Función para marcar un documento como cotejado
  const toggleCotejado = async (docId, smtpData) => {
    try {
      console.log('Enviando solicitud con:', { docId, smtpData });
      const token = localStorage.getItem("token");

      const response = await axios.patch(
        `http://localhost:5000/api/documentos/${docId}/cotejado`,
        smtpData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Respuesta:', response.data);

      // Actualizar estado local
      setUsuario(prev => ({
        ...prev,
        documentos: prev.documentos.map(doc =>
          doc.id === docId ? { ...doc, cotejado: true } : doc
        )
      }));

      alert('El documento ha sido marcado como cotejado y se ha enviado la notificación por correo.');
    } catch (error) {
      console.error("Error al actualizar cotejado:", error);
      
      let errorMessage = 'Error al cotejar el documento';
      
      if (error.response?.data?.emailError) {
        // Error específico del envío de correo
        errorMessage = `Error en el envío del correo: ${error.response.data.details || 'Verifica las credenciales SMTP y la configuración del servidor de correo'}`;
        
        // Preguntar si desea continuar sin enviar correo
        if (confirm('Hubo un error al enviar el correo electrónico. ¿Deseas marcar el documento como cotejado de todas formas?')) {
          // TODO: Agregar lógica para marcar como cotejado sin enviar correo
          setUsuario(prev => ({
            ...prev,
            documentos: prev.documentos.map(doc =>
              doc.id === docId ? { ...doc, cotejado: true } : doc
            )
          }));
          alert('Documento marcado como cotejado (sin notificación por correo)');
          return;
        }
      } else {
        errorMessage = error.response?.data?.error || 'Error al cotejar el documento';
      }
      
      alert(errorMessage);
    }
  };

  // Cotejar todos los documentos del usuario en lote
  const cotejarTodos = async (smtpData) => {
    try {
      const token = localStorage.getItem("token");
      // Usar POST directamente para evitar problemas con PATCH
      const response = await axios.post(
        `http://localhost:5000/api/documentos/usuario/${usuario.id_personal}/cotejar-todos`,
        smtpData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Marcar todos los documentos como cotejados en el estado local
      setUsuario(prev => ({
        ...prev,
        documentos: (prev.documentos || []).map(doc => ({ ...doc, cotejado: true }))
      }));

      const updated = response.data?.updated || 0;
      const emailSent = response.data?.emailSent;
      const emailError = response.data?.emailError;
      if (emailSent === false && emailError) {
        alert(`Se cotejaron ${updated} documentos. Error enviando el correo resumen: ${emailError}`);
      } else {
        alert(`Se cotejaron ${updated} documentos y se envió el correo resumen.`);
      }
    } catch (error) {
      console.error('Error al cotejar todos los documentos:', error);
      const msg = error.response?.data?.error || 'Error al realizar el cotejo masivo';
      alert(msg);
    }
  };

  if (!usuario) {
    return <p className="text-center mt-5">Cargando información...</p>;
  }

  // Separar documentos por flag desde backend
  const certificados = usuario.documentos?.filter(doc => doc.es_certificado === true) || [];
  const documentosAcademicos = usuario.documentos?.filter(doc => doc.es_certificado !== true) || [];

  // Orden documentos académicos
  const ordenAcademico = { secundaria: 1, bachillerato: 2, universidad: 3 };
  const documentosAcademicosOrdenados = documentosAcademicos.sort((a, b) => {
    const tipoA = ordenAcademico[a.tipo.toLowerCase()] || 99;
    const tipoB = ordenAcademico[b.tipo.toLowerCase()] || 99;
    return tipoA - tipoB;
  });


  return (
    <div className="d-flex min-vh-100 usuario-detalle-container">
      <Sidebar admin={admin} cerrarSesion={cerrarSesion} />
      <main className="flex-grow-1 d-flex flex-column main-content">
        <Navbar hideCrear={admin?.rol !== 3} />
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
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "http://localhost:5000/uploads/default-avatar.jpg";
                }}
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
                <p className="mb-1" style={{ fontSize: "clamp(0.9rem, 2.5vw, 1rem)", fontFamily: "Roboto, sans-serif" }}>
                  <strong>Estudios:</strong> {formatEstudios(usuario.estudios)}
                </p>
                {/* Mostrar grupos del usuario si existen tanto para los roles 1 y para el rol 2 (supervisor) se muestran
                los grupos que tiene a su cargo */}
                {usuario.grupos && usuario.grupos.length > 0 && (
                  <div className="mb-1" style={{ fontSize: "clamp(0.9rem, 2.5vw, 1rem)", fontFamily: "Roboto, sans-serif" }}>
                    <strong>Grupos:</strong>{' '}
                    {usuario.grupos.map((grupo) => {
                      const colorIndex = grupo.id_grupo % GROUP_BADGE_COLORS.length;
                      const backgroundColor = GROUP_BADGE_COLORS[colorIndex];
                      
                      return (
                        <span 
                          key={grupo.id_grupo}
                          className="badge me-1 mb-1"
                          style={{ backgroundColor, color: '#fff', fontSize: '0.75rem' }}
                        >
                          {grupo.nombre_grupo}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Documentos Académicos */}
            <h5 className="mb-3" style={{ fontSize: "clamp(1.1rem, 3vw, 1.25rem)", fontFamily: "Roboto, sans-serif" }}>
              📚 Documentos Académicos
            </h5>
            {(() => {
              const hayPendientes = (usuario.documentos || []).some(d => !d.cotejado);
              return (
                <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                  <button
                    className="btn btn-sm btn-success"
                    onClick={handleCotejarTodosClick}
                    disabled={!hayPendientes}
                    style={{ fontSize: "clamp(0.8rem, 2vw, 0.9rem)", fontFamily: "Roboto, sans-serif" }}
                  >
                    Cotejar todos los documentos
                  </button>
                </div>
              );
            })()}
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
                                onClick={() => handleCotejarClick(doc.id)}
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
                                onClick={() => handleCotejarClick(doc.id)}
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

      <GmailCredentialsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultEmail={admin?.correo}
        onSubmit={(smtpData) => {
          if (selectedDocId === 'ALL') {
            cotejarTodos(smtpData);
          } else {
            toggleCotejado(selectedDocId, smtpData);
          }
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}

export default UsuarioDetalle;
