# Database Documentation - PaginaRegistroSS

# En el siguiente documento se presentan las instrucciones para la integracion de la Base de Datos PostgreSQL al proyecto.

En esta misma carpeta se encuentra un archivo para la Migracion/Exportacion con toda la estructura de la base de datos que se utiliza con este proyecto, el archivo: `esquema.sql`. contiene las tablas, relaciones y restricciones necesarias para el correcto funcionamiento del sistema de PaginaRegistroSS. 

## Requisitos Previos
Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:
- PostgreSQL (versión 12 o superior)
- pgAdmin (opcional, para la gestión visual de la base de datos)
- Acceso a la terminal o línea de comandos
- Credenciales de acceso a la base de datos (usuario, contraseña, host, puerto)

## Instrucciones de Configuración
1. **Instalación de PostgreSQL**:
   - Descarga e instala PostgreSQL desde [https://www.postgresql.org/download/](https://www.postgresql.org/download/).
   - Sigue las instrucciones específicas para tu sistema operativo.

2. **Creación de la Base de Datos**:
   - Abre la terminal o línea de comandos.
   - Accede a PostgreSQL con el siguiente comando:
     ```
     psql -U tu_usuario
     ```
   - Crea una nueva base de datos para el proyecto:
     ```sql
     CREATE DATABASE pagina_registro_ss; "o el nombre que desees"
     ```
   - Sal de PostgreSQL:
     ```
     \q
     ```
   - Navega hasta el directorio donde se encuentra el archivo `esquema.sql`.
   - Ejecuta el siguiente comando para crear las tablas y relaciones en la base de datos:
     ```bash
     psql -U tu_usuario -d pagina_registro_ss -f esquema.sql
     ```
   - Reemplaza `tu_usuario` con tu nombre de usuario de PostgreSQL.
   - indica la contraseña de tu usuario cuando se te solicite.

3. **Verificación de la Estructura**:
    - Abre pgAdmin o vuelve a la terminal.
    - Conéctate a la base de datos `pagina_registro_ss`.
    - Verifica que todas las tablas y relaciones se hayan creado correctamente.

4. **Configuración de la Conexión en el Proyecto**:

   - Abre el archivo de configuración de la base de datos en tu proyecto (por ejemplo, `config/database.js` o similar).
   - Actualiza los parámetros de conexión con los detalles de tu base de datos:
     ```javascript
     const dbConfig = {
       host: 'localhost',
       port: 5432,
       database: 'pagina_registro_ss',
       user: 'tu_usuario',
       password: 'tu_contraseña'
     };
     ```
   - Guarda los cambios.
   - Reinicia el servidor backend para que los cambios en la configuración de la base de datos tengan efecto.
   - Asegúrate de que esta configuracion este protegida y no se suba a repositorios publicos, ya que contiene informacion sensible como usuario y contraseña de la base de datos. Utiliza variables de entorno o archivos de configuracion ignorados por git para este proposito (archivo `.env`, `.gitignore`).

5. **Prueba de Conexión**:
   - Ejecuta tu aplicación para asegurarte de que se conecta correctamente a la base de datos.
   - Verifica que las operaciones CRUD (Crear, Leer, Actualizar, Eliminar) funcionen según lo esperado.

6. **Mantenimiento y Backup**:
   - Realiza copias de seguridad periódicas de la base de datos utilizando pgAdmin o comandos de PostgreSQL.
   - Mantén actualizado PostgreSQL para asegurar la seguridad y el rendimiento.

7. **Documentación Adicional**:
   - Consulta la documentación oficial de PostgreSQL para obtener más información sobre la administración y optimización de bases de datos: [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/).

Con estos pasos, deberías tener la base de datos PostgreSQL configurada y lista para su uso en el proyecto PaginaRegistroSS. Si encuentras algún problema durante el proceso, revisa los mensajes de error y consulta la documentación oficial o busca ayuda en foros especializados.

¡Buena suerte con tu proyecto!

# Autor: Equipo de Desarrollo PaginaRegistroSS