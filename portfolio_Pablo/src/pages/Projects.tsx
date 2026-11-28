import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { projects } from '../data/projects'
import './Projects.css'

function Projects() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') || ''
  const selectedTool = searchParams.get('tool') || ''
  const [localSearch, setLocalSearch] = useState(searchQuery)

  // Normalizar texto: sin mayúsculas ni tildes
  const normalize = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  }

  // Obtener todos los tools únicos (sin duplicados, alfabéticamente)
  const availableTools = useMemo(() => {
    const tools = new Set<string>()
    projects.forEach((p) => p.tools.forEach((t) => tools.add(t)))
    return Array.from(tools).sort()
  }, [])

  // Filtrar proyectos
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const normalizedSearch = normalize(searchQuery)

      // Búsqueda: título, resumen, categoría, herramientas
      const matchesSearch =
        normalize(project.title).includes(normalizedSearch) ||
        normalize(project.summary).includes(normalizedSearch) ||
        normalize(project.category).includes(normalizedSearch) ||
        project.tools.some((tool) => normalize(tool).includes(normalizedSearch))

      // Filtro de tool (si está seleccionado)
      const matchesTool = !selectedTool || project.tools.includes(selectedTool)

      return matchesSearch && matchesTool
    })
  }, [searchQuery, selectedTool])

  // Actualizar URL al cambiar búsqueda
  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }
    setSearchParams(params)
  }

  // Cambiar filtro de tool
  const handleToolFilter = (tool: string) => {
    const params = new URLSearchParams(searchParams)
    if (tool === 'all' || selectedTool === tool) {
      params.delete('tool')
    } else {
      params.set('tool', tool)
    }
    setSearchParams(params)
  }

  // Limpiar filtros
  const handleClearFilters = () => {
    setLocalSearch('')
    setSearchParams('')
  }

  const projectCount = filteredProjects.length

  return (
    <main className="projects-page">
      <h1>Proyectos</h1>
      <p className="projects-subtitle">Una selección de mis trabajos más recientes</p>

      {/* Buscador */}
      <div className="projects-search-container">
        <label htmlFor="projects-search" className="sr-only">
          Buscar proyectos
        </label>
        <input
          id="projects-search"
          type="text"
          placeholder="Buscar proyectos..."
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="projects-search-input"
        />
      </div>

      {/* Chips de filtro */}
      <div className="projects-filter-chips">
        <button
          className={`filter-chip ${!selectedTool ? 'active' : ''}`}
          onClick={() => handleToolFilter('all')}
          aria-pressed={!selectedTool}
        >
          Todos
        </button>
        {availableTools.map((tool) => (
          <button
            key={tool}
            className={`filter-chip ${selectedTool === tool ? 'active' : ''}`}
            onClick={() => handleToolFilter(tool)}
            aria-pressed={selectedTool === tool}
          >
            {tool}
          </button>
        ))}
      </div>

      {/* Contador */}
      <div className="projects-counter">
        {projectCount === 1 ? '1 proyecto' : `${projectCount} proyectos`}
      </div>

      {/* Grid de proyectos */}
      {projectCount > 0 ? (
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <Link
              key={project.slug}
              to={`/proyectos/${project.slug}`}
              className="project-card"
            >
              {project.cover ? (
                <img
                  src={project.cover}
                  alt={project.title}
                  className="project-card-cover"
                  loading="lazy"
                />
              ) : (
                <div className="project-card-placeholder">
                  <span>{project.tools[0] || 'Proyecto'}</span>
                </div>
              )}

              <div className="project-card-body">
                <div className="project-card-header">
                  <time className="project-card-date">
                    {new Date(project.date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <span className="project-card-category">{project.category}</span>
                </div>

                <h2 className="project-card-title">{project.title}</h2>
                <p className="project-card-summary">{project.summary}</p>

                <footer className="project-card-footer">{project.tools.join(' · ')}</footer>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="projects-empty">
          <p>No hay proyectos que coincidan con tu búsqueda</p>
          <button onClick={handleClearFilters} className="btn">
            Limpiar filtros
          </button>
        </div>
      )}
    </main>
  )
}

export default Projects
