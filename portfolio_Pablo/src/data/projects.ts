export interface Project {
  slug: string
  title: string
  date: string // "11 de abril de 2026" o formato ISO "2026-04-11" para parsear
  category: string // UNA palabra: será el badge de la tarjeta
  tools: string[] // herramientas, alimenta los chips de filtro
  summary: string // Máx 120 caracteres, una sola frase terminada en punto
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
    summary: 'Hecha en Node.js sin frameworks para gestionar libros, con página web propia y desplegada en mi servidor Linux.',
    demo: 'https://biblioteca.pabloesquinas.es',
    repo: 'https://github.com/pesquinascordero-it/biblioteca-api',
  },
  {
    slug: 'tfg-machine-learning-alt',
    title: 'TFG Machine Learning ALT',
    date: '2026-11-25',
    category: 'Machine Learning',
    tools: ['Python', 'pandas', 'scikit-learn', 'XGBoost', 'LightGBM', 'Optuna', 'SHAP', 'TabPFN'],
    summary: 'Comparo modelos de regresión para predecir la actividad ALT en tumores a partir de datos de 4.535 pacientes.',
    repo: 'https://github.com/pesquinascordero-it/tfg-machine-learning-alt',
  },
  {
    slug: 'venta-entradas-spring',
    title: 'API REST Venta de Entradas',
    date: '2026-10-30',
    category: 'Backend',
    tools: ['Java', 'Spring Boot', 'Maven'],
    summary: 'Practico inyección de dependencias y ámbitos de beans en Spring, y evito la sobreventa de entradas con synchronized.',
    repo: 'https://github.com/pesquinascordero-it/venta-entradas-spring',
  },
  {
    slug: 'portfolio-personal',
    title: 'Portfolio Personal',
    date: '2026-11-26',
    category: 'Full Stack',
    tools: ['React', 'TypeScript', 'Vite', 'Node.js', 'Express', 'Nodemailer', 'Caddy'],
    summary: 'Frontend en React y TypeScript, con una API de contacto protegida contra spam y desplegada en un VPS con Caddy.',
    repo: 'https://github.com/pesquinascordero-it/portfolio_pablo',
  },
]
