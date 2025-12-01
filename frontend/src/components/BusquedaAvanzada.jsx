// src/components/BusquedaAvanzada.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaUser, FaFileAlt, FaCertificate, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import API_ENDPOINTS from '../utils/config';
import '../css/BusquedaAvanzada.css';

function BusquedaAvanzada() {
  const [admin, setAdmin] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [filtros, setFiltros] = useState({
    nombre: "",
    tipoDocumento: "",
    soloCertificados: false,
    soloVerificados: false
  });
  const [cargando, setCargando] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const navigate = useNavigate();

  // Verificar autenticación y permisos
  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem("usuario"));
    const token = localStorage.getItem("token");
    
    if (!adminData || !token) {
      navigate('/sesion', { replace: true });
      return;
    }

    // Verificar que sea rol 3 o 4
    if (![3, 4].includes(adminData.rol)) {
      alert("Acceso denegado: Esta función solo está disponible para administradores.");
      navigate('/homeadmin', { replace: true });
      return;
    }

    setAdmin(adminData);
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
      if (filtros.soloCertificados) {
        params.append('soloCertificados', 'true');
      }
      if (filtros.soloVerificados) {
        params.append('soloVerificados', 'true');
      }

      const response = await axios.get(
        `${API_ENDPOINTS.BUSCAR_AVANZADO}?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsuarios(response.data);
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
    <div className="d-flex vh-100 busqueda-avanzada-container">
      <Sidebar admin={admin} cerrarSesion={cerrarSesion} />
      <main className="flex-grow-1 d-flex flex-column main-content">
        <Navbar hideCrear={true} hideBuscar={true} />
        
        <div className="container-fluid py-4 px-4">
          <div className="row mb-4">
            <div className="col">
              <h2 className="mb-3">
                <FaSearch className="me-2" />
                Búsqueda Avanzada de Candidatos
              </h2>
              <p className="text-muted">
                Filtra usuarios por sus habilidades, conocimientos y certificaciones registradas en el sistema.
              </p>
            </div>
          </div>

          {/* Formulario de Filtros */}
          <div className="card shadow-sm mb-4">
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
                      onChange={(e) => setFiltros({...filtros, nombre: e.target.value})}
                    />
                  </div>

                  {/* Tipo de documento/habilidad */}
                  <div className="col-md-6">
                    <label htmlFor="tipoDocumento" className="form-label">
                      <FaFileAlt className="me-2" />
                      Tipo de Documento/Habilidad
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="tipoDocumento"
                      placeholder="Ej: Licenciatura, Maestría, Certificado en..."
                      value={filtros.tipoDocumento}
                      onChange={(e) => setFiltros({...filtros, tipoDocumento: e.target.value})}
                    />
                  </div>

                  {/* Filtros adicionales */}
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="soloCertificados"
                        checked={filtros.soloCertificados}
                        onChange={(e) => setFiltros({...filtros, soloCertificados: e.target.checked})}
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
                        onChange={(e) => setFiltros({...filtros, soloVerificados: e.target.checked})}
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

          {/* Resultados */}
          {busquedaRealizada && !cargando && (
            <div className="card shadow-sm">
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
                  <div className="row g-3">
                    {usuarios.map((usuario) => (
                      <div key={usuario.id_personal} className="col-md-6 col-lg-4">
                        <div className="card h-100 border-0 shadow-sm usuario-card">
                          <div className="card-body">
                            <div className="d-flex align-items-center mb-3">
                              <img
                                src={
                                  usuario.foto_perfil
                                    ? `http://localhost:5000/uploads/fotos/${usuario.id_personal}/${usuario.foto_perfil}`
                                    : "http://localhost:5000/uploads/default-avatar.jpg"
                                }
                                alt="Foto de perfil"
                                className="rounded-circle me-3"
                                style={{ width: "60px", height: "60px", objectFit: "cover" }}
                                crossOrigin="use-credentials"
                              />
                              <div>
                                <h6 className="mb-0">
                                  {usuario.nombre} {usuario.apellido_paterno} {usuario.apellido_materno}
                                </h6>
                                <small className="text-muted">@{usuario.usuario}</small>
                              </div>
                            </div>

                            <div className="mb-2">
                              <small className="text-muted d-block">
                                <strong>Total documentos:</strong> {usuario.total_documentos || 0}
                              </small>
                              <small className="text-muted d-block">
                                <strong>Certificados:</strong> {usuario.num_certificados || 0}
                              </small>
                              <small className="text-muted d-block">
                                <strong>Verificados:</strong> {usuario.num_documentos_verificados || 0}
                              </small>
                            </div>

                            {usuario.tipos_documentos && usuario.tipos_documentos.length > 0 && (
                              <div className="mb-3">
                                <small className="text-muted d-block mb-1"><strong>Documentos:</strong></small>
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
                              </div>
                            )}

                            <button
                              className="btn btn-sm btn-primary w-100"
                              onClick={() => verDetalleUsuario(usuario.id_personal)}
                            >
                              Ver Detalles
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default BusquedaAvanzada;
