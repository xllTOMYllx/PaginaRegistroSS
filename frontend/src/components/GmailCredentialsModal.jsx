import React, { useState } from 'react';

const GmailCredentialsModal = ({ isOpen, onClose, onSubmit, defaultEmail }) => {
  const [emailPassword, setEmailPassword] = useState('');
  const [fromEmail, setFromEmail] = useState(defaultEmail || '');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpSecure, setSmtpSecure] = useState(true);

  const validateEmail = (email) => {
    // Validación básica de formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!emailPassword || emailPassword.trim() === '') {
      alert('Por favor, ingresa tu contraseña SMTP (contraseña de aplicación o contraseña SMTP)');
      return;
    }
    if (!fromEmail || !validateEmail(fromEmail)) {
      alert('Por favor, ingresa una dirección de correo electrónico válida');
      return;
    }

    // Validar configuración SMTP
    if (!smtpHost || !smtpPort) {
      alert('La configuración SMTP es inválida');
      return;
    }

    const payload = {
      emailPassword: emailPassword.trim(),
      fromEmail: fromEmail.trim(),
      smtpHost: smtpHost.trim(),
      smtpPort: Number(smtpPort),
      smtpSecure: Boolean(smtpSecure)
    };
    console.log('Enviando credenciales SMTP', { fromEmail: payload.fromEmail, smtpHost: payload.smtpHost });
    onSubmit(payload);
    setEmailPassword('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Credenciales de Gmail</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="fromEmail" className="form-label">Correo remitente</label>
                <input
                  type="email"
                  className="form-control"
                  id="fromEmail"
                  placeholder="tu_correo@dominio (ej. usuario@ssaver.gob.mx)"
                  value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                />
                <div className="form-text">
                    Se usará este correo como remitente del mensaje. Para cuentas Gmail:
                    <ul className="mt-1 mb-0">
                      <li>Debes usar tu correo @gmail.com</li>
                      <li>Activa la verificación en dos pasos en tu cuenta de Google</li>
                      <li>Desde Seguridad → Contraseñas de aplicación genera una nueva contraseña</li>
                      <li>Copia esa contraseña de aplicación aquí (no tu contraseña normal)</li>
                    </ul>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="smtpHost" className="form-label">SMTP Host</label>
                <input
                  type="text"
                  className="form-control"
                  id="smtpHost"
                  value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                />
                  <div className="form-text">Host SMTP (por defecto: smtp.gmail.com)</div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col">
                  <label htmlFor="smtpPort" className="form-label">Puerto</label>
                  <input
                    type="number"
                    className="form-control"
                    id="smtpPort"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                  />
                </div>
                <div className="col">
                  <label htmlFor="smtpSecure" className="form-label">Usar SSL</label>
                  <select className="form-select" id="smtpSecure" value={smtpSecure ? '1' : '0'} onChange={(e) => setSmtpSecure(e.target.value === '1')}>
                    <option value="0">No (STARTTLS)</option>
                    <option value="1">Sí (SSL/TLS)</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="emailPassword" className="form-label">Contraseña SMTP</label>
                <input
                  type="password"
                  className="form-control"
                  id="emailPassword"
                  placeholder="Ingresa tu contraseña SMTP o contraseña de aplicación"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                />
                <div className="form-text">
                  <strong>Instrucciones de seguridad:</strong>
                  <ul className="mt-1 mb-0">
                      <li>Por seguridad, necesitas usar una "Contraseña de aplicación" de Google</li>
                      <li>1. Activa la verificación en dos pasos en tu cuenta Google</li>
                      <li>2. Ve a Seguridad → Contraseñas de aplicación y genera una nueva</li>
                      <li>3. Copia y pega esa contraseña aquí (no tu contraseña normal)</li>
                  </ul>
                </div>
              </div>
              <div className="modal-footer p-0 pt-3">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={onClose}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Confirmar y Cotejar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GmailCredentialsModal;