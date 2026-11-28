# Portfolio Personal

Portfolio web full stack de Pablo Esquinas: frontend en React y TypeScript, backend con Node.js/Express para el formulario de contacto.

## Stack

- **Frontend:** React 19, TypeScript, Vite, React Router
- **Backend:** Node.js (≥ 22), Express 5, Nodemailer, express-rate-limit
- **Deployment:** Caddy (proxy + estáticos), systemd (servicio), rsync

## Estructura

```
portfolio_pablo/
├── portfolio_Pablo/        # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/          # Home, CV, Projects, ProjectDetail, Contact, 404
│   │   ├── components/     # Layout, project detail components
│   │   ├── content/        # Markdown files for each project
│   │   ├── data/           # projects.ts, home.ts, cv.ts
│   │   ├── utils/          # Markdown loader, validation
│   │   └── hooks/          # useScrollSpy for TOC highlighting
│   └── dist/               # Build output (deployed)
├── api/                    # Backend (Express)
│   ├── src/
│   │   ├── server.js       # Listening on 127.0.0.1:3000
│   │   ├── app.js          # Route handlers, rate limit, honeypot
│   │   ├── validate.js     # Email validation, SMTP header injection prevention
│   │   ├── mailer.js       # Nodemailer configuration
│   │   ├── config.js       # Environment variable validation
│   │   └── test/           # 7 test scenarios (no external dependencies)
│   ├── .env.example        # Template for required variables
│   └── deploy/
│       └── portfolio-api.service  # systemd service config
├── deploy.sh               # Deployment script (manual)
└── Caddyfile              # Web server config (in production)
```

## Desarrollo local

### Frontend

```bash
cd portfolio_Pablo
npm install
npm run dev
# Abre http://localhost:5173
```

### Backend (API)

```bash
cd api
cp .env.example .env
# Editar .env con tus credenciales SMTP
npm install
npm start
# Escucha en 127.0.0.1:3000
```

### Tests

```bash
cd api
npm test
```

## Funcionalidades

**Frontend:**
- Home con hero y resumen
- CV descargable en PDF
- Proyectos con búsqueda y filtros por herramientas
- Detalle de proyecto con Markdown, tabla de contenidos y scrollspy
- Formulario de contacto con validación
- Página 404

**Backend (API de contacto):**
- Validación estricta del servidor
- Protección contra inyección de cabeceras SMTP (bloquea `\r\n` en nombre y asunto)
- Honeypot para atrapar bots
- Rate limit: 5 envíos cada 15 minutos por IP
- Errores SMTP ocultos al cliente (evita exposición de credenciales)
- Cuerpo JSON limitado a 10 KB
- Tests del 100% de los escenarios

## Despliegue

El despliegue es **manual** con `deploy.sh`:

1. `git pull --ff-only` (actualiza sin merges automáticos)
2. `npm ci` (instala dependencias exactas del frontend)
3. `npm run build` (compila TypeScript + empaqueta con Vite)
4. `rsync --delete` del `dist/` a `/var/www/html` (servidor web)
5. `npm ci --omit=dev` de la API (solo producción)
6. `systemctl restart portfolio-api` (reinicia el servicio)

**Arquitectura en producción:**

```
Navegador
   ↓
Caddy (pabloesquinas.es:443)
   ├─ Estáticos (index.html, .js, .css) → /var/www/html
   ├─ /api/* → 127.0.0.1:3000 (Express)
   └─ Rutas no encontradas → index.html (SPA)

Node.js (systemd portfolio-api)
   └─ Escucha solo en 127.0.0.1:3000
```

Caddy maneja HTTPS automático (Let's Encrypt), redirige HTTP a HTTPS y envía `/api/...` al backend.

## Aprendizajes

- Markdown renderizado en el frontend reduce solicitudes y acelera navegación
- Validación estricta en el servidor es esencial (nunca confiar en el cliente)
- El honeypot atrapa bots sin friccionar a usuarios reales
- Rate limiting sin estado (basado en IP) es simple y efectivo
- Lazy loading de componentes pesados reduce el bundle inicial
- Scroll spy con `getBoundingClientRect()` es más preciso que IntersectionObserver para TOC

## Mejoras futuras

- Automatizar el despliegue con GitHub Actions
- Tests del frontend (Vitest + Testing Library)
- Desplegar la API sin cortes (blue-green deployment)
- Métricas y monitoreo (Prometheus, Grafana)
- CDN para estáticos (mejora latencia global)
- Incrementar el límite de rate limit para usuarios autenticados (reservado)
