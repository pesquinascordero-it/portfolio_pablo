import { profile, skills, experience, education, languages } from '../data/cv'
import { projects } from '../data/projects'
import { Link } from 'react-router'
import './Cv.css'

function Cv() {

  return (
    <article className="cv">
      <header className="cv-header">
        <h1 className="cv-name">{profile.name}</h1>
        <p className="cv-role">{profile.role}</p>
        <p className="cv-location-header">{profile.location} · <a href={`tel:${profile.phone.replace(/\s/g, '')}`}>{profile.phone}</a> · <a href={`mailto:${profile.email}`}>{profile.email}</a></p>
        <p className="cv-links">LinkedIn: <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">{profile.linkedin}</a> · GitHub: <a href={profile.github} target="_blank" rel="noopener noreferrer">{profile.github}</a></p>
        <a href="/CV-Pablo-Esquinas-Cordero.pdf" download className="btn btn-primary cv-download">Descargar CV (PDF)</a>
      </header>

      <section className="cv-section">
        <h3>Perfil Profesional</h3>
        <p className="cv-profile-text">{profile.summary}</p>
      </section>

      <section className="cv-section">
        <h3>Formación e Idiomas</h3>
        {education.map((item) => (
          <div key={item.title} className="cv-job">
            <h4>{item.title} — {item.institution}</h4>
            <p className="cv-meta">{item.period}</p>
            <p>{item.detail}</p>
          </div>
        ))}
        <div className="cv-languages">
          {languages.map((lang) => (
            <p key={lang.name}><strong>{lang.name}:</strong> {lang.level}</p>
          ))}
        </div>
      </section>

      <section className="cv-section">
        <h3>Experiencia</h3>
        {experience.map((job) => (
          <div key={job.period} className="cv-job">
            <h4>{job.role}</h4>
            <p className="cv-meta">{job.company} · {job.type} · {job.period}</p>
            <ul className="cv-list">
              {job.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="cv-section">
        <h3>Proyectos</h3>
        {projects.map((project) => (
          <div key={project.slug} className="cv-job">
            <h4>
              <Link to={`/proyectos/${project.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {project.title}
              </Link>
            </h4>
            <p className="cv-meta">{project.category}</p>
            <p className="cv-project-description">{project.summary}</p>
            <ul className="cv-project-tags">
              {project.tools.map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>
            <div className="cv-project-links">
              {project.repo && (
                <a href={project.repo} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              )}
              {project.demo && (
                <a href={project.demo} target="_blank" rel="noopener noreferrer">
                  Demo
                </a>
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="cv-section">
        <h3>Habilidades técnicas</h3>
        <div className="cv-skill-grid">
          {skills.map((group) => (
            <div key={group.category} className="card cv-skill-card">
              <h4>{group.category}</h4>
              <ul className="cv-tags">
                {group.items.map((item) => (
                  <li key={item} className="cv-tag">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>


    </article>
  )
}

export default Cv
