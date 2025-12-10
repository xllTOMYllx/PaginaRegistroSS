// src/components/BusquedaAvanzada.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaUser, FaFileAlt, FaCertificate, FaCheckCircle, FaInfoCircle, FaGraduationCap } from 'react-icons/fa';
import API_ENDPOINTS from '../utils/config';
import { formatEstudios } from '../utils/validations';
import '../css/BusquedaAvanzada.css';

function BusquedaAvanzada() {
  const [admin, setAdmin] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [filtros, setFiltros] = useState({
    nombre: "",
    tipoDocumento: "",
    estudios: "",
    soloCertificados: false,
    soloVerificados: false
  });
  const [cargando, setCargando] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const navigate = useNavigate();

  // Verificar autenticación y permisos
  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem('usuario'));
    const rol = Number(adminData?.rol);
    if (![3,4].includes(rol)) {
      alert("Acceso denegado: Esta función solo está disponible para administradores.");
      navigate('/homeadmin', { replace: true });
      return;
    }
    setAdmin({ ...adminData, rol });
  }, [navigate]);

  // Función para realizar la búsqueda avanzada
  const buscarUsuarios = async (e) => {
    if (e) e.preventDefault();

    setCargando(true);
    setBusquedaRealizada(true);

    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();

      if (filtros.nombre.trim()) {
        params.append('nombre', filtros.nombre.trim());
      }
      if (filtros.tipoDocumento.trim()) {
        params.append('tipoDocumento', filtros.tipoDocumento.trim());
      }
      if (filtros.estudios.trim()) {
        // Normalize to UPPERCASE to match database storage
        params.append('estudios', filtros.estudios.trim().toUpperCase());
      }
      if (filtros.soloCertificados) {
        params.append('soloCertificados', 'true');
      }
      if (filtros.soloVerificados) {
        params.append('soloVerificados', 'true');
      }

      // Debug: ver URL final enviada
      console.log('Buscar Avanzado params:', params.toString());

      const response = await axios.get(
        `${API_ENDPOINTS.BUSCAR_AVANZADO}?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Backend correctly filters by estudios using case-insensitive comparison
      const resultados = Array.isArray(response.data) ? response.data : [];
      setUsuarios(resultados);
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("No tienes permisos para realizar esta búsqueda.");
        navigate('/homeadmin', { replace: true });
      } else {
        alert("Error al realizar la búsqueda. Por favor, intenta de nuevo.");
      }
    } finally {
      setCargando(false);
    }
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      nombre: "",
      tipoDocumento: "",
      estudios: "",
      soloCertificados: false,
      soloVerificados: false
    });
    setUsuarios([]);
    setBusquedaRealizada(false);
  };

  // Función para cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    setAdmin(null);
    navigate('/sesion', { replace: true });
  };

  // Navegar al detalle del usuario
  const verDetalleUsuario = (id) => {
    navigate(`/Usuarios/${id}`);
  };

  return (
    <div className="layout">
      <Sidebar admin={admin} cerrarSesion={cerrarSesion} />

      <div className="main-content">
        <Navbar hideCrear={true} hideBuscar={true} />

        <div className="container py-4">
          {/* Título */}
          <div className="row mb-4">
            <div className="col-12">
              <h2 className="section-title">
                <FaSearch className="me-2" />
                Búsqueda Avanzada de Candidatos
              </h2>
              <p className="text-muted">
                Filtra usuarios por sus habilidades, conocimientos y certificaciones registradas en el sistema.
              </p>
            </div>
          </div>

          {/* Card de filtros */}
          <div className="row mb-5">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  {/* Formulario de Filtros (fila propia) */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <div className="card shadow-sm search-card">
                        <div className="card-body">
                          <form onSubmit={buscarUsuarios}>
                            <div className="row g-3">
                              {/* Nombre del usuario */}
                              <div className="col-md-6">
                                <label htmlFor="nombre" className="form-label">
                                  <FaUser className="me-2" />
                                  Nombre del Usuario
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="nombre"
                                  placeholder="Ej: Juan Pérez, CURP, RFC..."
                                  value={filtros.nombre}
                                  onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
                                />
                              </div>

                              {/* Tipo de documento/habilidad */}
                              <div className="col-md-6">
                                <label htmlFor="tipoDocumento" className="form-label">
                                  <FaFileAlt className="me-2" />
                                  Tipo de Documento/Habilidad
                                </label>
                                <select
                                  className="form-control"
                                  id="tipoDocumento"
                                  value={filtros.tipoDocumento}
                                  onChange={(e) => setFiltros({ ...filtros, tipoDocumento: e.target.value })}
                                >
                                  <option value="">Todos los tipos</option>
                                  <option value="secundaria">Secundaria</option>
                                  <option value="preparatoria">Bachillerato</option>
                                  <option value="licenciatura">Universidad</option>
                                  <option value="certificados">Certificados</option>
                                </select>
                              </div>

                              {/* Nivel de estudios */}
                              <div className="col-md-6">
                                <label htmlFor="estudios" className="form-label">
                                  <FaGraduationCap className="me-2" />
                                  Nivel de Estudios
                                </label>
                                <select
                                  className="form-control"
                                  id="estudios"
                                  value={filtros.estudios}
                                  onChange={(e) => setFiltros({ ...filtros, estudios: e.target.value })}
                                >
                                  <option value="">Todos los niveles</option>
                                  <option value="PRIMARIA">Primaria</option>
                                  <option value="SECUNDARIA">Secundaria</option>
                                  <option value="PREPARATORIA">Preparatoria</option>
                                  <option value="LICENCIATURA">Licenciatura</option>
                                  <option value="MAESTRÍA">Maestría</option>
                                  <option value="DOCTORADO">Doctorado</option>
                                  <option value="PREFIERO NO DECIRLO">Prefiero no decirlo</option>
                                </select>
                              </div>

                              {/* Filtros adicionales */}
                              <div className="col-md-6">
                                <div className="form-check">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="soloCertificados"
                                    checked={filtros.soloCertificados}
                                    onChange={(e) => setFiltros({ ...filtros, soloCertificados: e.target.checked })}
                                  />
                                  <label className="form-check-label" htmlFor="soloCertificados">
                                    <FaCertificate className="me-2" />
                                    Solo usuarios con certificados
                                  </label>
                                </div>
                              </div>

                              <div className="col-md-6">
                                <div className="form-check">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="soloVerificados"
                                    checked={filtros.soloVerificados}
                                    onChange={(e) => setFiltros({ ...filtros, soloVerificados: e.target.checked })}
                                  />
                                  <label className="form-check-label" htmlFor="soloVerificados">
                                    <FaCheckCircle className="me-2" />
                                    Solo usuarios con documentos verificados
                                  </label>
                                </div>
                              </div>

                              {/* Botones */}
                              <div className="col-12">
                                <button
                                  type="submit"
                                  className="btn btn-primary me-2"
                                  disabled={cargando}
                                >
                                  {cargando ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                      Buscando...
                                    </>
                                  ) : (
                                    <>
                                      <FaSearch className="me-2" />
                                      Buscar
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  onClick={limpiarFiltros}
                                  disabled={cargando}
                                >
                                  Limpiar
                                </button>
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Card de resultados */}
          {busquedaRealizada && !cargando && (
            <div className="row">
              <div className="col-12">
                <div className="card shadow-sm results-card">
                  <div className="card-body">
                    {/* Resultados (fila propia) */}
                    <div className="row">
                      <div className="col-12">
                        <div className="card shadow-sm results-card">
                          <div className="card-body">
                            <h5 className="card-title mb-3">
                              Resultados de la búsqueda ({usuarios.length} candidato{usuarios.length !== 1 ? 's' : ''} encontrado{usuarios.length !== 1 ? 's' : ''})
                            </h5>
                            {usuarios.length === 0 ? (
                              <div className="alert alert-info">
                                <FaInfoCircle className="me-2" />
                                No se encontraron usuarios que coincidan con los criterios de búsqueda.
                              </div>
                            ) : (
                              <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                  <thead className="table-light">
                                    <tr>
                                      <th scope="col">Usuario</th>
                                      <th scope="col">Nombre Completo</th>
                                      <th scope="col">Estudios</th>
                                      <th scope="col" className="text-center">Total Docs</th>
                                      <th scope="col" className="text-center">Certificados</th>
                                      <th scope="col" className="text-center">Verificados</th>
                                      <th scope="col">Tipos de Documentos</th>
                                      <th scope="col" className="text-center">Acciones</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {usuarios.map((usuario) => (
                                      <tr key={usuario.id_personal}>
                                        <td>
                                          <div className="d-flex align-items-center">
                                            <img
                                              src={
                                                usuario.foto_perfil
                                                  ? `http://localhost:5000/uploads/fotos/${usuario.id_personal}/${usuario.foto_perfil}`
                                                  : "http://localhost:5000/uploads/default-avatar.jpg"
                                              }
                                              alt="Foto de perfil"
                                              className="rounded-circle me-2"
                                              style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                              crossOrigin="use-credentials"
                                            />
                                            <span className="text-muted small">@{usuario.usuario}</span>
                                          </div>
                                        </td>
                                        <td>
                                          <strong>
                                            {usuario.nombre} {usuario.apellido_paterno} {usuario.apellido_materno}
                                          </strong>
                                        </td>
                                        <td>
                                          {formatEstudios(usuario.estudios)}
                                        </td>
                                        <td className="text-center">
                                          <span className="badge bg-info">{usuario.total_documentos || 0}</span>
                                        </td>
                                        <td className="text-center">
                                          <span className="badge bg-success">{usuario.num_certificados || 0}</span>
                                        </td>
                                        <td className="text-center">
                                          <span className="badge bg-primary">{usuario.num_documentos_verificados || 0}</span>
                                        </td>
                                        <td>
                                          {usuario.tipos_documentos && usuario.tipos_documentos.length > 0 ? (
                                            <div className="d-flex flex-wrap gap-1">
                                              {usuario.tipos_documentos.slice(0, 3).map((tipo, idx) => (
                                                <span key={idx} className="badge bg-secondary" style={{ fontSize: "0.7rem" }}>
                                                  {tipo}
                                                </span>
                                              ))}
                                              {usuario.tipos_documentos.length > 3 && (
                                                <span className="badge bg-secondary" style={{ fontSize: "0.7rem" }}>
                                                  +{usuario.tipos_documentos.length - 3} más
                                                </span>
                                              )}
                                            </div>
                                          ) : (
                                            <span className="text-muted small">Sin documentos</span>
                                          )}
                                        </td>
                                        <td className="text-center">
                                          <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => verDetalleUsuario(usuario.id_personal)}
                                          >
                                            <FaUser className="me-1" />
                                            Ver Detalles
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BusquedaAvanzada;


