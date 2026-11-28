import { useMemo } from 'react'
import { Link } from 'react-router'
import { projects } from '../../data/projects'
import './ProjectNavigation.css'

interface ProjectNavigationProps {
  currentSlug: string
}

export function ProjectNavigation({ currentSlug }: ProjectNavigationProps) {
  const { previous, next } = useMemo(() => {
    const index = projects.findIndex(p => p.slug === currentSlug)
    return {
      previous: index > 0 ? projects[index - 1] : null,
      next: index < projects.length - 1 ? projects[index + 1] : null,
    }
  }, [currentSlug])

  return (
    <nav className="project-navigation" aria-label="Navegación entre proyectos">
      <div className="project-nav-links">
        {previous && (
          <Link
            to={`/proyectos/${previous.slug}`}
            className="project-nav-link project-nav-prev"
            aria-label={`Proyecto anterior: ${previous.title}`}
          >
            <div className="project-nav-label">← Anterior</div>
            <div className="project-nav-title">{previous.title}</div>
          </Link>
        )}
        {next && (
          <Link
            to={`/proyectos/${next.slug}`}
            className="project-nav-link project-nav-next"
            aria-label={`Proyecto siguiente: ${next.title}`}
          >
            <div className="project-nav-label">Siguiente →</div>
            <div className="project-nav-title">{next.title}</div>
          </Link>
        )}
      </div>
    </nav>
  )
}
