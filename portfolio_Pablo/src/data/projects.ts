export interface Project {
  slug: string
  title: string
  type: 'Personal' | 'Académico'
  description: string
  tags: string[]
  github?: string
  demo?: string
}

export const projects: Project[] = [
  {
    slug: 'api-rest-entradas',
    title: 'API REST de venta de entradas',
    type: 'Personal',
    description:
      'API REST con Spring Boot (JSON, POST/GET, códigos HTTP 201/409) que demuestra la inyección de dependencias y los ciclos de vida de los beans (singleton, request, prototype). Control de concurrencia para evitar la sobreventa, verificado con 20 compras simultáneas.',
    tags: ['Java', 'Spring Boot', 'Maven'],
    github: 'https://github.com/pesquinascordero-it',
  },
  {
    slug: 'api-rest-biblioteca',
    title: 'API REST de biblioteca',
    type: 'Personal',
    description:
      'API REST en Node.js para gestionar los libros de una biblioteca: crear, consultar, editar y borrar. Con filtros, búsqueda, ordenación, paginación y validación de datos, conectada a una página web. Desplegada en un VPS Linux con Caddy (HTTPS), systemd y un script de despliegue en Bash.',
    tags: ['JavaScript', 'Node.js', 'HTML', 'CSS'],
    github: 'https://github.com/pesquinascordero-it',
    demo: 'https://biblioteca.pabloesquinas.es',
  },
  {
    slug: 'tfg-genomica',
    title: 'TFG: Machine Learning para identificar la vía ALT en datos genómicos tumorales',
    type: 'Académico',
    description:
      'Analicé con Python datos clínicos y genómicos de 4.535 pacientes y comparé distintos modelos de Machine Learning para predecir la actividad ALT en tumores.',
    tags: ['Python', 'pandas', 'scikit-learn', 'ML'],
    github: 'https://github.com/pesquinascordero-it',
  },
  {
    slug: 'escaner-iot',
    title: 'Escáner de exposición IoT',
    type: 'Académico',
    description:
      'Servicio en Python que consulta la API de Shodan, clasifica el riesgo de dispositivos IoT expuestos con un modelo de ML y notifica por Telegram; incluye honeypot y dashboard.',
    tags: ['Python', 'Shodan API', 'Telegram Bot API', 'ML'],
  },
  {
    slug: 'rastreador-wallets',
    title: 'Rastreador forense de wallets blockchain',
    type: 'Académico',
    description:
      'Servicio que integra APIs on-chain en tiempo real para rastrear wallets sospechosas en varias blockchains y generar informes forenses automáticos.',
    tags: ['Python', 'APIs on-chain', 'Telegram Bot API'],
  },
  {
    slug: 'crawler-dark-web',
    title: 'Crawler de Dark Web con alertas',
    type: 'Académico',
    description:
      'Crawler que enruta tráfico por Tor, extrae dominios .onion con regex y envía alertas automáticas al móvil.',
    tags: ['Python', 'Tor', 'regex', 'Telegram Bot API'],
  },
]
