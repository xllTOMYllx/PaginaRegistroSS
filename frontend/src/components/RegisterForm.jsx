import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function RegisterForm() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir: registro deshabilitado; lo hacen roles 2 y 3 desde panel
    navigate('/homeadmin', { replace: true });
  }, [navigate]);

  return null;
}

export default RegisterForm;
