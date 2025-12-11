// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../css/Navbar.css'

// Componente Navbar con búsqueda y botones
function Navbar({ onBuscar, hideCrear }) {
  const [termino, setTermino] = useState("");
  const navigate = useNavigate();
  // Si no se pasa la prop `hideCrear`, inferirla desde el usuario almacenado
  const usuarioStored = (() => {
    try {
      return JSON.parse(localStorage.getItem('usuario'));
    } catch (e) {
      return null;
    }
  })();
  const shouldHideCrear = typeof hideCrear === 'boolean' ? hideCrear : (usuarioStored?.rol !== 3);

  // ⏳ Debounce: espera 500ms después de que el usuario deja de escribir
  useEffect(() => {
    const delay = setTimeout(() => {
      if (typeof onBuscar === "function") {
        onBuscar(termino);
      }
    }, 500);

    return () => clearTimeout(delay); // limpia el timeout si el usuario sigue escribiendo
  }, [termino]);
  // ⏳ Fin Debounce

  return (// Navbar con estilos responsivos
    <>
      <div className="top-image-container" style={{ textAlign: 'center', padding: '8px 0' }}>
        <img
          src={encodeURI('/ImagenSesver.png')}
          alt="Imagen superior"
          style={{ maxWidth: '80%', height: '100%', display: 'block', margin: '0 auto' }}
        />
      </div>

      <nav
        className="navbar shadow-sm px-3 px-md-4 app-navbar"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1030,
          paddingTop: "clamp(0.5rem, 1.5vw, 0.75rem)",
          paddingBottom: "clamp(0.5rem, 1.5vw, 0.75rem)",
        }}
      > {/* Contenedor principal */}
        <div className="container-fluid d-flex align-items-center flex-wrap flex-md-nowrap">
          {typeof onBuscar === 'function' && (
            <form
              className="d-flex align-items-center flex-grow-0"
              onSubmit={(e) => e.preventDefault()}
              style={{
                maxWidth: "clamp(500px, 40vw, 300px)",
                width: "100%",
              }}
            > {/* Formulario de búsqueda */}
              <input
                className="form-control me-2"
                type="search"
                placeholder="Buscar..."
                aria-label="Buscar"
                value={termino}
                onChange={(e) => setTermino(e.target.value)}
                style={{
                  fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)",
                  padding: "clamp(0.3rem, 1vw, 0.4rem)",
                }}
              /> {/* Botón para limpiar búsqueda */}
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setTermino("")}
              >
                Limpiar
              </button>
            </form>
          )}

        </div>

      </nav>
    </>
  );
}

export default Navbar;