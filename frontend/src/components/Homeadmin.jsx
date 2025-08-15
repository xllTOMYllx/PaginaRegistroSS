import { useEffect, useState } from "react";
import axios from "axios";

function Homeadmin() {
  const [usuariosRol1, setUsuariosRol1] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newUser, setNewUser] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    usuario: '',
    contrasena: '',
    correo: '',
    curp: '',
    rfc: ''
  });
  const [crearError, setCrearError] = useState('');
  const [crearExito, setCrearExito] = useState('');

  // === Obtener usuarios con rol 1 ===
  useEffect(() => {
    const fetchUsuariosRol1 = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/users/rol/1", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsuariosRol1(res.data);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuariosRol1();
  }, []);

  // === Manejo formulario crear usuario ===
  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    setCrearError('');
    setCrearExito('');

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/users/register",
        { ...newUser, rol: 2 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCrearExito('Usuario creado con éxito.');
      setNewUser({
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        usuario: '',
        contrasena: '',
        correo: '',
        curp: '',
        rfc: ''
      });
    } catch (error) {
      setCrearError(error.response?.data?.error || 'Error al crear usuario.');
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Cargando usuarios...</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center" style={{ color: "#7A1737" }}>
        Panel de Jefe - Usuarios Rol 1
      </h2>

      {usuariosRol1.length === 0 ? (
        <div className="alert alert-info text-center">
          No hay usuarios con rol 1 registrados.
        </div>
      ) : (
        <div className="table-responsive mb-5">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Nombre Completo</th>
                <th>Usuario</th>
                <th>Correo</th>
                <th>CURP</th>
                <th>RFC</th>
                <th>Documentos</th>
              </tr>
            </thead>
            <tbody>
              {usuariosRol1.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{`${user.nombre} ${user.apellido_paterno} ${user.apellido_materno}`}</td>
                  <td>{user.usuario}</td>
                  <td>{user.correo}</td>
                  <td>{user.curp}</td>
                  <td>{user.rfc}</td>
                  <td>
                    {user.documentos && user.documentos.length > 0 ? (
                      user.documentos.map((doc, idx) => (
                        <a
                          key={idx}
                          href={`http://localhost:5000/uploads/${doc}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-primary me-2 mb-1"
                        >
                          Ver {idx + 1}
                        </a>
                      ))
                    ) : (
                      <span className="text-muted">Sin documentos</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* === Formulario crear usuarios rol 2 === */}
      <div className="mt-5 p-4 border rounded">
        <h4 className="mb-3" style={{ color: "#7A1737" }}>Crear Usuario Rol 2</h4>

        {crearError && <div className="alert alert-danger">{crearError}</div>}
        {crearExito && <div className="alert alert-success">{crearExito}</div>}

        <form onSubmit={handleCrearUsuario}>
          <div className="row">
            <div className="col-md-4 mb-3">
              <input type="text" name="nombre" placeholder="Nombre" className="form-control" value={newUser.nombre} onChange={handleNewUserChange} required />
            </div>
            <div className="col-md-4 mb-3">
              <input type="text" name="apellido_paterno" placeholder="Apellido Paterno" className="form-control" value={newUser.apellido_paterno} onChange={handleNewUserChange} required />
            </div>
            <div className="col-md-4 mb-3">
              <input type="text" name="apellido_materno" placeholder="Apellido Materno" className="form-control" value={newUser.apellido_materno} onChange={handleNewUserChange} />
            </div>
            <div className="col-md-4 mb-3">
              <input type="text" name="usuario" placeholder="Usuario" className="form-control" value={newUser.usuario} onChange={handleNewUserChange} required />
            </div>
            <div className="col-md-4 mb-3">
              <input type="password" name="contrasena" placeholder="Contraseña" className="form-control" value={newUser.contrasena} onChange={handleNewUserChange} required />
            </div>
            <div className="col-md-4 mb-3">
              <input type="email" name="correo" placeholder="Correo" className="form-control" value={newUser.correo} onChange={handleNewUserChange} required />
            </div>
            <div className="col-md-4 mb-3">
              <input type="text" name="curp" placeholder="CURP" className="form-control" value={newUser.curp} onChange={handleNewUserChange} required />
            </div>
            <div className="col-md-4 mb-3">
              <input type="text" name="rfc" placeholder="RFC" className="form-control" value={newUser.rfc} onChange={handleNewUserChange} required />
            </div>
          </div>
          <button type="submit" className="btn btn-success">Crear Usuario</button>
        </form>
      </div>
    </div>
  );
}

export default Homeadmin;
