import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import RegisterForm from './components/RegisterForm';
import Sesion from './components/sesion';
import EditarUsuario from './components/EditarUsuario';
import Homeadmin from './components/Homeadmin';
import HomeAdmin4 from './components/HomeAdmin4';
import HomeUsuario2 from './components/HomeUsuario2';
import Usuarios from './components/Usuarios';
import UsuarioDetalle from './components/UsuarioDetalle';
import CrearUsuario from './components/CrearUsuario';
import ProtectedRoute from './components/ProtectedRoute';
import Baja_user from './components/Baja_user';
import Recuperarcuent from './components/Recuperarcuent';
import BusquedaAvanzada from './components/BusquedaAvanzada';
import Grupos from './components/Grupos';
import GrupoMiembros from './components/GrupoMiembros';
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
          path="/homeadmin4"
          element={
            <ProtectedRoute>
              <HomeAdmin4 />
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
        <Route
          path="/HomeUsuario2"
          element={
            <ProtectedRoute>
              <HomeUsuario2 />
            </ProtectedRoute>
          }
        />

         <Route
          path="/baja_user"
          element={
            <ProtectedRoute>
              <Baja_user />
            </ProtectedRoute>
          }
        />
        
         <Route
          path="/Recuperarcuent"
          element={
            <ProtectedRoute>
              <Recuperarcuent/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/busqueda-avanzada"
          element={
            <ProtectedRoute>
              <BusquedaAvanzada />
            </ProtectedRoute>
          }
        />

        <Route
          path="/grupos"
          element={
            <ProtectedRoute>
              <Grupos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/grupos/:id/miembros"
          element={
            <ProtectedRoute>
              <GrupoMiembros />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
