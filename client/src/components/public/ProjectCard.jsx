import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Badge, StatusBadge } from '../ui/Badge.jsx';
import { fadeUp } from '../../lib/motion.js';
import { cn } from '../../lib/cn.js';
import { resolveMediaUrl } from '../../lib/api.js';

function CoverImage({ project, className }) {
  if (project.coverImage) {
    return (
      <img
        src={resolveMediaUrl(project.coverImage)}
        alt={project.coverImageAlt || `${project.title} interface`}
        loading="lazy"
        decoding="async"
        className={cn('h-full w-full object-cover', className)}
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,var(--color-ink-750),var(--color-ink-850))]">
      <span className="px-6 text-center font-mono text-xs text-ink-600">
        {project.category || 'Project'}
      </span>
    </div>
  );
}

export function ProjectCard({ project, index = 0, featured = false }) {
  return (
    <motion.article
      variants={fadeUp}
      className={cn(
        'group surface relative overflow-hidden rounded-[var(--radius-card)] transition-colors duration-300',
        'hover:border-[var(--hairline-strong)]',
        featured && 'sm:grid sm:grid-cols-2 sm:items-stretch',
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden bg-ink-850',
          featured ? 'aspect-[16/10] sm:aspect-auto sm:h-full' : 'aspect-[16/10]',
          index % 2 === 1 && featured && 'sm:order-2',
        )}
      >
        <CoverImage
          project={project}
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className={cn('flex flex-col p-5 sm:p-6', featured && 'sm:justify-center sm:p-8')}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={project.status} />
          {project.category ? <Badge tone="muted">{project.category}</Badge> : null}
        </div>

        <h3 className={cn('text-xl', featured && 'sm:text-2xl')}>
          <Link to={`/projects/${project.slug}`} className="after:absolute after:inset-0">
            {project.title}
          </Link>
        </h3>

        {project.tagline ? (
          <p className="mt-1 font-mono text-xs text-accent-400">{project.tagline}</p>
        ) : null}

        <p className="mt-3 text-sm leading-relaxed text-ink-400 line-clamp-3">
          {project.shortDescription}
        </p>

        {project.technologies?.length ? (
          <ul className="mt-5 flex flex-wrap gap-1.5">
            {project.technologies.slice(0, 5).map((technology) => (
              <li
                key={technology}
                className="rounded-md border border-[var(--hairline)] bg-ink-850 px-2 py-1 font-mono text-[11px] text-ink-400"
              >
                {technology}
              </li>
            ))}
            {project.technologies.length > 5 ? (
              <li className="px-1 py-1 font-mono text-[11px] text-ink-600">
                +{project.technologies.length - 5}
              </li>
            ) : null}
          </ul>
        ) : null}

        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-300 transition-colors group-hover:text-accent-300">
          Read the case study
          <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </span>
      </div>
    </motion.article>
  );
}
