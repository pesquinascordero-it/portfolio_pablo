## 1. Descripción

Portfolio web personal: frontend en React con TypeScript, Vite y React Router, mostrando proyectos con búsqueda y filtros. Backend con Node.js y Express que maneja un formulario de contacto con validación, rate limiting y protección contra inyección de cabeceras SMTP. Desplegado en un VPS Linux con Caddy como proxy inverso y systemd para gestionar el servicio de la API.

### 1.1 Objetivo

Practicar validación estricta en el servidor, prevención de ataques (inyección SMTP, honeypot), rate limiting por IP, y despliegue reproducible en un VPS usando systemd.

## 2. Funcionalidades

- **Home**: Hero con resumen profesional
- **CV**: Descargable en PDF
- **Proyectos**: Listado con búsqueda en tiempo real y filtros por herramientas (React, Python, Java…)
- **Detalle de proyecto**: Markdown renderizado con tabla de contenidos (TOC) lateral, scrollspy y navegación anterior/siguiente
- **Contacto**: Formulario con envío de email a través de la API
- **404**: Página de error con enlace de vuelta

## 3. API del formulario de contacto

El backend valida en el servidor y protege contra abusos:

*api/src/validate.js*

```javascript
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LINE_BREAK = /[\r\n]/
// ...
for (const [field, { min, max }] of Object.entries(TEXT_RULES)) {
  const value = typeof body[field] === 'string' ? body[field].trim() : ''
  data[field] = value

  if (value.length < min || value.length > max) {
    errors[field] = `Debe tener entre ${min} y ${max} caracteres`
  } else if (field !== 'message' && LINE_BREAK.test(value)) {
    // Evita inyección de cabeceras SMTP a través de saltos de línea
    errors[field] = 'No puede contener saltos de línea'
  }
}
```

Detecta inyecciones como `Bcc: spam@example.com` en el asunto bloqueando saltos de línea (`\r\n`).

**Honeypot**: Campo oculto `website`. Si está relleno, responde con éxito pero no envía nada. Responder OK al bot sin enviar nada evita que sepa que ha sido detectado.

**Rate limit**: 5 envíos cada 15 minutos por IP. `express-rate-limit` con cabeceras estándar draft-7.

**Seguridad HTTP**:
- JSON body limitado a 10 KB
- Los errores de SMTP no se muestran al cliente
- `x-powered-by` desactivado
- `trust proxy` para leer la IP real detrás de Caddy

**Endpoint**: `POST /api/contact`. Validación fallida → 400. Rate limit → 429. Fallo SMTP → 500.

**Tests** (7 escenarios): Node.js nativo (`node:test`). Cubre envío válido, validación fallida, inyección de cabeceras, honeypot, error SMTP oculto, JSON malformado, rate limit.

## 4. Despliegue

**Arquitectura:**

```
Navegador → Caddy (pabloesquinas.es:443)
            ├─ Estáticos (index.html, .js, .css)
            ├─ /api/* → 127.0.0.1:3000 (Express)
            └─ Rutas → index.html (SPA)
```

Caddy maneja HTTPS (Let's Encrypt), redirecciona HTTP → HTTPS y hace reverse proxy de `/api`.

**Pasos de `deploy.sh`** (que ejecuto en el servidor):

1. `git pull --ff-only origin main` — actualiza sin merges automáticos
2. `npm ci` — instala dependencias exactas del frontend
3. `npm run build` — compila TypeScript + empaqueta con Vite
4. `rsync --delete dist/ /var/www/html` — despliega estáticos
5. `npm ci --omit=dev` de la API — instala solo dependencias de producción
6. `systemctl restart portfolio-api` — reinicia el servicio

El servicio systemd `portfolio-api` carga las variables de entorno desde un fichero fuera del repo (`EnvironmentFile`) y se reinicia automáticamente en caso de fallo.

## 5. Aprendizajes

- **Markdown en frontend**: Lazy loading con `react-markdown` reduce el tamaño inicial sin cargar contenido innecesario.
- **Validación en servidor**: Nunca confiar en el cliente. Detectar inyección de cabeceras antes de enviar correos es crítico.
- **Scroll spy**: En mi caso, `getBoundingClientRect()` con un listener de scroll funcionó mejor que IntersectionObserver para resaltar el apartado activo.
- **Rate limit en memoria**: `express-rate-limit` guarda los contadores en memoria: es sencillo, pero se reinicia al reiniciar el servicio y no se comparte entre instancias.
- **Honeypot silencioso**: Responder OK al bot sin enviar nada evita que sepa que ha sido detectado.

## 6. Mejoras futuras

- Automatizar el despliegue con GitHub Actions (eliminar manualidad, garantizar consistencia).
- Tests del frontend con Vitest y Testing Library.
- Despliegue sin cortes para actualizar la API sin interrumpir visitantes.
