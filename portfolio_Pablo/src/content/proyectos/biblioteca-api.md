## 1. Descripción

API REST en Node.js sin frameworks para gestionar los libros de una biblioteca, con una página web que la consume. Tiene un modo demo que funciona sin servidor y también puede conectarse a la API real. Está desplegada en mi servidor Linux propio.

### 1.1 Objetivo

Quería entender lo que un framework hace por mí: recibir peticiones HTTP, responder con códigos y cabeceras correctas, validar datos, gestionar errores y configurar CORS. Por eso lo programé desde cero.

## 2. Funcionalidades

- CRUD completo: crear, listar, editar, modificar parcialmente y borrar libros.
- Filtros por disponibilidad y por género.
- Búsqueda por título o autor.
- Ordenación por título, autor o año, ascendente o descendente.
- Paginación con número de página y libros por página.
- Validación de datos: título y autor obligatorios, año entero que no sea futuro.
- CORS configurado, incluidas las peticiones preflight.

Los parámetros de `GET /books` se pueden combinar:

```
/books?genre=novela&available=true&sort=year&page=1&limit=5
```

## 3. Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/books` | Lista libros (admite filtros, búsqueda, orden y paginación) |
| `POST` | `/books` | Crea un libro |
| `PUT` | `/books/:id` | Reemplaza un libro completo |
| `PATCH` | `/books/:id` | Modifica campos específicos |
| `DELETE` | `/books/:id` | Borra un libro |

## 4. Despliegue

La aplicación está en un VPS Linux (Debian) que también aloja mi portfolio:

```
biblioteca.pabloesquinas.es
        │
      Caddy  (HTTPS automático)
        ├── /books*  →  API de Node.js en puerto 3001 (servicio systemd)
        └── resto    →  archivos estáticos en /var/www/biblioteca
```

El despliegue es manual: cada vez que hago push a GitHub, ejecuto el script de despliegue en el servidor, que baja los cambios, copia el frontend, reinicia el servicio de la API y valida que responda.

En desarrollo local, la página se abre desde otro puerto (Live Server en 5500) y hace peticiones a `localhost:3000`, así que el navegador envía una petición preflight (OPTIONS) para preguntar qué métodos están permitidos. Si no respondo con las cabeceras CORS correctas, el navegador bloquea la petición por política de mismo origen.

Implementé CORS así:

*`backend/server.js`*

```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
// ...
if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.writeHead(204);
    res.end();
    return;
}
```

Establezco `Access-Control-Allow-Origin: *` globalmente para que todas las respuestas permitan peticiones desde cualquier origen. Para peticiones preflight (OPTIONS), respondo con 204 (sin contenido) y las cabeceras de métodos permitidos. En producción no hay preflight porque Caddy sirve el frontend y la API desde el mismo dominio (`biblioteca.pabloesquinas.es`).

## 5. Aprendizajes

- Cómo viaja una petición HTTP: método, ruta, parámetros, cabeceras, cuerpo.
- Los códigos de estado correctos para cada situación (200, 201, 204, 400, 404).
- Leer el cuerpo de una petición por partes y convertirlo con `JSON.parse`.
- CORS: cuándo envía el navegador una petición preflight (OPTIONS) y cómo responderla.
- Validar datos y proteger el servidor con `try`/`catch`.
- Filtrar, ordenar y paginar una lista con métodos de arrays.
- Desplegar en Linux: SSH, variables de entorno, systemd y Caddy como proxy inverso HTTPS.

## 6. Mejoras futuras

- Guardar datos en una base de datos (SQLite o PostgreSQL) en lugar de memoria.
- Separar el código en varios archivos (rutas, validación, modelos).
- Añadir tests automáticos de los endpoints.
- Automatizar el despliegue con GitHub Actions al hacer `push`.
- Limitar CORS a los orígenes necesarios en lugar de `*`.
