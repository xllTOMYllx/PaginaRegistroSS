const nodemailer = require('nodemailer');
require('dotenv').config();

// Configurar el transporter de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',  // Puedes cambiarlo según el servicio que uses
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Función para enviar correo de bienvenida
const sendWelcomeEmail = async (to, nombre) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: to,
            subject: 'Bienvenido al Sistema de Registro SS',
            html: `
                <h1>¡Bienvenido ${nombre}!</h1>
                <p>Tu cuenta ha sido creada exitosamente en el Sistema de Registro SS.</p>
                <p>Ya puedes acceder al sistema con tus credenciales.</p>
                <br>
                <p>Saludos cordiales,</p>
                <p>Equipo de Soporte SS</p>
            `
        });
        return { success: true };
    } catch (error) {
        console.error('Error al enviar correo de bienvenida:', error);
        return { success: false, error: error.message };
    }
};

// Función para enviar notificación de cambio de contraseña
const sendPasswordChangeEmail = async (to, nombre) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: to,
            subject: 'Cambio de Contraseña - Sistema SS',
            html: `
                <h1>Cambio de Contraseña</h1>
                <p>Hola ${nombre},</p>
                <p>Tu contraseña ha sido cambiada exitosamente.</p>
                <p>Si no realizaste este cambio, por favor contacta al administrador inmediatamente.</p>
                <br>
                <p>Saludos cordiales,</p>
                <p>Equipo de Soporte SS</p>
            `
        });
        return { success: true };
    } catch (error) {
        console.error('Error al enviar correo de cambio de contraseña:', error);
        return { success: false, error: error.message };
    }
};

// Función para enviar correo de recuperación de contraseña
const sendPasswordResetEmail = async (to, nombre, tempPassword) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: to,
            subject: 'Recuperación de Contraseña - Sistema SS',
            html: `
                <h1>Recuperación de Contraseña</h1>
                <p>Hola ${nombre},</p>
                <p>Se ha generado una contraseña temporal para tu cuenta:</p>
                <h2 style="background-color: #f0f0f0; padding: 10px; text-align: center;">${tempPassword}</h2>
                <p>Por favor, cambia esta contraseña temporal tan pronto como inicies sesión.</p>
                <p>Si no solicitaste este cambio, contacta al administrador inmediatamente.</p>
                <br>
                <p>Saludos cordiales,</p>
                <p>Equipo de Soporte SS</p>
            `
        });
        return { success: true };
    } catch (error) {
        console.error('Error al enviar correo de recuperación:', error);
        return { success: false, error: error.message };
    }
};

// Función para notificar cuando se sube un documento
const sendDocumentUploadedEmail = async (to, nombre, tipoDocumento) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: to,
            subject: 'Documento Subido Exitosamente - Sistema SS',
            html: `
                <h1>Documento Subido</h1>
                <p>Hola ${nombre},</p>
                <p>Tu documento "${tipoDocumento}" ha sido subido exitosamente al sistema.</p>
                <p>Será revisado por el personal administrativo correspondiente.</p>
                <br>
                <p>Saludos cordiales,</p>
                <p>Equipo de Soporte SS</p>
            `
        });
        return { success: true };
    } catch (error) {
        console.error('Error al enviar notificación de documento:', error);
        return { success: false, error: error.message };
    }
};

// Función para crear un transportador de correo específico (soporta host/port/secure)
const createTransporter = (options) => {
    // options: { host, port, secure, user, pass }
    const transportOptions = {
        host: options.host || 'smtp.gmail.com',
        port: options.port || 587,
        secure: options.secure || false,
        auth: {
            user: options.user,
            pass: options.pass
        },
        tls: {
            rejectUnauthorized: false
        }
    };

    return nodemailer.createTransport(transportOptions);
};

// Función para notificar cuando un documento es cotejado
// Firma: (to, nombre, tipoDocumento, verificadoPor, fromEmail, fromPassword, smtpHost, smtpPort, smtpSecure)
const sendDocumentVerifiedEmail = async (to, nombre, tipoDocumento, verificadoPor, fromEmail, fromPassword) => {
    try {
        console.log('Configurando Gmail SMTP:', {
            user: fromEmail
        });

        // Usar STARTTLS en puerto 587 (secure: false) para compatibilidad con Gmail
        const transportConfig = {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // STARTTLS
            requireTLS: true,
            auth: {
                user: fromEmail,
                pass: fromPassword
            },
            tls: {
                // Aceptar certificados autofirmados (si los hay) y forzar TLS >= 1.2
                rejectUnauthorized: false,
                minVersion: 'TLSv1.2'
            },
            debug: true
        };

        const transporter = nodemailer.createTransport(transportConfig);

        // Verificar la conexión antes de enviar
        await transporter.verify();
        console.log('Conexión SMTP verificada exitosamente');

        await transporter.sendMail({
            from: fromEmail,
            to: to,
            subject: 'Documento Verificado - Sistema SS',
            html: `
                <h1>Documento Verificado</h1>
                <p>Hola ${nombre},</p>
                <p>Tu documento "${tipoDocumento}" ha sido verificado por ${verificadoPor}.</p>
                <p>Ya puedes ver el estado actualizado en tu panel de documentos.</p>
                <br>
                <p>Saludos cordiales,</p>
                <p>${verificadoPor}</p>
                <p>Planeacion y desarrollo</p>
            `
        });
        return { success: true };
    } catch (error) {
        console.error('Error al enviar notificación de verificación:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendWelcomeEmail,
    sendPasswordChangeEmail,
    sendPasswordResetEmail,
    sendDocumentUploadedEmail,
    sendDocumentVerifiedEmail
};