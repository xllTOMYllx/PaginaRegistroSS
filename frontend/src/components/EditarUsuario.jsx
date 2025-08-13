import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function EditarUsuario() {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    curp: "",
    rfc: "",
    correo: "",
  });
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state && location.state.user) {
      setFormData(location.state.user);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    try {
      const response = await axios.put(
        `http://localhost:5000/api/users/${formData.id_personal}`,
        formData
      );
      setMensaje("Datos actualizados correctamente.");
      setTimeout(() => {
        navigate("/home", { state: { user: response.data.user } });
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Error al actualizar los datos. Intenta de nuevo.");
    }
  };

  return (
    <div className="container py-5">
      <div > 
      <button
        onClick={() => navigate("/home", { state: { user: formData } })}
        className="btn btn-dark mb-4"
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          backgroundColor: "#7A1737",
          marginBottom: "30px",
        }}    
      >
        Regresar
      </button>
      </div>

      <div className="row justify-content-center" style={{ marginTop: "20px" }}>
        <div className="col-12 col-md-8 col-lg-6">
          <h3 className="mb-4 text-center" style={{ color: "#7A1737" }}>
            Editar Datos Personales
          </h3>
          <form onSubmit={handleSubmit}>
            {["nombre", "apellido_paterno", "apellido_materno", "curp", "rfc", "correo"].map((field) => (
              <div className="mb-3" key={field}>
                <label className="form-label text-capitalize">
                  {field.replace("_", " ")}
                </label>
                <input
                  type="text"
                  name={field}
                  value={formData[field] || ""}
                  onChange={handleChange}
                  className="form-control rounded-3"
                  required
                />
              </div>
            ))}
            <button
              type="submit"
              className="btn w-100"
              style={{ backgroundColor: "#7A1737", color: "#fff" }}
            >
              Guardar Cambios
            </button>
            {mensaje && <div className="alert alert-success mt-3 text-center">{mensaje}</div>}
            {error && <div className="alert alert-danger mt-3 text-center">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditarUsuario;
