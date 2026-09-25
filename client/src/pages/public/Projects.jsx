import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '../../lib/api.js';
import { applySeo } from '../../lib/seo.js';
import { Container, Section } from '../../components/ui/Section.jsx';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/States.jsx';
import { ProjectCard } from '../../components/public/ProjectCard.jsx';
import { ContactCta } from '../../components/public/ContactCta.jsx';
import { fadeUp, revealOnScroll, staggerChildren } from '../../lib/motion.js';
import { cn } from '../../lib/cn.js';
import { useSiteSettings } from '../../hooks/useSiteSettings.js';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'planned', label: 'Planned' },
];

function FilterGroup({ label, options, value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-mono text-xs uppercase tracking-[0.14em] text-ink-600">
        {label}
      </span>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value || 'all'}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm transition-colors',
              active
                ? 'border-accent-500/40 bg-accent-500/10 text-accent-200'
                : 'border-[var(--hairline)] text-ink-400 hover:border-[var(--hairline-strong)] hover:text-ink-100',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default function Projects() {
  const [status, setStatus] = useState('');
  const [technology, setTechnology] = useState('');
  const { settings } = useSiteSettings();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/api/projects'),
  });

  useEffect(() => {
    applySeo({
      title: 'Projects',
      description:
        'Full-stack web and mobile projects built by Hamza Idiris with React, Node.js, Express, MongoDB and Flutter, including the problem each one solves.',
      path: '/projects',
    });
  }, []);

  const items = data?.items || [];
  const technologies = data?.facets?.technologies || [];

  const filtered = useMemo(
    () =>
      items.filter(
        (project) =>
          (!status || project.status === status) &&
          (!technology || project.technologies?.includes(technology)),
      ),
    [items, status, technology],
  );

  const technologyOptions = [
    { value: '', label: 'All' },
    ...technologies.slice(0, 10).map((name) => ({ value: name, label: name })),
  ];

  return (
    <>
      <Section className="pb-10 pt-16 sm:pt-20">
        <motion.div initial="hidden" animate="visible" variants={staggerChildren(0.08)}>
          <motion.p
            variants={fadeUp}
            className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-accent-400"
          >
            Projects
          </motion.p>
          <motion.h1 variants={fadeUp} className="max-w-3xl text-4xl sm:text-5xl">
            From idea to working product
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-400">
            Each project below is a complete system rather than a demo. Open one to read the problem
            it addresses, how it was built, and what it taught me.
          </motion.p>
        </motion.div>
      </Section>

      <Section className="py-0">
        <div className="flex flex-col gap-4 border-y border-[var(--hairline)] py-5 lg:flex-row lg:items-center lg:justify-between">
          <FilterGroup label="Status" options={STATUS_FILTERS} value={status} onChange={setStatus} />
          {technologies.length ? (
            <FilterGroup
              label="Stack"
              options={technologyOptions}
              value={technology}
              onChange={setTechnology}
            />
          ) : null}
        </div>
      </Section>

      <Section className="pt-12">
        {isError ? (
          <ErrorState
            title="Projects could not be loaded"
            description="The API did not respond. Check that the server is running, then try again."
            onRetry={refetch}
          />
        ) : isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-80 w-full" />
            ))}
          </div>
        ) : !items.length ? (
          <EmptyState
            title="No projects published yet"
            description="Projects published from the admin dashboard will appear here."
          />
        ) : !filtered.length ? (
          <EmptyState
            title="No projects match these filters"
            description="Try a different status or technology."
          />
        ) : (
          <motion.div
            {...revealOnScroll}
            key={`${status}-${technology}`}
            variants={staggerChildren(0.08)}
            className="grid gap-6 sm:grid-cols-2"
          >
            {filtered.map((project, index) => (
              <ProjectCard key={project._id} project={project} index={index} />
            ))}
          </motion.div>
        )}
      </Section>

      <ContactCta title={settings.home.ctaTitle} description={settings.home.ctaDescription} />
    </>
  );
}
