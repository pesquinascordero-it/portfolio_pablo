## 1. Descripción

Portfolio web personal: frontend en React con TypeScript, Vite y React Router, mostrando proyectos con búsqueda y filtros. Backend con Node.js y Express que maneja un formulario de contacto con validación, rate limiting y protección contra inyección de headers SMTP. Desplegado en un VPS Linux con Caddy como proxy inverso y systemd para gestionar el servicio de la API.

### 1.1 Objetivo

Demostrar habilidades full stack: arquitectura limpia en frontend (lazy loading de contenido Markdown, tabla de contenidos interactiva), API robusta (validación estricta, honeypot, rate limiting sin estado) y despliegue manual pero reproducible en producción.

## 2. Funcionalidades

- **Home**: Hero con resumen profesional
- **CV**: Descargable en PDF
- **Proyectos**: Listado con búsqueda en tiempo real y filtros por herramientas (React, Python, Java…)
- **Detalle de proyecto**: Markdown renderizado con tabla de contenidos (TOC) lateral, scrollspy y navegación anterior/siguiente
- **Contacto**: Formulario con envío de email a través de la API
- **404**: Página de error con enlace de vuelta

## 3. API del formulario de contacto

El backend valida en el servidor y protege contra abusos:

**Validación:**

```javascript
// De validate.js: bloquea inyección de headers SMTP
const hasLineBreaks = (value) => /[\r\n]/.test(value);
if (hasLineBreaks(name) || hasLineBreaks(subject)) {
  return { valid: false, errors: { ... } };
}
// También: longitudes (name 2-100, subject 3-150, message 10-5000, email max 254) y formato de email
```

Rechaza inyecciones como `Bcc: spam@example.com` en el asunto.

**Honeypot**: Campo oculto `website`. Si está relleno, responde con éxito pero no envía nada (atrapa bots).

**Rate limit**: 5 envíos cada 15 minutos por IP. `express-rate-limit` con cabeceras estándar draft-7.

**Seguridad HTTP**:
- JSON body limitado a 10 KB
- Errores SMTP ocultos al cliente (evita exposición de credenciales)
- `x-powered-by` desactivado
- `trust proxy` para leer la IP real detrás de Caddy

**Endpoint**: `POST /api/contact`. Validación fallida → 400. Rate limit → 429. Fallo SMTP → 500.

**Tests** (7 escenarios): Node.js nativo (`node:test`). Cubre envío válido, validación fallida, inyección de headers, honeypot, error SMTP oculto, JSON malformado, rate limit.

## 4. Despliegue

**Arquitectura:**

```
Navegador → Caddy (pabloesquinas.es:443)
            ├─ Estáticos (index.html, .js, .css)
            ├─ /api/* → 127.0.0.1:3000 (Express)
            └─ Rutas → index.html (SPA)
```

Caddy maneja HTTPS (Let's Encrypt), redirecciona HTTP → HTTPS y hace reverse proxy de `/api`.

**Pasos de `deploy.sh`** (manual, ejecutado desde local al servidor):

1. `git pull --ff-only origin main` — actualiza sin merges automáticos
2. `npm ci` — instala dependencias exactas del frontend
3. `npm run build` — compila TypeScript + empaqueta con Vite
4. `rsync --delete dist/ /var/www/html` — despliega estáticos
5. `npm ci --omit=dev` de la API — instala solo dependencias de producción
6. `systemctl restart portfolio-api` — reinicia el servicio

El servicio systemd `portfolio-api` carga el `.env` al arrancar y se reinicia automáticamente en caso de fallo.

## 5. Aprendizajes

- **Markdown en frontend**: Lazy loading con `react-markdown` reduce el tamaño inicial y acelera la navegación sin cargar contenido innecesario.
- **Validación en servidor**: Nunca confiar en el cliente. Detectar inyección de headers antes de enviar correos es crítico.
- **Scroll spy preciso**: `getBoundingClientRect()` con scroll listener detecta mejor qué heading está visible que `IntersectionObserver`, especialmente en TOC.
- **Rate limit sin estado**: Basado solo en IP (sin sesiones), simple de implementar y eficaz contra bots en endpoints públicos.
- **Honeypot silencioso**: Responder "OK" a bots sin enviar nada es más efectivo que rechazar, porque no revela si el sitio está activo.

## 6. Mejoras futuras

- Automatizar el despliegue con GitHub Actions (eliminar manualidad, garantizar consistencia).
- Tests del frontend (Vitest + Testing Library) para validar componentes en diferentes anchos.
- Despliegue sin cortes (blue-green deployment) para actualizar la API sin interrumpir visitantes.
- Monitoreo y métricas (Prometheus + Grafana) para alertar si la API cae o las peticiones se ralentizan.
- CDN para estáticos (mejora latencia global, especialmente fuera de Europa).
- Rate limit por usuario autenticado (permitir más envíos a usuarios que se registren, si se agrega autenticación).
