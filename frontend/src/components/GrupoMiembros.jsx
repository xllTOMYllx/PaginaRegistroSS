import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { FaUsers, FaUserPlus, FaUserMinus, FaArrowLeft, FaUser } from 'react-icons/fa';

function GrupoMiembros() {
  const { id } = useParams();
  const [grupo, setGrupo] = useState(null);
  const [disponibles, setDisponibles] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem('usuario'));
    const token = localStorage.getItem('token');
    if (!adminData || !token) {
      navigate('/sesion', { replace: true });
      return;
    }
    setAdmin(adminData);
    fetchGrupo();
    fetchDisponibles();
  }, [navigate, id]);

  const fetchGrupo = async () => {
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/grupos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGrupo(response.data);
    } catch (error) {
      console.error('Error al obtener grupo:', error);
      setError('Error al cargar el grupo');
    }
  };

  const fetchDisponibles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/grupos/${id}/disponibles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDisponibles(response.data);
    } catch (error) {
      console.error('Error al obtener usuarios disponibles:', error);
    }
  };
  // Agregar miembro al grupo seleccionado tambien se le permite al rol 4 (superAdmin)
  const handleAddMember = async () => {
   if (![3,4].includes(Number(admin?.rol))) {
      setError('No tienes permisos para agregar miembros');
      return;
    }
    if (!selectedUser) {
      setError('Selecciona un usuario');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/grupos/${id}/miembros`,
        { id_personal: selectedUser },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensaje('Miembro agregado exitosamente');
      setShowAddModal(false);
      setSelectedUser('');
      fetchGrupo();
      fetchDisponibles();
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      console.error('Error al agregar miembro:', error);
      setError(error.response?.data?.error || 'Error al agregar miembro');
    }
  };
  // Quitar miembro del grupo seleccionado tambien se le permite al rol 4 (superAdmin)
  const handleRemoveMember = async (id_personal) => {
    if (![3,4].includes(Number(admin?.rol))) {
      setError('No tienes permisos para quitar miembros');
      return;
    }
    if (!window.confirm('¿Estás seguro de quitar este miembro del grupo?')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/grupos/${id}/miembros/${id_personal}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensaje('Miembro eliminado del grupo exitosamente');
      fetchGrupo();
      fetchDisponibles();
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      console.error('Error al quitar miembro:', error);
      setError(error.response?.data?.error || 'Error al quitar miembro');
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    navigate('/sesion', { replace: true });
  };

  const filteredMembers = grupo?.miembros?.filter(m =>
    `${m.nombre} ${m.apellido_paterno} ${m.apellido_materno} ${m.curp}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (!grupo) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status" style={{ color: '#7A1737' }}>
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex vh-100">
      <Sidebar admin={admin} cerrarSesion={cerrarSesion} />
      <main className="flex-grow-1 d-flex flex-column main-content">
        <Navbar hideCrear={true} />
        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <button 
              className="btn" 
              style={{ backgroundColor: "#7A1737", color: "#fff" }}
              onClick={() => navigate('/grupos')}
            >
              <FaArrowLeft className="me-2" />
              Volver a Grupos
            </button>
            <h2 style={{ color: '#7A1737' }}>
              <FaUsers className="me-2" />
              {grupo.nombre}
            </h2>
            {[3, 4].includes(Number(admin?.rol)) && (
              <button
                className="btn btn-primary"
                style={{ backgroundColor: '#7A1737', borderColor: '#7A1737' }}
                onClick={() => setShowAddModal(true)}
                disabled={disponibles.length === 0}
              >
                <FaUserPlus className="me-2" />
                Agregar Miembro
              </button>
            )}
          </div>

          {mensaje && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              {mensaje}
              <button type="button" className="btn-close" onClick={() => setMensaje('')}></button>
            </div>
          )}

          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}

          {/* Información del grupo */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Descripción:</strong> {grupo.descripcion || 'Sin descripción'}</p>
                </div>
                <div className="col-md-6">
                  <p>
                    <strong>Supervisor:</strong>{' '}
                    {grupo.supervisor_nombre ? (
                      `${grupo.supervisor_nombre} ${grupo.supervisor_apellido_paterno}`
                    ) : (
                      <span className="text-muted">Sin asignar</span>
                    )}
                  </p>
                </div>
              </div>
              <p className="mb-0">
                <strong>Total de miembros:</strong>{' '}
                <span className="badge bg-secondary">{grupo.miembros?.length || 0}</span>
              </p>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar miembro por nombre o CURP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Lista de miembros */}
          {filteredMembers.length === 0 ? (
            <div className="text-center py-5">
              <FaUsers size={64} className="text-muted mb-3" />
              <p className="text-muted">
                {grupo.miembros?.length === 0 
                  ? 'Este grupo no tiene miembros aún. Agrega trabajadores al grupo.' 
                  : 'No se encontraron miembros con ese criterio de búsqueda.'}
              </p>
            </div>
          ) : (
            <div className="row">
              {filteredMembers.map((miembro) => (
                <div key={miembro.id_personal} className="col-md-6 col-lg-4 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="card-title mb-0">
                          <FaUser className="me-2" style={{ color: '#7A1737' }} />
                          {miembro.nombre} {miembro.apellido_paterno}
                        </h6>
                        {[3, 4].includes(Number(admin?.rol)) && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRemoveMember(miembro.id_personal)}
                            title="Quitar del grupo"
                          >
                            <FaUserMinus />
                          </button>
                        )}
                      </div>
                      <p className="card-text small mb-1">
                        <strong>Usuario:</strong> {miembro.usuario}
                      </p>
                      <p className="card-text small mb-1">
                        <strong>CURP:</strong> {miembro.curp}
                      </p>
                      <p className="card-text small mb-1">
                        <strong>Correo:</strong> {miembro.correo}
                      </p>
                      <p className="card-text small text-muted mb-0">
                        Agregado: {new Date(miembro.fecha_asignacion).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal para agregar miembro */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: '#7A1737', color: '#fff' }}>
                <h5 className="modal-title">Agregar Miembro al Grupo</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedUser('');
                    setError('');
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Selecciona un trabajador</label>
                  <select
                    className="form-select"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                  >
                    <option value="">Selecciona...</option>
                    {disponibles.map((user) => (
                      <option key={user.id_personal} value={user.id_personal}>
                        {user.nombre} {user.apellido_paterno} {user.apellido_materno} - {user.curp}
                      </option>
                    ))}
                  </select>
                  {disponibles.length === 0 && (
                    <small className="text-muted">
                      No hay usuarios disponibles para agregar a este grupo.
                    </small>
                  )}
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedUser('');
                      setError('');
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ backgroundColor: '#7A1737', borderColor: '#7A1737' }}
                    onClick={handleAddMember}
                    disabled={!selectedUser}
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GrupoMiembros;
