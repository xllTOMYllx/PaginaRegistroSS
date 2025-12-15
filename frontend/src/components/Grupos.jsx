import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { FaUsers, FaUserTie, FaPlus, FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import '../css/Grupos.css'

function Grupos() {
  const [grupos, setGrupos] = useState([]);
  const [supervisores, setSupervisores] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    id_supervisor: ''
  });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const stored = (() => { try { return JSON.parse(localStorage.getItem('usuario')); } catch { return null; } })();
    const token = localStorage.getItem('token');
    const adminData = user || stored;

    // Permitir acceso a roles 2 (supervisor), 3 (jefe) y 4 (admin)
    if (!adminData || !token || ![2,3,4].includes(Number(adminData.rol))) {
      navigate('/sesion', { replace: true });
      return;
    }

    setAdmin(adminData);
    fetchGrupos();
    // Admin/jefe necesitan lista de supervisores
    if ([3,4].includes(Number(adminData.rol))) {
      fetchSupervisores();
    }
  }, [navigate, user]);

  const fetchGrupos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/grupos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGrupos(response.data);
    } catch (error) {
      console.error('Error al obtener grupos:', error);
      setError('Error al cargar los grupos');
    }
  };

  const fetchSupervisores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users/rol/3', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filtrar solo supervisores (rol 2)
      const supervisoresData = response.data.filter(u => u.rol === 2);
      setSupervisores(supervisoresData);
    } catch (error) {
      console.error('Error al obtener supervisores:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    try {
      const token = localStorage.getItem('token');
      const data = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        id_supervisor: formData.id_supervisor || null
      };

      if (editingGrupo) {
        await axios.put(
          `http://localhost:5000/api/grupos/${editingGrupo.id_grupo}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMensaje('Grupo actualizado exitosamente');
      } else {
        await axios.post('http://localhost:5000/api/grupos', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMensaje('Grupo creado exitosamente');
      }

      fetchGrupos();
      handleCloseModal();
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      console.error('Error al guardar grupo:', error);
      setError(error.response?.data?.error || 'Error al guardar el grupo');
    }
  };

  const handleEdit = (grupo) => {
    setEditingGrupo(grupo);
    setFormData({
      nombre: grupo.nombre,
      descripcion: grupo.descripcion || '',
      id_supervisor: grupo.id_supervisor || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este grupo? Se eliminarán también todas las asignaciones de miembros.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/grupos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensaje('Grupo eliminado exitosamente');
      fetchGrupos();
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      console.error('Error al eliminar grupo:', error);
      setError(error.response?.data?.error || 'Error al eliminar el grupo');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGrupo(null);
    setFormData({ nombre: '', descripcion: '', id_supervisor: '' });
    setError('');
  };

  const cerrarSesion = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    navigate('/sesion', { replace: true });
  };

  return (
    <div className="d-flex vh-100">
      <Sidebar admin={admin} cerrarSesion={cerrarSesion} />
      <main className="flex-grow-1 d-flex flex-column main-content">
        <Navbar hideCrear={true} />
        <div className="container py-4">
          <div className="mb-4">
            <div>
              {/* Botón para regresar a Homeadmin, permanece oculto de momento*/}
              <button 
                className="btn me-2" 
                style={{ backgroundColor: "#7A1737", color: "#fff", display: 'none' }}
                onClick={() => navigate('/homeadmin')}
              >
                <FaArrowLeft className="me-2" />
                Regresar
              </button>
            </div>
            <h2 style={{ color: '#7A1737' }}>
              <FaUsers className="me-2" />
              Gestión de Grupos
            </h2>
            {/* Botón para crear nuevo grupo, con la condicion de que solo se muestre para el rol 3 (Admin) y permanece oculto para el rol 2(Supervisor) */}
            {[4,3].includes(admin?.rol) && (
            <button
              className="btn btn-primary"
              style={{ backgroundColor: '#7A1737', borderColor: '#7A1737' }}
              onClick={() => setShowModal(true)}
            >
              <FaPlus className="me-2" />
              Crear Grupo
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

          <div className="row">
            {grupos.length === 0 ? (
              <div className="col-12 text-center py-5">
                <FaUsers size={64} className="text-muted mb-3" />
                <p className="text-muted">No hay grupos creados. Crea tu primer grupo para comenzar.</p>
              </div>
            ) : (
              grupos.map((grupo) => (
                <div key={grupo.id_grupo} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="card-title mb-0" style={{ color: '#7A1737' }}>
                          <FaUsers className="me-2" />
                          {grupo.nombre}
                        </h5>
                        <div>
                          <button
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => handleEdit(grupo)}
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(grupo.id_grupo)}
                            title="Eliminar"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>

                      {grupo.descripcion && (
                        <p className="card-text text-muted small">{grupo.descripcion}</p>
                      )}

                      <div className="mb-2">
                        <strong>
                          <FaUserTie className="me-2" />
                          Supervisor:
                        </strong>
                        {grupo.supervisor_nombre ? (
                          <span className="ms-2">
                            {grupo.supervisor_nombre} {grupo.supervisor_apellido_paterno}
                          </span>
                        ) : (
                          <span className="ms-2 text-muted">Sin asignar</span>
                        )}
                      </div>

                      <div className="mb-3">
                        <strong>Miembros:</strong>
                        <span className="ms-2 badge bg-secondary">{grupo.total_miembros || 0}</span>
                      </div>

                      <button
                        className="btn btn-sm w-100"
                        style={{ backgroundColor: '#7A1737', color: '#fff' }}
                        onClick={() => navigate(`/grupos/${grupo.id_grupo}/miembros`)}
                      >
                        Ver Miembros
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modal para crear/editar grupo */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: '#7A1737', color: '#fff' }}>
                <h5 className="modal-title">
                  {editingGrupo ? 'Editar Grupo' : 'Crear Nuevo Grupo'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
              </div>
              {/* Opcion para darle un nombre al grupo, se convierte automaticamente a mayusculas */}
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Nombre del Grupo *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Supervisor Asignado</label>
                    <select
                      className="form-select"
                      value={formData.id_supervisor}
                      onChange={(e) => setFormData({ ...formData, id_supervisor: e.target.value })}
                    >
                      <option value="">Sin asignar</option>
                      {supervisores.map((sup) => (
                        <option key={sup.id_personal} value={sup.id_personal}>
                          {sup.nombre} {sup.apellido_paterno} {sup.apellido_materno}
                        </option>
                      ))}
                    </select>
                  </div>

                  {error && <div className="alert alert-danger">{error}</div>}

                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ backgroundColor: '#7A1737', borderColor: '#7A1737' }}
                    >
                      {editingGrupo ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Grupos;
