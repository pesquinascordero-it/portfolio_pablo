import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { HeadingNode } from '../../hooks/useScrollSpy'
import './ProjectContent.css'

interface ProjectContentProps {
  markdown: string
  onHeadingsExtracted?: (headings: HeadingNode[]) => void
}

export function ProjectContent({ markdown, onHeadingsExtracted }: ProjectContentProps) {
  // Extrae headings del markdown para el TOC
  useMemo(() => {
    const lines = markdown.split('\n')
    const headings: HeadingNode[] = []
    let currentH2: HeadingNode | null = null

    for (const line of lines) {
      const h2Match = line.match(/^## (.+)$/)
      const h3Match = line.match(/^### (.+)$/)

      if (h2Match) {
        const text = h2Match[1]
        const id = slugify(text)
        currentH2 = { id, text, level: 2, children: [] }
        headings.push(currentH2)
      } else if (h3Match && currentH2) {
        const text = h3Match[1]
        const id = slugify(text)
        currentH2.children?.push({ id, text, level: 3 })
      }
    }

    onHeadingsExtracted?.(headings)
  }, [markdown, onHeadingsExtracted])

  return (
    <article className="project-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h2: ({ node, children, ...props }) => (
            <h2 id={slugify(String(children))} {...props} />
          ),
          h3: ({ node, children, ...props }) => (
            <h3 id={slugify(String(children))} {...props} />
          ),
          code: ({ node, className, children, ...props }) => (
            <code className={className ? undefined : 'inline-code'} {...props}>
              {children}
            </code>
          ),
          pre: ({ node, children, ...props }) => (
            <pre className="code-block" {...props}>
              {children}
            </pre>
          ),
          table: ({ node, ...props }) => (
            <div className="table-wrapper">
              <table {...props} />
            </div>
          ),
          a: ({ node, ...props }) => (
            <a target="_blank" rel="noopener noreferrer" {...props} />
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  )
}

/**
 * Convierte un string a un ID valido (lowercase, sin espacios ni caracteres especiales)
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[áéíóú]/g, (match) => ({
      á: 'a',
      é: 'e',
      í: 'i',
      ó: 'o',
      ú: 'u',
    }[match] ?? match))
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}
