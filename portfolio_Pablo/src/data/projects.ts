export interface Project {
  slug: string
  title: string
  date: string // "11 de abril de 2026" o formato ISO "2026-04-11" para parsear
  category: string // UNA palabra: será el badge de la tarjeta
  tools: string[] // herramientas, alimenta los chips de filtro
  summary: string // 1-3 frases para la tarjeta
  cover?: string // ruta a la imagen (ej: "/projects/api-go.jpg"), opcional
  repo?: string // enlace al repo GitHub
  demo?: string // enlace a la demo
}

export const projects: Project[] = [
  {
    slug: 'biblioteca-api',
    title: 'API REST Biblioteca',
    date: '2026-11-25',
    category: 'Backend',
    tools: ['Node.js', 'HTML', 'CSS', 'JavaScript', 'Caddy', 'systemd', 'Bash'],
    summary: 'API REST sin frameworks para gestión de biblioteca. CRUD completo, filtros, búsqueda, ordenación, paginación y validación. Desplegada en VPS con Caddy y systemd.',
    demo: 'https://biblioteca.pabloesquinas.es',
    repo: 'https://github.com/pesquinascordero-it/biblioteca-api',
  },
  {
    slug: 'tfg-machine-learning-alt',
    title: 'TFG Machine Learning ALT',
    date: 'TODO: fecha exacta',
    category: 'ML',
    tools: ['Python', 'pandas', 'scikit-learn', 'XGBoost', 'LightGBM', 'SHAP', 'TabPFN'],
    summary: 'Predicción de actividad ALT en datos oncológicos (4.535 pacientes). 7 modelos ML optimizados con análisis SHAP y ranking de genes.',
    repo: 'TODO: enlace repo',
  },
  {
    slug: 'venta-entradas-spring',
    title: 'API REST Venta de Entradas',
    date: 'TODO: fecha exacta',
    category: 'Backend',
    tools: ['Java', 'Spring Boot', 'Maven'],
    summary: 'API con inyección de dependencias y ciclos de vida de beans. Control de concurrencia verificado con 20 compras simultáneas, evita sobreventa.',
    repo: 'TODO: enlace repo',
  },
  {
    slug: 'portfolio-personal',
    title: 'Portfolio Personal',
    date: 'TODO: fecha exacta',
    category: 'Full Stack',
    tools: ['React', 'TypeScript', 'Vite', 'Node.js', 'Linux', 'VPS'],
    summary: 'Este portafolio. Frontend moderno en React, backend con formulario de contacto, despliegue automatizado en VPS con Caddy.',
    demo: 'https://pabloesquinas.es',
    repo: 'TODO: enlace repo',
  },
]
