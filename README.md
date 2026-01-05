# PaginaRegistroSS
Una pagina web desarrollada para el resgitro del personal administrativo, desarrollada con react para el frontend, node.js y Express para el Backend y PostgreSQL para las bases de datos, además de diversas herramientas para el desarrollo.

## Tecnologías Utilizadas
- Frontend: React, Vite, Bootstrap
- Backend: Node.js, Express
- Base de Datos: PostgreSQL
- Herramientas de Desarrollo: Visual Studio Code para la parte del codigo, Postman para las pruebas de API, pgAdmin para la gestión de la base de datos PostgreSQL.
- Control de Versiones: Git y GitHub
- Otras Librerías: Axios para las solicitudes HTTP, dotenv para la gestión de variables de entorno, bcrypt para el hashing de contraseñas, jsonwebtoken para la autenticación basada en tokens.
- Estructura del Proyecto:
  - `/frontend`: Contiene el código fuente del frontend desarrollado con React y Vite.
  - `/backend`: Contiene el código fuente del backend desarrollado con Node.js y Express.
  - `/Database`: Contiene scripts y archivos relacionados con la configuración de la base de datos PostgreSQL.
  - `README.md`: Documentación del proyecto.

## Setup Instrucciones para configurar y ejecutar el proyecto localmente. Requiere tener Node.js y PostgreSQL instalados en tu máquina. Recomendado usar nvm para manejar las versiones de node.js

1. Clona el repositorio:
   ```bash
   git clone "Nombre del repositorio o link"

   cd PaginaRegistroSS
   ```

2. Frontend:
   - `cd frontend` --navega a la carpeta del frontend, esto se hace desde la raíz del proyecto

   - `npm install` --instala las dependencias necesarias, asegurate de tener node.js instalado, si no lo tienes puedes descargarlo desde [aquí](https://nodejs.org/), también se recomienda usar un manejador de versiones como nvm, para instalar la versión recomendada (v16.20.0), puedes usar el siguiente comando: `nvm install 16.20.0`, luego usar `nvm use 16.20.0` para usar esa versión, después de esto puedes proceder a instalar las dependencias con `npm install`, luego de esto puedes proceder a iniciar el servidor de desarrollo con:

   - solo con el comando `npm install` se descargaran todas las dependencias necesarias para el proyecto. Se recomienda en caso de que salte un error de una dependencia faltante usar el siguiente comando referente al uso de una libreria especifica para la generacion de reportes mediante pdf: `npm install jspdf jspdf-autotable --save`.

   - `npm run dev` --inicia el servidor de desarrollo, asegurate de tener el puerto 5173 libre o cambia el puerto en la configuración si es necesario.

3. Backend:
   - `cd backend` --navega a la carpeta del backend, esto se hace desde la raíz del proyecto, se puede repetir el proceso de instalación y ejecución similar al frontend.

   - `npm install` --instala las dependencias necesarias, misma recomendación sobre node.js y nvm aplica aquí.

   - `npm run dev` --inicia el servidor de desarrollo, asegurate de tener el puerto 3000 libre o cambia el puerto en la configuración si es necesario.

4. Database: 
   - 'PostgreSQL'

   - Sigue las instrucciones en la carpeta `Database` para configurar la base de datos PostgreSQL, incluyendo la creación de la base de datos, la importación del esquema y la configuración de la conexión en el proyecto.  

## Uso
- Accede a la aplicación web a través de `http://localhost:5173` para el frontend.
- El backend estará disponible en `http://localhost:3000`.

## Despliegue a producción 
- Para desplegar la aplicación en un entorno de producción, asegúrate de configurar las variables de entorno adecuadamente y utilizar un servidor web como Nginx o Apache para servir el frontend. El backend puede ser desplegado en servicios como Heroku, AWS, o cualquier otro proveedor de hosting que soporte Node.js.
- Considera usar herramientas como PM2 para gestionar el proceso del servidor Node.js en producción.
- Asegúrate de optimizar el frontend para producción utilizando `npm run build` en la carpeta del frontend, lo que generará una versión optimizada de la aplicación en la carpeta `dist`.
- Configura correctamente las políticas de seguridad, como CORS, y asegúrate de que la base de datos esté protegida y accesible solo desde el backend.
- Implementa HTTPS para asegurar la comunicación entre el cliente y el servidor.
- configura adecuadamente las variables de entorno en el entorno de producción para asegurar que la aplicación funcione correctamente.
- Monitorea el rendimiento y la disponibilidad de la aplicación utilizando herramientas como New Relic, Datadog, o similares.
- Realiza copias de seguridad regulares de la base de datos para prevenir la pérdida de datos.
- Considera implementar un sistema de logging para registrar errores y eventos importantes en el backend.

## Manual de Usuario
- Adjunto al proyecto se encuentra un manual de usuario en formato PDF que detalla cómo utilizar las diferentes funcionalidades de la aplicación.
- El manual incluye instrucciones paso a paso, capturas de pantalla y consejos para aprovechar al máximo la aplicación.
- Puedes encontrar el manual en la carpeta `docs` del repositorio.

## Generacion de reportes
- La aplicación incluye una funcionalidad para generar reportes en formato PDF, utilizando la librería jsPDF, en los cuales se generan responsivas acordes a la generacion de contraseñas y el usuario por parte de un supervisor o administrador del sistema, permitiendo así llevar un control adecuado de los accesos y actividades dentro de la plataforma.
- Los reportes incluyen detalles como el nombre del usuario, la contraseña generada, la fecha y hora de creación, y cualquier otra información relevante.
- Esta funcionalidad es especialmente útil para auditorías y revisiones de seguridad, ya que proporciona un registro claro y accesible de las acciones realizadas en el sistema.
- Se recomienda ajustar el formato y contenido de los reportes según las necesidades específicas del proyecto o la organización, para asegurar que la información presentada sea clara y útil para los usuarios finales.
- La responsiva se debe entregar al usuario final para que este tenga constancia de la contraseña generada y pueda acceder al sistema sin inconvenientes.
- El sistema tambien puede generar un reporte automaticamente cuando el usuario olvida su contraseña, generando una nueva y entregandole una responsiva con la nueva contraseña.

## Contribuciones
- Las contribuciones son bienvenidas. Por favor, abre un issue o envía un pull request para discutir los cambios que deseas realizar.
- Tambien se puede descargar el repositorio y trabajar localmente. Para posteriormente subir el proyecto a un repositorio nuevo y trabajar desde ahi. Sin la necesidad de hacer un fork del proyecto original y evitar asi conflictos con el repositorio original.
- Se recomienda lo segundo de preferencia aunque el proyecto este abierto a contribuciones mediante fork y pull request.

## Licencia
Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.

## Contacto
Para cualquier consulta o sugerencia, puedes contactarme en: [https://github.com/xllTOMYllx].
