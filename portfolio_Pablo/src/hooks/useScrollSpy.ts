import { useEffect, useState } from 'react'

export interface HeadingNode {
  id: string
  text: string
  level: 2 | 3 // h2 y h3
  children?: HeadingNode[] // h3s bajo un h2
}

/**
 * Hook que monitoriza el scroll y devuelve el ID del heading visible actualmente.
 * Usa IntersectionObserver para eficiencia.
 */
export function useScrollSpy(headings: HeadingNode[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    // Flatten de headings para buscar elementos
    const allHeadings = flattenHeadings(headings)
    const elements = allHeadings
      .map((h) => ({ id: h.id, element: document.getElementById(h.id) }))
      .filter((h) => h.element !== null) as Array<{ id: string; element: HTMLElement }>

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Encuentra la entrada más visible (con mayor intersectionRatio)
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          const mostVisible = visible.reduce((prev, current) =>
            prev.intersectionRatio > current.intersectionRatio ? prev : current,
          )
          setActiveId(mostVisible.target.id)
        }
      },
      { rootMargin: '-80px 0px -66% 0px' }, // Top margin para navbar fija
    )

    elements.forEach((h) => observer.observe(h.element))

    return () => {
      elements.forEach((h) => observer.unobserve(h.element))
    }
  }, [headings])

  return activeId
}

function flattenHeadings(headings: HeadingNode[]): HeadingNode[] {
  const result: HeadingNode[] = []
  for (const heading of headings) {
    result.push(heading)
    if (heading.children) {
      result.push(...heading.children)
    }
  }
  return result
}
