import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Baja_user() {
  const [usuarios, setUsuarios] = useState([]);
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const adminData = JSON.parse(localStorage.getItem("usuario"));
    if (!token || !adminData) {
      navigate('/sesion', { replace: true });
      return;
    }
    setAdmin(adminData);

    fetch("http://localhost:5000/api/users/rol/1", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch((err) => console.error(err));
  }, [navigate]);

  // Buscar usuarios (usado por la barra de búsqueda superior)
  const buscarUsuario = async (termino) => {
    try {
      const token = localStorage.getItem('token');
        const q = termino?.trim() || '';
        const url = q ? `http://localhost:5000/api/users/buscar?nombre=${encodeURIComponent(q)}` : `http://localhost:5000/api/users/rol/1`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      console.error('Error al buscar usuarios:', err);
    }
  };

  const toggleUsuario = async (id, status) => {
    const accion = status ? "bloquear" : "desbloquear";
    try {
      const res = await fetch(`http://localhost:5000/api/users/${accion}/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUsuarios((prev) =>
          prev.map((u) => (u.id_personal === id ? { ...u, status: !status } : u))
        );
      } else {
        alert(data.error || `Error al ${accion} el usuario`);
      }
    } catch (err) {
      console.error(err);
      alert(`No se pudo ${accion} el usuario`);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    setAdmin(null);
    navigate('/sesion', { replace: true });
  };

  if (!admin) return null;

  return (
    <div className="d-flex vh-100 baja-user-container">
      <Sidebar admin={admin} cerrarSesion={cerrarSesion} />
      <main className="flex-grow-1 d-flex flex-column main-content">
        <Navbar onBuscar={buscarUsuario} hideCrear={admin?.rol !== 3} />
        <div className="container mt-4">
          <h2 className="mb-3">Usuarios</h2>
          <div className="table-responsive">
            <table className="table table-bordered table-striped table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  {/*<th>ID</th>*/}
                  <th>Nombre</th>
                  <th>Apellido Paterno</th>
                  <th>Apellido Materno</th>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>RFC</th>
                  <th>Estatus</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length > 0 ? (
                  usuarios.map((u) => (
                    <tr key={u.id_personal}>
                      {/*<td className="col-id">{u.id_personal}</td>*/}
                      <td className="col-nombre truncate">{u.nombre}</td>
                      <td className="col-ap truncate">{u.apellido_paterno}</td>
                      <td className="col-am truncate">{u.apellido_materno}</td>
                      <td className="col-usuario truncate">{u.usuario || u.USUARIO}</td>
                      <td className="col-correo truncate">{u.correo}</td>
                      <td className="col-rfc">{u.rfc || u.RFC || 'No disponible'}</td>
                      <td>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`switch-${u.id_personal}`}
                            checked={u.status}
                            onChange={() => toggleUsuario(u.id_personal, u.status)}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`switch-${u.id_personal}`}
                          >
                            {u.status ? "Activo" : "Bloqueado"}
                          </label>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No hay usuarios con rol 1
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Baja_user;