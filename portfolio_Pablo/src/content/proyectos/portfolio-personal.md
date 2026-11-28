## 1. Qué es

Sitio web completo que muestra mis proyectos, CV y formulario de contacto. Es un full stack moderno: frontend React + TypeScript con Vite, backend Node.js Express, y todo desplegado en un VPS Linux con Caddy.

**Stack**: React, TypeScript, Vite, Node.js Express, Caddy, systemd.

### 1.1 Por qué lo hice

Quería demostrar cómo se hace un portfolio profesional en 2025: una SPA rápida que renderiza markdown sin necesidad de CMS, con validación completa del formulario de contacto y despliegue automatizado.

## 2. Características

- **Inicio**: Hero con animaciones, resumen de proyectos destacados, enlaces a redes.
- **Proyectos**: Grid responsivo (3 columnas en desktop, 1 en móvil), búsqueda en tiempo real, filtros por herramientas.
- **CV**: Descargable y visualizable en el navegador.
- **Detalle de proyecto**: Renderizado Markdown con tabla de contenidos interactiva, resaltado de sintaxis, scroll spy automático.
- **Contacto**: Validación cliente y servidor, rate limiting (5 mensajes por IP/hora), envío por email con Nodemailer.

Cada proyecto se define en un archivo Markdown que vive en `/content/proyectos/` y se importa en tiempo de compilación.

## 3. Renderizado Markdown en React

```typescript
// src/components/projects/ProjectContent.tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

export function ProjectContent({ markdown }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
    >
      {markdown}
    </ReactMarkdown>
  )
}
```

Los plugins transforman tablas, strikethrough, enlaces y bloques de código. El highlight se aplica automáticamente.

## 4. Despliegue

La arquitectura es simple: Caddy como reverse proxy, React compilado a archivos estáticos, Node.js para la API de contacto.

```
pabloesquinas.es
      │
    Caddy (HTTPS automático)
      ├── /api        → Node.js Express en puerto 3000 (systemd)
      ├── /cv         → archivos estáticos con fallback SPA
      └── resto       → SPA React compilada (gzip)
```

**Deploy**: Git push → webhook de GitHub → script bash en el servidor:
1. `git pull` en `/root/portfolio/portfolio_pablo`
2. `npm run build` para frontend y backend
3. `systemctl restart portfolio-backend`
4. Caddy recarga automáticamente

## 5. Qué aprendí

- SPA con contenido Markdown: Git es el CMS, no necesita base de datos.
- Vite es un cambio de juego: rebundling de 50ms vs Webpack 2-3s.
- React Markdown + highlight.js: renderizado seguro sin `dangerouslySetInnerHTML`.
- Scroll spy con hooks: sintetizar posiciones de headings mientras renderizas.
- Rate limiting simple en memoria: `Map` de IPs con timestamps, limpiar entries antiguas.
- Deployment sin downtime: systemd con `Restart=always` + socket activation.
