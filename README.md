# PaginaRegistroSS
Una pagina web desarrollada para el resgitro del personal administrativo, desarrollada con react para el frontend, node.js y Express para el Backend y PostgreSQL para las bases de datos, además de diversas herramientas para el desarrollo y despliegue del proyecto.

## Tecnologías Utilizadas
- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Base de Datos: PostgreSQL
- Herramientas de Desarrollo: Visual Studio Code, Postman


## Setup Instrucciones para configurar y ejecutar el proyecto localmente. Requiere tener Node.js y PostgreSQL instalados en tu máquina. Recomendado usar nvm para manejar las versiones de node.js

1. Clona el repositorio:
   ```bash
   git clone "Nombre del repositorio o link"

   cd PaginaRegistroSS
   ```

2. Frontend:
   - `cd frontend` --navega a la carpeta del frontend, esto se hace desde la raíz del proyecto

   - `npm install` --instala las dependencias necesarias, asegurate de tener node.js instalado, si no lo tienes puedes descargarlo desde [aquí](https://nodejs.org/), también se recomienda usar un manejador de versiones como nvm, para instalar la versión recomendada (v16.20.0), puedes usar el siguiente comando: `nvm install 16.20.0`, luego usar `nvm use 16.20.0` para usar esa versión, después de esto puedes proceder a instalar las dependencias con `npm install`, luego de esto puedes proceder a iniciar el servidor de desarrollo con:

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

## Contribuciones
Las contribuciones son bienvenidas. Por favor, abre un issue o envía un pull request para discutir los cambios que deseas realizar.

## Licencia
Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.

## Contacto
Para cualquier consulta o sugerencia, puedes contactarme en: [https://github.com/xllTOMYllx].
