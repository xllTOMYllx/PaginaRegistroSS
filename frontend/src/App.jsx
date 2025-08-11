import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import RegisterForm from './components/RegisterForm';
import Sesion from './components/sesion';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta inicial */}
        <Route path="/" element={<RegisterForm />} />

        {/* Otras rutas */}
        <Route path="/home" element={<Home />} />
        <Route path="/sesion" element={<Sesion />} />
      </Routes>
    </Router>
  );
}

export default App;
