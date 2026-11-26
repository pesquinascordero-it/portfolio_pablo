// Fuente única de datos del CV. Las páginas solo los presentan.
// Los valores entre corchetes son pendientes por completar.

export const profile = {
  name: 'Pablo Esquinas Cordero',
  role: 'Desarrollador Backend Junior',
  location: 'Madrid, España',
  summary:
    'Graduado en Ingeniería en Sistemas de Información por la Universidad de Alcalá, orientado al desarrollo backend. Durante 7 meses de prácticas en Acciona automaticé pruebas de regresión en Java (Appium, Cucumber) ejecutadas desde Jenkins, apoyé la monitorización de microservicios en AWS y trabajé con Git y Jira junto a equipos externos. En proyectos académicos y personales he programado en Python, Java y JavaScript (Node.js), he desarrollado APIs REST y he trabajado con bases de datos relacionales (PostgreSQL, MySQL).',
  email: 'pesquinascordero@gmail.com',
  phone: '+34 619 635 262',
  linkedin: 'https://www.linkedin.com/in/pablo-esquinas-cordero',
  github: 'https://github.com/pesquinascordero',
}

export const highlightedStack = [
  'Java',
  'Python',
  'PostgreSQL',
  'MySQL',
  'AWS',
  'Jenkins',
  'Node.js',
  'APIs REST',
]

export const skills = [
  { category: 'Lenguajes', items: ['Java', 'Python', 'SQL', 'JavaScript', 'C++'] },
  { category: 'Backend y APIs', items: ['Spring Boot', 'API REST', 'Java EE (Servlets)', 'GlassFish', 'Node.js'] },
  { category: 'Bases de datos', items: ['PostgreSQL', 'MySQL'] },
  { category: 'Cloud y DevOps', items: ['AWS', 'Jenkins (CI/CD)', 'Git', 'GitLab', 'Dynatrace', 'Linux', 'Caddy'] },
  { category: 'Testing', items: ['Appium', 'Cucumber', 'BrowserStack', 'pruebas funcionales', 'de regresión y de carga'] },
  { category: 'Frontend y móvil', items: ['React', 'Ionic', 'HTML', 'CSS'] },
  { category: 'Fundamentos', items: ['POO', 'programación funcional', 'estructuras de datos y algoritmos'] },
  { category: 'Organización', items: ['Jira', 'Confluence'] },
]

export const experience = [
  {
    role: 'Prácticas en QA y Desarrollo de Software',
    company: 'Acciona Tecnología y Servicios',
    type: 'Prácticas',
    period: 'Sep 2025 – Mar 2026',
    location: 'Madrid · Apps de reserva de puestos y parking (web, Android, iOS)',
    bullets: [
      'Automaticé pruebas de regresión en Java con Appium y Cucumber, ejecutadas mediante Jenkins y BrowserStack.',
      'Monitoricé microservicios en AWS, detectando incidencias en picos de demanda y comunicándolas al equipo responsable.',
      'Diseñé y ejecuté casos de prueba y regresiones en Jira, añadiendo logs en Java para diagnosticar fallos.',
      'Realicé cambios en el frontend (React, Ionic) mediante pull request en Git y publiqué versiones en App Store y Applivery.',
    ],
  },
]

export const education = [
  {
    title: 'Grado en Ingeniería en Sistemas de Información',
    institution: 'Universidad de Alcalá (UAH)',
    period: '2021 – 2026',
    detail: 'Graduado en 2026.',
  },
]

export const languages = [
  { name: 'Español', level: 'Nativo' },
  { name: 'Inglés', level: 'B2' },
]
