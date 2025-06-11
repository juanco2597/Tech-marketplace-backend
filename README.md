# Backend del Marketplace

Este repositorio contiene el backend de la aplicación Marketplace, desarrollado con Nest.js y TypeScript. Proporciona la API RESTful para la gestión de usuarios, productos, autenticación JWT y otras funcionalidades de negocio.

## Tecnologías Utilizadas

* **Nest.js:** Framework de Node.js progresivo para construir aplicaciones del lado del servidor escalables y eficientes.
* **TypeScript:** Lenguaje de programación que añade tipado estático a JavaScript.
* **Firebase Admin SDK:** Para interactuar con la base de datos de Firebase.
* **Cloudinary SDK:** Para la gestión y almacenamiento de imágenes.
* **Passport.js & JWT:** Para la autenticación y autorización basada en tokens.
* **Principios SOLID:** Aplicados en el diseño del código.

## Requisitos Previos

Asegúrate de tener instalados los siguientes programas en tu sistema:

* [Node.js](https://nodejs.org/en/) (versión LTS recomendada, ej. 18.x o 20.x)
* [npm](https://www.npmjs.com/) (viene con Node.js) o [Yarn](https://yarnpkg.com/)
* [Git](https://git-scm.com/)

Además, necesitarás cuentas y credenciales para:

* **Firebase:** Para la base de datos en tiempo real.
* **Cloudinary:** Para el almacenamiento de imágenes de productos.

## Configuración del Entorno

Sigue estos pasos para configurar y ejecutar el backend localmente:

1.  **Clonar el Repositorio:**
    ```bash
    git clone https://github.com/juanco2597/Tech-marketplace-backend.git
    cd backend
    ```

2.  **Instalar Dependencias:**
    ```bash
    npm install
    # o si usas yarn
    yarn install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo llamado `.env` en la raíz de este directorio y añade las siguientes variables con tus credenciales:

    ```env
    # JWT Secret Key (cambia 'your_jwt_secret_key' por una cadena aleatoria fuerte)
    JWT_SECRET=your_jwt_secret_key
    JWT_EXPIRATION_TIME=1h # Tiempo de expiración del token JWT (ej. 1 hora)

    # Firebase Configuration (estas credenciales se usan con el Firebase Admin SDK)
    FIREBASE_TYPE=service_account
    FIREBASE_PROJECT_ID=your_firebase_project_id
    FIREBASE_PRIVATE_KEY_ID=your_private_key_id
    FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_FIREBASE_PRIVATE_KEY\n-----END PRIVATE KEY-----\n" # Asegúrate de que la clave privada esté entre comillas y con saltos de línea escapados
    FIREBASE_CLIENT_EMAIL=your_firebase_client_email
    FIREBASE_CLIENT_ID=your_firebase_client_id
    FIREBASE_AUTH_URI=[https://accounts.google.com/o/oauth2/auth](https://accounts.google.com/o/oauth2/auth)
    FIREBASE_TOKEN_URI=[https://oauth2.googleapis.com/token](https://oauth2.googleapis.com/token)
    FIREBASE_AUTH_PROVIDER_X509_CERT_URL=[https://www.googleapis.com/oauth2/v1/certs](https://www.googleapis.com/oauth2/v1/certs)
    FIREBASE_CLIENT_X509_CERT_URL=your_firebase_client_x509_cert_url

    # Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ```
    * **Nota sobre `FIREBASE_PRIVATE_KEY`**: Cuando obtengas el archivo JSON de tu cuenta de servicio de Firebase, la `private_key` contiene saltos de línea (`\n`). Asegúrate de reemplazar esos saltos de línea con `\n` en tu archivo `.env` y de encerrar toda la clave entre comillas dobles.

4.  **Ejecutar la Aplicación:**
    ```bash
    npm run start:dev
    # o si usas yarn
    yarn start:dev
    ```
    El backend se ejecutará en `http://localhost:3000` (o el puerto que configures en `main.ts`). La API estará disponible en `http://localhost:3000/api`.

## Estructura de Directorios

/src

/auth           Módulo de autenticación (estrategias JWT, guards, etc.)
/users          Módulo de usuarios (controlador, servicio, esquema/modelo)
/products       Módulo de productos (controlador, servicio, esquema/modelo)
/common         Módulos compartidos (filtros, pipes, interceptors)
main.ts         Punto de entrada de la aplicación
app.module.ts   Módulo raíz

## Endpoints de la API

Para una descripción detallada de los endpoints de la API, sus métodos, parámetros y respuestas, consulta la [Documentación Técnica](https://docs.google.com/document/d/1IN19QcX_EbYMHlFkxaNuU9dzhA7d1tpq/edit?usp=sharing&ouid=109566389520819504234&rtpof=true&sd=true).

## Pruebas Unitarias

Puedes ejecutar las pruebas unitarias con el siguiente comando:

```bash
npm run test
# o si usas yarn
yarn test