import { Suspense, lazy, useState, useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { projects } from '../data/projects'
import { getProjectMarkdown } from '../utils/loadMarkdown'
import { useScrollSpy, type HeadingNode } from '../hooks/useScrollSpy'
import { ProjectNavigation } from '../components/projects/ProjectNavigation'
import NotFound from './NotFound'
import './ProjectDetail.css'

// Lazy load componentes pesados
const ProjectContent = lazy(() => import('../components/projects/ProjectContent').then(m => ({ default: m.ProjectContent })))
const ProjectToc = lazy(() => import('../components/projects/ProjectToc').then(m => ({ default: m.ProjectToc })))

function ProjectDetail() {
  const { slug } = useParams()
  const project = projects.find((p) => p.slug === slug)
  const [headings, setHeadings] = useState<HeadingNode[]>([])
  const activeId = useScrollSpy(headings)

  // Scroll a arriba cuando cambia el proyecto
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!project) {
    return <NotFound />
  }

  const markdown = getProjectMarkdown(project.slug)

  if (!markdown) {
    return (
      <div className="project-detail-error">
        <h2>Contenido no disponible</h2>
        <p>Este proyecto aún no tiene la documentación completada.</p>
        <Link to="/proyectos">← Volver a proyectos</Link>
      </div>
    )
  }

  return (
    <article className="project-detail">
      <Link to="/proyectos" className="project-detail-back">← Proyectos</Link>

      <header className="project-detail-header">
        <time className="project-detail-date">
          {new Date(project.date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>

        <h1 className="project-detail-title">{project.title}</h1>

        <div className="project-detail-meta">
          <span className="project-detail-category">{project.category}</span>
          <ul className="project-detail-tools">
            {project.tools.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </div>

        {(project.repo || project.demo) && (
          <div className="project-detail-actions">
            {project.repo && (
              <a href={project.repo} target="_blank" rel="noopener noreferrer" className="btn">
                Ver código
              </a>
            )}
            {project.demo && (
              <a href={project.demo} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Ver demo
              </a>
            )}
          </div>
        )}
      </header>

      {project.cover && (
        <img src={project.cover} alt={project.title} className="project-detail-cover" />
      )}

      <div className="project-detail-body">
        <Suspense fallback={<div className="project-detail-loading">Cargando contenido...</div>}>
          <ProjectContent
            markdown={markdown}
            onHeadingsExtracted={setHeadings}
          />
        </Suspense>

        <Suspense fallback={null}>
          <ProjectToc headings={headings} activeId={activeId} />
        </Suspense>
      </div>

      <ProjectNavigation currentSlug={slug!} />
    </article>
  )
}

export default ProjectDetail
