import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Recuperarcuent() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]); // suggestions
  const [error, setError] = useState("");
  const [info, setInfo] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const token = localStorage.getItem("token");
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem("usuario"));
    if (!token || !adminData) {
      navigate('/sesion', { replace: true });
      return;
    }
    setAdmin(adminData);
  }, [navigate, token]);

  // Buscar sugerencias (debounce)
  useEffect(() => {
    setError("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || !query.trim()) {
      setUsuarios([]);
      setActiveIndex(-1);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/users/buscar?nombre=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsuarios(res.data || []);
        setActiveIndex(-1);
      } catch (err) {
        setError(err.response?.data?.error || "Error al buscar usuarios");
        setUsuarios([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query, token]);

  const handleSelect = (u) => {
    setSelected(u);
    setUsuarios([]);
    setQuery(`${u.nombre} ${u.apellido_paterno} ${u.apellido_materno}`);
    setError("");
  };

  const handleGenerarTemporal = async (id) => {
    if (!confirm("Se generará y reemplazará la contraseña por una temporal. ¿Continuar?")) return;
    setError(""); setInfo(null);
    try {
      const res = await axios.post(`http://localhost:5000/api/users/recuperar/generar-temporal/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInfo({ usuario: res.data.usuario, temporal: res.data.temporal });
      alert('Contraseña temporal generada. Entregarla al usuario de forma segura.');
    } catch (err) {
      setError(err.response?.data?.error || "Error al generar contraseña temporal");
    }
  };

  const handleClear = () => {
    setQuery("");
    setUsuarios([]);
    setSelected(null);
    setInfo(null);
    setError("");
    setActiveIndex(-1);
  };

  // Keyboard navigation for suggestions
  const handleKeyDown = (e) => {
    if (usuarios.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, usuarios.length - 1));
      scrollIntoView(activeIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
      scrollIntoView(activeIndex - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const u = usuarios[activeIndex] || usuarios[0];
      if (u) handleSelect(u);
    } else if (e.key === 'Escape') {
      setUsuarios([]);
      setActiveIndex(-1);
    }
  };

  const scrollIntoView = (index) => {
    const container = suggestionsRef.current;
    if (!container) return;
    const item = container.querySelector(`[data-index="${index}"]`);
    if (item) item.scrollIntoView({ block: 'nearest' });
  };

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    setAdmin(null);
    navigate('/sesion', { replace: true });
  };

  if (!admin) return null;

  return (
    <div className="d-flex vh-100 recuperar-cuenta-container">
      <Sidebar admin={admin} cerrarSesion={cerrarSesion} />
      <main className="flex-grow-1 d-flex flex-column main-content">
        {/* No le pasamos onBuscar para que Navbar no muestre su búsqueda */}
        <Navbar hideCrear={admin?.rol !== 3} />

        <div className="container mt-4">
          <h2 className="mb-4" style={{ color: "#7A1737" }}>Recuperar Contraseñas</h2>

          {/* Mensajes */}
          {error && <div className="alert alert-danger">{error}</div>}
          {info && (
            <div className="alert" style={{ backgroundColor: "rgba(122, 23, 55, 0.1)", border: "1px solid rgba(122, 23, 55, 0.2)", color: "#7A1737" }}>
              <h5 className="mb-3">Contraseña Temporal Generada</h5>
              <p><strong>Usuario:</strong> {info.usuario}</p>
              <p><strong>Contraseña temporal:</strong> <code style={{ backgroundColor: "rgba(122, 23, 55, 0.1)" }}>{info.temporal}</code></p>
            </div>
          )}

          {/* Buscador local (typeahead) */}
          <div className="mb-3">
            <label className="form-label">Buscar por nombre / CURP / RFC</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Escribe nombre, CURP o RFC..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
                onKeyDown={handleKeyDown}
                aria-autocomplete="list"
                aria-expanded={usuarios.length > 0}
                aria-controls="recuperar-suggestions"
                autoComplete="off"
              />
              <button className="btn btn-outline-secondary" type="button" onClick={handleClear} title="Limpiar">
                🧹
              </button>
            </div>

            {/* Sugerencias */}
            {loading && <div className="mt-2 text-muted small">Buscando...</div>}
            {usuarios.length > 0 && (
              <div ref={suggestionsRef} id="recuperar-suggestions" className="list-group mt-2" style={{ maxHeight: 220, overflowY: 'auto', zIndex: 1060 }}>
                {usuarios.map((u, i) => (
                  <button
                    key={u.id_personal}
                    type="button"
                    data-index={i}
                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-start ${i === activeIndex ? 'active' : ''}`}
                    onClick={() => handleSelect(u)}
                  >
                    <div>
                      <div style={{ fontSize: "1rem" }}><strong>{u.nombre} {u.apellido_paterno} {u.apellido_materno}</strong></div>
                      <small className="text-muted">Usuario: {u.usuario} • {u.correo || 'sin correo'}</small>
                    </div>
                    <div className="text-end text-muted" style={{ fontSize: '0.85rem' }}>
                      {u.curp || u.rfc ? (u.curp || u.rfc) : '—'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Seleccionado */}
          {selected && (
            <div className="card mb-3">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <div style={{ fontSize: "1.1rem" }}><strong>{selected.nombre} {selected.apellido_paterno} {selected.apellido_materno}</strong></div>
                  <div className="text-muted">{selected.usuario} • {selected.correo || 'sin correo'}</div>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn"
                    style={{ backgroundColor: "#7A1737", color: "#fff" }}
                    onClick={() => handleGenerarTemporal(selected.id_personal)}
                  >
                    Generar contraseña temporal
                  </button>
                  <button className="btn btn-outline-secondary" onClick={handleClear}>Buscar otro</button>
                </div>
              </div>
            </div>
          )}

          {/* Si no hay seleccionado pero hay resultados previamente (por ejemplo después de submit manual) */}
          {!selected && usuarios.length === 0 && !loading && (
            <div className="text-muted small">Escribe para buscar usuarios. Selecciona uno de la lista para recuperar su contraseña.</div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Recuperarcuent;
