import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const usuario = localStorage.getItem('usuario');
  const token = localStorage.getItem('token');
  if (!usuario || !token) {
    return <Navigate to="/sesion" replace />;
  }
  return children;
};

export default ProtectedRoute;