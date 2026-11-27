import { useRef, useState } from 'react'
import type { HeadingNode } from '../../hooks/useScrollSpy'
import './ProjectToc.css'

interface ProjectTocProps {
  headings: HeadingNode[]
  activeId: string | null
}

export function ProjectToc({ headings, activeId }: ProjectTocProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const [isOpen, setIsOpen] = useState(typeof window !== 'undefined' && window.innerWidth >= 768)

  // En móvil, cierra el TOC al hacer clic en un enlace
  const handleLinkClick = () => {
    if (window.innerWidth < 768 && detailsRef.current) {
      detailsRef.current.open = false
      setIsOpen(false)
    }
  }

  if (headings.length === 0) {
    return null
  }

  return (
    <details ref={detailsRef} className="project-toc" open={isOpen}>
      <summary className="project-toc-summary">
        ▼ En este proyecto
      </summary>

      <nav className="project-toc-nav" aria-label="Tabla de contenidos">
        <ul className="project-toc-list">
          {headings.map((heading) => (
            <li key={heading.id} className="project-toc-item">
              <a
                href={`#${heading.id}`}
                className={`project-toc-link ${activeId === heading.id ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                {heading.text}
              </a>

              {heading.children && heading.children.length > 0 && (
                <ul className="project-toc-sublist">
                  {heading.children.map((child) => (
                    <li key={child.id} className="project-toc-subitem">
                      <a
                        href={`#${child.id}`}
                        className={`project-toc-sublink ${activeId === child.id ? 'active' : ''}`}
                        onClick={handleLinkClick}
                      >
                        {child.text}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </details>
  )
}

