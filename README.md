# Portfolio Personal

Portfolio web full stack de Pablo Esquinas: frontend en React y TypeScript, backend con Node.js/Express para el formulario de contacto.

## Stack

- **Frontend:** React 19, TypeScript, Vite, React Router
- **Backend:** Node.js (≥ 22), Express 5, Nodemailer, express-rate-limit
- **Despliegue:** Caddy (proxy + estáticos), systemd (servicio), rsync

## Estructura

```
portfolio_pablo/
├── portfolio_Pablo/        # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/          # Home, CV, Projects, ProjectDetail, Contact, 404
│   │   ├── components/     # Layout, project detail components
│   │   ├── content/        # Archivos Markdown de cada proyecto
│   │   ├── data/           # projects.ts, home.ts, cv.ts
│   │   ├── utils/          # Cargador de Markdown
│   │   └── hooks/          # useScrollSpy para resaltado de TOC
│   └── dist/               # Salida de compilación (desplegada)
├── api/                    # Backend (Express)
│   ├── src/
│   │   ├── server.js       # Escucha en 127.0.0.1:3000
│   │   ├── app.js          # Manejadores de rutas, rate limit, honeypot
│   │   ├── validate.js     # Validación de email, prevención de inyección SMTP
│   │   ├── mailer.js       # Configuración Nodemailer
│   │   └── config.js       # Validación de variables de entorno
│   ├── test/
│   │   └── app.test.js     # 7 tests con node:test y mailer simulado
│   ├── .env.example        # Plantilla de variables requeridas
│   └── deploy/
│       └── portfolio-api.service  # Configuración del servicio systemd
├── deploy.sh               # Script de despliegue (manual)
└── .gitignore             # Archivos ignorados por git
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
- Los errores de SMTP no se muestran al cliente
- Cuerpo JSON limitado a 10 KB
- 7 tests con `node:test` y un mailer simulado

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

- Validación estricta en el servidor es esencial (nunca confiar en el cliente)
- El honeypot atrapa bots sin friccionar a usuarios reales
- El rate limit de `express-rate-limit` guarda los contadores en memoria: es sencillo, pero se reinicia al reiniciar el servicio y no se comparte entre instancias
- Lazy loading de componentes pesados reduce el bundle inicial
- Scroll spy con `getBoundingClientRect()` es más preciso que IntersectionObserver para TOC

## Mejoras futuras

- Automatizar el despliegue con GitHub Actions
- Tests del frontend (Vitest + Testing Library)
- Desplegar la API sin cortes
