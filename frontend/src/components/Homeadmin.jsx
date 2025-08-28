// importaciones necesarias
import { useEffect, useState } from "react";
import axios from "axios";

function Homeadmin() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const token = localStorage.getItem("token"); // asegúrate que guardas el token en login
        const response = await axios.get(
          "http://localhost:5000/api/users/rol/1",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsuarios(response.data);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };

    fetchUsuarios();
  }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center bg-success text-white rounded p-3 mb-4 shadow-sm">
        <h3 className="mb-0">Gestión de Usuarios</h3>
      </div>

      <div className="row">
        {usuarios.map((user) => (
          <div key={user.id_personal} className="col-md-6 mb-4">
            <div className="card shadow-sm">
              <div className="card-body">
                {/* Foto del usuario */}
                <div className="text-center mb-3">
                  <img
                    src={
                      user.foto_perfil
                        ? `http://localhost:5000/uploads/fotos/${user.id_personal}/${user.foto_perfil}`
                        : "http://localhost:5000/uploads/default-avatar.jpg"
                    }
                    alt="Foto de perfil"
                    crossOrigin="use-credentials"
                    className="rounded-circle shadow"
                    width="120"
                    height="120"
                  />
                </div>

                {/* Datos completos */}
                <h5 className="card-title text-center">
                  {user.nombre} {user.apellido_paterno} {user.apellido_materno}
                </h5>
                <p className="card-text">
                  <strong>Usuario:</strong> {user.usuario} <br />
                  <strong>Correo:</strong> {user.correo} <br />
                  <strong>CURP:</strong> {user.curp} <br />
                  <strong>RFC:</strong> {user.rfc} <br />
                  
                </p>

                {/* Documentos académicos */}
                <h6 className="mt-3">Documentos:</h6>
                {user.documentos && user.documentos.length > 0 ? (
                  <ul className="list-group list-group-flush">
                    {user.documentos.map((doc) => (
                      <li
                        key={doc.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <span>
                          📄 <strong>{doc.tipo}</strong>
                        </span>
                        <div>
                          <a
                            href={`http://localhost:5000/uploads/academico/${user.id_personal}/${doc.archivo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-primary me-2"
                          >
                            Ver
                          </a>
                          {doc.cotejado ? (
                            <span className="badge bg-success">Cotejado ✅</span>
                          ) : (
                            <span className="badge bg-danger">Pendiente ❌</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">No tiene documentos.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Homeadmin;

