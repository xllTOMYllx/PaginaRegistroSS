import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

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

  return (
    <div className="d-flex flex-column flex-lg-row min-vh-100">
      {/* Sidebar */}
      <Sidebar admin={admin} />

      {/* Contenido principal */}
      <main className="flex-grow-1 d-flex flex-column">
        <Navbar />

        <div className="container py-4">
          <button
            className="btn btn-secondary mb-3"
            onClick={() => navigate(-1)}
          >
            ← Regresar
          </button>

          <div className="card shadow-sm p-3 p-md-4">
            <div className="d-flex flex-column flex-md-row align-items-center mb-4">
              <img
                src={
                  usuario.foto_perfil
                    ? `http://localhost:5000/uploads/fotos/${usuario.id_personal}/${usuario.foto_perfil}`
                    : "http://localhost:5000/uploads/default-avatar.jpg"
                }
                alt={`${usuario.nombre} ${usuario.apellido_paterno}`}
                crossOrigin="use-credentials"
                className="rounded-circle mb-3 mb-md-0"
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
              />
              <div className="ms-md-4 text-center text-md-start">
                <p className="mb-1"><strong>Nombre:</strong> {usuario.nombre}</p>
                <p className="mb-1"><strong>Apellido Paterno:</strong> {usuario.apellido_paterno}</p>
                <p className="mb-1"><strong>Apellido Materno:</strong> {usuario.apellido_materno}</p>
                <p className="mb-1"><strong>Usuario:</strong> {usuario.usuario}</p>
                <p className="mb-1"><strong>Correo:</strong> {usuario.correo}</p>
                <p className="mb-1"><strong>CURP:</strong> {usuario.curp}</p>
                <p className="mb-0"><strong>RFC:</strong> {usuario.rfc}</p>
              </div>
            </div>

            <h5 className="mb-3">📂 Documentos Académicos</h5>
            {usuario.documentos && usuario.documentos.length > 0 ? (
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
                    {usuario.documentos.map((doc) => (
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
              <p className="text-muted">No hay documentos registrados.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default UsuarioDetalle;
