import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import RegisterForm from './components/RegisterForm';
import Sesion from './components/sesion';
import EditarUsuario from './components/EditarUsuario';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta inicial */}
        <Route path="/" element={<RegisterForm />} />

        {/* Otras rutas */}
        <Route path="/home" element={<Home />} />
        <Route path="/sesion" element={<Sesion />} />
        <Route path="/editarUsuario" element={<EditarUsuario />} />

      </Routes>
    </Router>
  );
}

export default App;
