import React, { createContext, useState, useEffect, useContext } from 'react';

/**
 * AuthContext
 *
 * Proporciona un contexto global para el usuario autenticado.
 *
 * Qué hace:
 * - Expone `{ user, setUser }` para que cualquier componente pueda leer
 *   o actualizar el usuario actualmente autenticado.
 * - Al montarse, intenta restaurar la sesión leyendo `localStorage.getItem('usuario')`.
 * - No gestiona el token JWT directamente: el token (por ej. `localStorage.getItem('token')`)
 *   debe guardarse/leerlo en el flujo de login/logout; este contexto almacena únicamente
 *   el objeto `usuario` (información pública del usuario).
 *
 * Uso recomendado:
 * - En `main.jsx` envolver la app con `AuthProvider`:
 *
 *   <AuthProvider>
 *     <App />
 *   </AuthProvider>
 *
 * - En componentes:
 *
 *   const { user, setUser } = useAuth();
 *   // `user` es null si no hay sesión; `setUser` actualiza el usuario en contexto.
 *
 * - Flujo típico de login:
 *   1) El endpoint de login devuelve `{ token, usuario }`.
 *   2) Guardar token en `localStorage` (o cookie httpOnly en producción).
 *   3) Guardar `usuario` en `localStorage` y llamar `setUser(usuario)` para sincronizar el contexto.
 *
 * Notas de seguridad y mejoras:
 * - Guardar tokens en `localStorage` es sencillo pero menos seguro que cookies httpOnly.
 * - Para producción, considerar usar refresh tokens y cookies httpOnly para mitigar XSS/CSRF.
 */

const AuthContext = createContext(null);

/**
 * AuthProvider
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Elementos React envueltos por el provider
 * @returns {JSX.Element}
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Restaurar usuario desde localStorage al cargar la app
  useEffect(() => {
    try {
      const stored = localStorage.getItem('usuario');
      if (stored) setUser(JSON.parse(stored));
    } catch (e) {
      // Ignorar errores de parseo
    }
  }, []);

  const value = { user, setUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth
 *
 * Hook para consumir el contexto de autenticación.
 *
 * @returns {{ user: object|null, setUser: function }}
 */
export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
