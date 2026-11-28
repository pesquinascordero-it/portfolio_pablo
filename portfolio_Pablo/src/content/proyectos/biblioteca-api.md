## 1. Qué es

API REST sin frameworks para gestionar una biblioteca digital. Es un proyecto educativo para entender cómo funcionan HTTP realmente (métodos, rutas, códigos de estado, cabeceras, CORS) sin que un framework lo haga por mí. Después lo desplegué en un servidor Linux propio.

**Stack**: Node.js (módulo http nativo), HTML/CSS/JavaScript, Caddy, systemd, Bash.

### 1.1 Por qué lo hice

Programé el backend desde cero para aprender HTTP por dentro, incluida la validación de datos, gestión de errores y CORS. El frontend es una página con una "estantería" de libros que se puede filtrar o editar. Se puede usar en modo demo sin servidor, o conectada a la API real.

## 2. Funcionalidades

- CRUD completo: crear, listar, editar, modificar parcialmente y borrar libros.
- Filtros por disponibilidad y por género.
- Búsqueda por título o autor.
- Ordenación por título, autor o año, ascendente o descendente.
- Paginación con número de página y libros por página.
- Validación de datos: título y autor obligatorios, año entero que no sea futuro.
- CORS configurado, incluidas las peticiones preflight.

Los parámetros de `GET /books` se pueden combinar: `?genre=novela&available=true&sort=year&page=1&limit=5`.

## 3. Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/books` | Lista libros con filtros opcionales (disponibilidad, género, búsqueda, ordenación, paginación) |
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

El deploy es manual: cada vez que hago push a GitHub, ejecuto en el servidor:

```bash
bash /root/biblioteca-api/deploy.sh
```

Este script automatiza: (1) baja los cambios (`git pull`), (2) copia el frontend a Caddy, (3) reinicia el servicio de la API, (4) valida que responda con `curl`.

```bash
# deploy.sh - Fragmento de validación
# Tomado de deploy.sh líneas 25-31
curl -s http://127.0.0.1:3001/books > /dev/null && \
  echo "✓ API funcionando" || \
  echo "✗ Error en la API"
```

## 5. Qué aprendí

- Cómo viaja una petición HTTP: método, ruta, parámetros, cabeceras, cuerpo.
- Los códigos de estado correctos para cada situación (200, 201, 204, 400, 404).
- Leer una petición en partes y convertir JSON con `JSON.parse`.
- CORS: por qué el navegador envía `OPTIONS` antes de `POST`, y cómo responder.
- Validar datos y proteger el servidor con `try`/`catch` básico.
- Filtrar, ordenar y paginar una lista con métodos de arrays.
- Desplegar en Linux: SSH, variables de entorno, systemd y Caddy como proxy inverso HTTPS.

## 6. Próximos pasos

- Guardar datos en una base de datos (SQLite o PostgreSQL) en lugar de memoria.
- Separar el código en varios archivos (rutas, validación, modelos).
- Añadir tests automáticos de los endpoints.
- Automatizar el despliegue con GitHub Actions al hacer `push`.
