import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../Navbar.css';

function Navbar({ onBuscar, hideCrear }) {
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
    <nav
      className="navbar navbar-light bg-white shadow-sm px-3 px-md-4"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        paddingTop: "clamp(0.5rem, 1.5vw, 0.75rem)",
        paddingBottom: "clamp(0.5rem, 1.5vw, 0.75rem)",
      }}
    >
      <div className="container-fluid d-flex align-items-center flex-nowrap">
        <form
          className="d-flex align-items-center flex-grow-0"
          onSubmit={(e) => e.preventDefault()}
          style={{
            maxWidth: "clamp(300px, 40vw, 300px)",
            width: "100%",
          }}
        >
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
          />
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => setTermino("")}
            style={{
              fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
              padding: "clamp(0.25rem, 0.8vw, 0.35rem)",
              whiteSpace: "nowrap",
            }}
          >
            🧹
          </button>
        </form>

        <div
          className="d-flex align-items-center ms-auto gap-2"
          style={{ flexShrink: 0 }}
        >
          <button
            className="btn btn-light"
            style={{
              fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)",
              padding: "clamp(0.25rem, 0.8vw, 0.35rem)",
            }}
          >
            🔔
          </button>
          {!hideCrear && (
            <button
              onClick={() => navigate("/CrearUsuario")}
              className="btn btn-primary"
              style={{
                fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)",
                padding: "clamp(0.25rem, 0.8vw, 0.35rem)",
                whiteSpace: "nowrap",
              }}
            >
              ➕ Crear
            </button>
          )}
        </div>
      </div>
{/* Estilos responsivos 
      <style>{`
        @media (min-width: 768px) {
          .navbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .container-fluid {
            flex-wrap: nowrap;
          }
          .d-flex.align-items-center.ms-auto {
            flex-wrap: nowrap;
          }
        }
        @media (max-width: 767px) {
          .navbar {
            padding-left: clamp(2.5rem, 6vw, 3.5rem) !important;
            padding-right: clamp(0.5rem, 2vw, 0.75rem) !important;
          }
          .container-fluid {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          .d-flex.align-items-center.ms-auto {
            width: 100%;
            justify-content: flex-end;
            gap: 1rem;
          }
          .form-control {
            width: 100% !important;
          }
          .btn {
            padding: clamp(0.3rem, 1vw, 0.4rem);
            font-size: clamp(0.8rem, 2vw, 0.9rem);
          }
        }
        @media (max-width: 576px) {
          .navbar {
            padding-top: clamp(0.4rem, 1.2vw, 0.6rem) !important;
            padding-bottom: clamp(0.4rem, 1.2vw, 0.6rem) !important;
          }
          .d-flex.align-items-center.ms-auto {
            gap: 0.5rem;
          }
        }
      `}</style>
      */}
    </nav>
  );
}

export default Navbar;