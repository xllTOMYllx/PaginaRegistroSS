
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

  function Recuperarcuent() {
  const [nombre, setNombre] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState(null); // para mostrar contraseña temporal

  const token = localStorage.getItem("token");

  const handleBuscar = async () => {
    setError(""); setUsuarios([]); setInfo(null);
    if (!nombre.trim()) { setError("Ingresa un nombre"); return; }

    try {
      const res = await axios.get(`http://localhost:5000/api/users/buscar?nombre=${encodeURIComponent(nombre)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(res.data);
      if (res.data.length === 0) setError("No se encontraron usuarios");
    } catch (err) {
      setError(err.response?.data?.error || "Error al buscar usuarios");
    }
  };

  const handleGenerarTemporal = async (id) => {
    if (!confirm("Se generará y reemplazará la contraseña por una temporal. ¿Continuar?")) return;
    setError(""); setInfo(null);

    try {
      const res = await axios.post(`http://localhost:5000/api/users/recuperar/generar-temporal/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // res.data.temporal contiene la contraseña temporal generada
      setInfo({
        usuario: res.data.usuario,
        temporal: res.data.temporal
      });

      // Opcional: mostrar mensaje de éxito
      alert('Contraseña temporal generada. Entregarla al usuario de forma segura.');
    } catch (err) {
      setError(err.response?.data?.error || "Error al generar contraseña temporal");
    }
  };

  const navigate = useNavigate();

  return (
    <div className="container mt-4">
      <button
        className="btn btn-regresar mb-3"
        onClick={() => navigate(-1)}
      >
        ← Regresar
      </button>

      <h2 className="accent-header">Recuperar Contraseñas</h2>

      <div className="mb-3">
        <label className="form-label">Nombre completo (o parte)</label>
        <input className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>

      <button className="btn btn-primary mb-3" onClick={handleBuscar}>Buscar</button>

      {error && <div className="alert alert-danger">{error}</div>}

      {usuarios.length > 0 && (
        <div className="list-group mb-3">
          {usuarios.map(u => (
            <div key={u.id_personal} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <div><strong>{u.nombre} {u.apellido_paterno} {u.apellido_materno}</strong></div>
                <div className="text-muted">Usuario: {u.usuario} — Correo: {u.correo}</div>
              </div>
              <div>
                <button className="btn btn-warning btn-sm" onClick={() => handleGenerarTemporal(u.id_personal)}>
                  Generar contraseña temporal
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {info && (
        <div className="alert alert-info">
          <p><strong>Usuario:</strong> {info.usuario}</p>
          <p><strong>Contraseña temporal:</strong> <code>{info.temporal}</code></p>
          <p className="small">Entrega esta contraseña al usuario de forma segura y pídele que la cambie en su próximo inicio de sesión.</p>
        </div>
      )}
    </div>
  );
}

export default Recuperarcuent;
