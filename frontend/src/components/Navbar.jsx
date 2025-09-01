// src/components/Navbar.jsx
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar navbar-light bg-white shadow-sm px-4">
      <form className="d-flex w-50">
        <input
          className="form-control me-2"
          type="search"
          placeholder="Buscar..."
          aria-label="Buscar"
        />
        <button className="btn btn-outline-success" type="submit">
          🔍
        </button>
      </form>

      <div className="d-flex align-items-center gap-3">
        <button className="btn btn-light">🔔</button>
        <button
          onClick={() => navigate("/crear-usuario")}
          className="btn btn-primary"
        >
          ➕ Crear Usuario
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
