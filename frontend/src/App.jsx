import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import RegisterForm from './components/RegisterForm';
import Sesion from './components/sesion';
import EditarUsuario from './components/EditarUsuario';
import Homeadmin from './components/Homeadmin';
import Usuarios from './components/Usuarios';
import UsuarioDetalle from './components/UsuarioDetalle';
import CrearUsuario from './components/CrearUsuario';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<RegisterForm />} />
        <Route path="/sesion" element={<Sesion />} />

        {/* Rutas protegidas */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/homeadmin"
          element={
            <ProtectedRoute>
              <Homeadmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editarUsuario"
          element={
            <ProtectedRoute>
              <EditarUsuario />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute>
              <Usuarios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Usuarios/:id"
          element={
            <ProtectedRoute>
              <UsuarioDetalle />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crearUsuario"
          element={
            <ProtectedRoute>
              <CrearUsuario />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
