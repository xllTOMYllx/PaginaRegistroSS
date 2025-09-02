import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Navbar({ onBuscar }) {
  const [termino, setTermino] = useState("");
  const navigate = useNavigate();

  // ⏳ Debounce: espera 500ms después de que el usuario deja de escribir
  useEffect(() => {
    const delay = setTimeout(() => {
      if (typeof onBuscar === "function") {
        onBuscar(termino);
      }
    }, 500);

    return () => clearTimeout(delay); // limpia el timeout si el usuario sigue escribiendo
  }, [termino]);

  return (
    <nav className="navbar navbar-light bg-white shadow-sm px-4">
      <form className="d-flex w-50" onSubmit={(e) => e.preventDefault()}>
        <input
          className="form-control me-2"
          type="search"
          placeholder="Buscar..."
          aria-label="Buscar"
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
        />
        <button className="btn btn-outline-success" type="submit" disabled>
          🔍
        </button>
        <button
          className="btn btn-outline-secondary ms-2"
          type="button"
          onClick={() => setTermino("")}
        >
          🧹 Limpiar
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