import { Link } from 'react-router'
import { projects } from '../data/projects'
import './Projects.css'

function Projects() {
  return (
    <main className="projects-page">
      <h1>Proyectos</h1>
      <p className="projects-subtitle">Una selección de mis trabajos más recientes</p>

      <div className="projects-grid">
        {projects.map((project) => (
          <Link
            key={project.slug}
            to={`/proyectos/${project.slug}`}
            className="project-card"
          >
            {project.cover && (
              <img
                src={project.cover}
                alt={project.title}
                className="project-card-cover"
                loading="lazy"
              />
            )}

            <div className="project-card-body">
              <div className="project-card-header">
                <time className="project-card-date">
                  {new Date(project.date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
                <span className="project-card-category">{project.category}</span>
              </div>

              <h2 className="project-card-title">{project.title}</h2>
              <p className="project-card-summary">{project.summary}</p>

              <div className="project-card-tools">
                {project.tools.map((tool) => (
                  <span key={tool} className="tool-tag">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}

export default Projects
