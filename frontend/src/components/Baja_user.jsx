import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Baja_user() {
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate(); // hook de navegación

  useEffect(() => {
    fetch("http://localhost:5000/api/users/rol/1", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch((err) => console.error(err));
  }, []);

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

  return (
    <div className="container mt-4">
      <button
        className="btn btn-regresar mb-3"
        onClick={() => navigate(-1)} // vuelve a la página anterior
      >
        ← Regresar
      </button>

      <h2 className="mb-3">Usuarios</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-striped table-hover align-middle">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
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
                <td className="col-id">{u.id_personal}</td>
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
                      checked={u.status} // true = activo, false = bloqueado
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
  );
}

export default Baja_user;
