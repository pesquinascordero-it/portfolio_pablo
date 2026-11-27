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
    slug: 'api-go-chi',
    title: 'API REST en Go con Chi',
    date: '2026-04-11',
    category: 'Go',
    tools: ['Go', 'Chi', 'PostgreSQL', 'Docker'],
    summary: 'Backend para un portfolio con posts, formulario de contacto y envío de correo, organizado por funcionalidades.',
    repo: 'https://github.com/pesquinascordero-it',
  },
  {
    slug: 'react-dashboard',
    title: 'Dashboard en React con Vite',
    date: '2026-03-15',
    category: 'React',
    tools: ['React', 'Vite', 'TypeScript', 'TailwindCSS'],
    summary: 'Interfaz interactiva para visualizar métricas en tiempo real con gráficos dinámicos.',
    demo: 'https://demo.example.com',
    repo: 'https://github.com/pesquinascordero-it',
  },
  {
    slug: 'terraform-infrastructure',
    title: 'Infraestructura en Terraform',
    date: '2026-02-28',
    category: 'DevOps',
    tools: ['Terraform', 'AWS', 'Docker', 'GitHub Actions'],
    summary: 'Automatización de despliegues en AWS con Terraform e integración CI/CD.',
  },
]
