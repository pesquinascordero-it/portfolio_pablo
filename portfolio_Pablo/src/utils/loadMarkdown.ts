// Carga archivos Markdown desde src/content/proyectos/
const markdownFiles = import.meta.glob<string>(
  '/src/content/proyectos/*.md',
  { query: '?raw', import: 'default', eager: true },
)

export function getProjectMarkdown(slug: string): string | null {
  const key = `/src/content/proyectos/${slug}.md`
  return markdownFiles[key] ?? null
}

// Validación en desarrollo: verifica que todos los slugs tengan su .md
if (import.meta.env.DEV) {
  import('../data/projects').then(({ projects }) => {
    for (const project of projects) {
      const markdown = getProjectMarkdown(project.slug)
      if (!markdown) {
        console.warn(`⚠️ Proyecto "${project.slug}" no tiene archivo Markdown en src/content/proyectos/`)
      }
    }
  })
}
