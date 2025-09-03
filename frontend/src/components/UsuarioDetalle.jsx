import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

// ...importaciones
function UsuarioDetalle() {
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

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

  if (!usuario) {
    return <p className="text-center mt-5">Cargando información...</p>;
  }

  // 🔍 Separar documentos por tipo
  // Separar documentos académicos y certificados
  const documentosAcademicos = usuario.documentos?.filter(doc =>
    ["secundaria", "bachillerato", "universidad"].includes(doc.tipo.toLowerCase())
  ) || [];

  const certificados = usuario.documentos?.filter(doc =>
    doc.tipo.toLowerCase().includes("certificado")
  ) || [];

  //Orden documentos academicos
  const ordenAcademico = {
  secundaria: 1,
  bachillerato: 2,
  universidad: 3
};

const documentosAcademicosOrdenados = documentosAcademicos.sort((a, b) => {
  const tipoA = ordenAcademico[a.tipo.toLowerCase()] || 99;
  const tipoB = ordenAcademico[b.tipo.toLowerCase()] || 99;
  return tipoA - tipoB;
});

  // 🔄 Agrupar académicos por nivel
  const nivelesAcademicos = ["secundaria", "bachillerato", "universidad"];

  const renderDocumentos = (docs) => (
    docs.map(doc => (
      <tr key={doc.id}>
        <td>{doc.tipo}</td>
        <td>{doc.archivo}</td>
        <td>{new Date(doc.fecha_subida).toLocaleDateString()}</td>
        <td className="text-center">{doc.cotejado ? "✅" : "❌"}</td>
        <td>
          <a
            href={`http://localhost:5000/uploads/academico/${usuario.id_personal}/${doc.archivo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-primary"
          >
            Ver PDF
          </a>
        </td>
      </tr>
    ))
  );

  return (
    <div className="d-flex flex-column flex-lg-row min-vh-100">
      {/* Sidebar */}
      <Sidebar admin={admin} />

      {/* Contenido principal */}
      <main className="flex-grow-1 d-flex flex-column">
        <Navbar />

        <div className="container py-4">
          <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
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
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                }}
              />
              <div className="ms-md-4 text-center text-md-start">
                <p><strong>Nombre:</strong> {usuario.nombre}</p>
                <p><strong>Apellido Paterno:</strong> {usuario.apellido_paterno}</p>
                <p><strong>Apellido Materno:</strong> {usuario.apellido_materno}</p>
                <p><strong>Usuario:</strong> {usuario.usuario}</p>
                <p><strong>Correo:</strong> {usuario.correo}</p>
                <p><strong>CURP:</strong> {usuario.curp}</p>
                <p><strong>RFC:</strong> {usuario.rfc}</p>
              </div>
            </div>

            {/* Documentos Académicos */}
            <h5 className="mb-3">📚 Documentos Académicos</h5>
            {documentosAcademicos.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-striped table-bordered">
                  <thead className="table-dark">
                    <tr>
                      <th>Tipo</th>
                      <th>Archivo</th>
                      <th>Fecha subida</th>
                      <th>Cotejado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentosAcademicosOrdenados.map(doc => (
  <tr key={doc.id}>
    <td>{doc.tipo}</td>
    <td>{doc.archivo}</td>
    <td>{new Date(doc.fecha_subida).toLocaleDateString()}</td>
    <td className="text-center">{doc.cotejado ? "✅" : "❌"}</td>
    <td>
      <a
        href={`http://localhost:5000/uploads/academico/${usuario.id_personal}/${doc.archivo}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-sm btn-primary"
      >
        Ver PDF
      </a>
    </td>
  </tr>
))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted">No hay documentos académicos registrados.</p>
            )}

            {/* Certificados */}
            <h5 className="mb-3 mt-4">🎓 Certificados</h5>
            {certificados.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-striped table-bordered">
                  <thead className="table-dark">
                    <tr>
                      <th>Tipo</th>
                      <th>Archivo</th>
                      <th>Fecha subida</th>
                      <th>Cotejado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificados.map(doc => (
                      <tr key={doc.id}>
                        <td>{doc.tipo}</td>
                        <td>{doc.archivo}</td>
                        <td>{new Date(doc.fecha_subida).toLocaleDateString()}</td>
                        <td className="text-center">{doc.cotejado ? "✅" : "❌"}</td>
                        <td>
                          <a
                            href={`http://localhost:5000/uploads/academico/${usuario.id_personal}/${doc.archivo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-primary"
                          >
                            Ver PDF
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted">No hay certificados registrados.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default UsuarioDetalle;