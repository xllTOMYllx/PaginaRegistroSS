import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NotificationBell.css';

function NotificationBell({ userRole }) {
  const [contador, setContador] = useState(0);
  const [notificaciones, setNotificaciones] = useState([]);
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  // Obtener contador de no leídas
  const cargarContador = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/notificaciones/no-leidas/contador', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContador(response.data.total || 0);
    } catch (error) {
      console.error('Error al cargar contador:', error);
    }
  };

  // Obtener lista de notificaciones
  const cargarNotificaciones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/notificaciones', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotificaciones(response.data || []);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    }
  };

  // Marcar como leída
  const marcarLeida = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/notificaciones/${id}/leer`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      cargarContador();
      cargarNotificaciones();
    } catch (error) {
      console.error('Error al marcar notificación:', error);
    }
  };

  // Marcar todas como leídas
  const marcarTodasLeidas = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        'http://localhost:5000/api/notificaciones/leer-todas',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      cargarContador();
      cargarNotificaciones();
    } catch (error) {
      console.error('Error al marcar todas:', error);
    }
  };

  // Eliminar una notificación
  const eliminarNotificacion = async (id, event) => {
    event.stopPropagation(); // Evitar que se active el click de navegación
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/notificaciones/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      cargarContador();
      cargarNotificaciones();
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  };

  // Eliminar todas las notificaciones
  const eliminarTodas = async () => {
    if (!window.confirm('¿Estás seguro de eliminar todas las notificaciones?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        'http://localhost:5000/api/notificaciones',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      cargarContador();
      cargarNotificaciones();
    } catch (error) {
      console.error('Error al eliminar todas:', error);
    }
  };

  // Navegar al usuario para cotejar documentos
  const irAUsuario = (id_personal) => {
    setMostrarPanel(false);
    navigate(`/usuario/${id_personal}`);
  };

  // Polling cada 30 segundos
  useEffect(() => {
    cargarContador();
    const interval = setInterval(cargarContador, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cargar notificaciones al abrir panel
  useEffect(() => {
    if (mostrarPanel) {
      cargarNotificaciones();
    }
  }, [mostrarPanel]);

  // Cerrar panel al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setMostrarPanel(false);
      }
    };

    if (mostrarPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mostrarPanel]);

  // Formatear fecha
  const formatearFecha = (fecha) => {
    const ahora = new Date();
    const fechaNotif = new Date(fecha);
    const diferencia = ahora - fechaNotif;
    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(diferencia / 3600000);
    const dias = Math.floor(diferencia / 86400000);

    if (minutos < 1) return 'Hace un momento';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias}d`;
    return fechaNotif.toLocaleDateString('es-MX');
  };

  // Solo mostrar para roles 2, 3, 4
  if (![2, 3, 4].includes(userRole)) {
    return null;
  }

  return (
    <div className="notification-bell-container" ref={panelRef}>
      <button
        className="bell-button"
        onClick={() => setMostrarPanel(!mostrarPanel)}
        title="Notificaciones"
      >
        <FaBell size={20} />
        {contador > 0 && <span className="badge-contador">{contador > 99 ? '99+' : contador}</span>}
      </button>

      {mostrarPanel && (
        <div className="notification-panel">
          <div className="panel-header">
            <h6>Notificaciones</h6>
            <div className="header-actions">
              {contador > 0 && (
                <button className="btn-marcar-todas" onClick={marcarTodasLeidas} title="Marcar todas como leídas">
                  ✓ Marcar todas
                </button>
              )}
              {notificaciones.length > 0 && (
                <button className="btn-eliminar-todas" onClick={eliminarTodas} title="Eliminar todas">
                  <FaTrash size={12} /> Eliminar
                </button>
              )}
            </div>
          </div>

          <div className="panel-body">
            {notificaciones.length === 0 ? (
              <p className="no-notifications">No hay notificaciones</p>
            ) : (
              notificaciones.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${!notif.leido ? 'no-leida' : ''}`}
                  onClick={() => irAUsuario(notif.id_personal)}
                >
                  <div className="notif-content">
                    <div className="notif-mensaje">{notif.mensaje}</div>
                    <div className="notif-fecha">{formatearFecha(notif.fecha)}</div>
                  </div>
                  <button 
                    className="btn-eliminar-notif"
                    onClick={(e) => eliminarNotificacion(notif.id, e)}
                    title="Eliminar notificación"
                  >
                    <FaTrash size={12} />
                  </button>
                  {!notif.leido && <div className="notif-dot"></div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
