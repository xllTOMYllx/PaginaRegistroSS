
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Recuperarcuent() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState(null);
  const [admin, setAdmin] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem("usuario"));
    if (!token || !adminData) {
      navigate('/sesion', { replace: true });
      return;
    }
    setAdmin(adminData);
  }, [navigate]);

  // Buscar usuarios desde la barra superior (onBuscar)
  const handleBuscar = async (q) => {
    const termino = typeof q === 'string' ? q : '';
    setError(""); setUsuarios([]); setInfo(null);
    if (!termino.trim()) { setError("Ingresa un nombre, CURP O RFC para buscar"); return; }

    try {
      const res = await axios.get(`http://localhost:5000/api/users/buscar?nombre=${encodeURIComponent(termino)}`, {
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

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    setAdmin(null);
    navigate('/sesion', { replace: true });
  };

  if (!admin) return null;

  return (
    <div className="d-flex vh-100">
      <Sidebar admin={admin} cerrarSesion={cerrarSesion} />
      <main className="flex-grow-1 d-flex flex-column">
        <Navbar onBuscar={handleBuscar} hideCrear={admin?.rol !== 3} />
        <div className="container mt-4">

          <h2 className="mb-4" style={{ color: "#7A1737" }}>Recuperar Contraseñas</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          {usuarios.length > 0 && (
            <div className="list-group mb-3">
              {usuarios.map(u => (
                <div key={u.id_personal} className="list-group-item d-flex justify-content-between align-items-center" style={{ backgroundColor: "rgba(122, 23, 55, 0.02)" }}>
                  <div>
                    <div style={{ fontSize: "1.1rem" }}><strong>{u.nombre} {u.apellido_paterno} {u.apellido_materno}</strong></div>
                    <div className="text-muted">
                      <span className="me-3"><i className="fas fa-user me-1"></i>Usuario: {u.usuario}</span>
                      <span><i className="fas fa-envelope me-1"></i>Correo: {u.correo}</span>
                    </div>
                  </div>
                  <div>
                    <button
                      className="btn btn-sm"
                      onClick={() => handleGenerarTemporal(u.id_personal)}
                      style={{ backgroundColor: "#7A1737", color: "#fff" }}
                    >
                      Generar contraseña temporal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {info && (
            <div className="alert" style={{ backgroundColor: "rgba(122, 23, 55, 0.1)", border: "1px solid rgba(122, 23, 55, 0.2)", color: "#7A1737" }}>
              <h5 className="mb-3">Contraseña Temporal Generada</h5>
              <p><strong>Usuario:</strong> {info.usuario}</p>
              <p><strong>Contraseña temporal:</strong> <code style={{ backgroundColor: "rgba(122, 23, 55, 0.1)" }}>{info.temporal}</code></p>
              <hr />
              <p className="small mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Entrega esta contraseña al usuario de forma segura y pídele que la cambie en su próximo inicio de sesión.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Recuperarcuent;
