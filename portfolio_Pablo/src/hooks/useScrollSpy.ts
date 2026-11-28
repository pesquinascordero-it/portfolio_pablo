import { useEffect, useState } from 'react'

export interface HeadingNode {
  id: string
  text: string
  level: 2 | 3
  children?: HeadingNode[]
}

/**
 * Hook que monitoriza el scroll y devuelve el ID del heading actualmente visible.
 * Usa scroll listener con getBoundingClientRect() para seleccionar el elemento
 * más cercano a la parte superior (justo debajo de la navbar de ~80px).
 * Si estamos al final de la página, activa el último encabezado.
 */
export function useScrollSpy(headings: HeadingNode[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const allHeadings = flattenHeadings(headings)
    if (allHeadings.length === 0) return

    const handleScroll = () => {
      const navbar = 80 // altura navbar fija
      const isAtBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 100

      // Si estamos al final, el último apartado es el activo
      if (isAtBottom) {
        setActiveId(allHeadings[allHeadings.length - 1].id)
        return
      }

      // Busca el encabezado más cercano arriba (justo debajo de la navbar)
      let closest: HeadingNode | null = null
      let closestDistance = Infinity

      for (const heading of allHeadings) {
        const element = document.getElementById(heading.id)
        if (!element) continue

        const rect = element.getBoundingClientRect()
        // Distancia desde la parte superior al elemento
        const distance = rect.top - navbar

        // Si está fuera de vista abajo, ignora
        if (distance > window.innerHeight) continue

        // Si está arriba de la navbar, es candidato (distancia negativa)
        // Elegimos el más cercano a 0 (justo debajo de la navbar)
        if (distance <= 0 && Math.abs(distance) < closestDistance) {
          closest = heading
          closestDistance = Math.abs(distance)
        } else if (distance > 0 && distance < closestDistance) {
          // Si nada está arriba, elegimos el que está más cerca abajo
          closest = heading
          closestDistance = distance
        }
      }

      if (closest) {
        setActiveId(closest.id)
      }
    }

    // Listener con passive flag para eficiencia
    window.addEventListener('scroll', handleScroll, { passive: true })
    // Ejecuta una vez al montar
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
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
