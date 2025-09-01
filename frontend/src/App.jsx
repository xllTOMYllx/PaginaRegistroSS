import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import RegisterForm from './components/RegisterForm';
import Sesion from './components/sesion';
import EditarUsuario from './components/EditarUsuario';
import Homeadmin from './components/Homeadmin';
import Usuarios from './components/Usuarios';
import UsuarioDetalle from './components/UsuarioDetalle';


function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta inicial */}
        <Route path="/" element={<RegisterForm />} />

        {/* Otras rutas */}
        <Route path="/home" element={<Home />} />
        <Route path="/Homeadmin" element={<Homeadmin />} />
        <Route path="/sesion" element={<Sesion />} />
        <Route path="/editarUsuario" element={<EditarUsuario />}/>
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/Usuarios/:id" element={<UsuarioDetalle />} />

      </Routes>
    </Router>
  );
}

export default App;
