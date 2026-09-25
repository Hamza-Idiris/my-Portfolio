import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Lightbulb,
  ListChecks,
  Play,
  Target,
  TrendingUp,
  Users,
  Wrench,
} from 'lucide-react';
import { api, ApiError, resolveMediaUrl } from '../../lib/api.js';
import { applySeo, absoluteUrl } from '../../lib/seo.js';
import { Container, Section } from '../../components/ui/Section.jsx';
import { Badge, StatusBadge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States.jsx';
import { ProjectCard } from '../../components/public/ProjectCard.jsx';
import { GithubIcon } from '../../components/ui/BrandIcons.jsx';
import { fadeUp, revealOnScroll, staggerChildren } from '../../lib/motion.js';
import { trackEvent } from '../../lib/analytics.js';

function StoryBlock({ icon: Icon, eyebrow, title, children }) {
  if (!children) return null;

  return (
    <motion.section variants={fadeUp} className="border-t border-[var(--hairline)] py-10 first:border-t-0 first:pt-0">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr] lg:gap-12">
        <div>
          <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--hairline)] bg-ink-850 text-accent-300">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent-400">{eyebrow}</p>
          <h2 className="mt-1 text-xl">{title}</h2>
        </div>
        <div className="max-w-2xl">{children}</div>
      </div>
    </motion.section>
  );
}

const Paragraphs = ({ text }) =>
  String(text)
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((paragraph, index) => (
      <p key={index} className="mt-4 leading-relaxed text-ink-300 first:mt-0">
        {paragraph}
      </p>
    ));

function BulletList({ items, marker = 'dot' }) {
  if (!items?.length) return null;

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3 leading-relaxed text-ink-300">
          <span
            className={
              marker === 'number'
                ? 'mt-0.5 w-5 shrink-0 font-mono text-xs text-accent-400'
                : 'mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500'
            }
            aria-hidden="true"
          >
            {marker === 'number' ? String(index + 1).padStart(2, '0') : null}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ProjectDetail() {
  const { slug } = useParams();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['project', slug],
    queryFn: () => api.get(`/api/projects/${slug}`),
  });

  const project = data?.project;

  useEffect(() => {
    if (!project) return;

    applySeo({
      title: project.seoTitle || project.title,
      description: project.seoDescription || project.shortDescription,
      path: `/projects/${project.slug}`,
      image: project.coverImage || undefined,
      type: 'article',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: project.title,
        description: project.shortDescription,
        applicationCategory:
          project.category === 'Mobile' ? 'MobileApplication' : 'WebApplication',
        operatingSystem: project.category === 'Mobile' ? 'Android, iOS' : 'Web browser',
        url: project.liveUrl || absoluteUrl(`/projects/${project.slug}`),
        author: { '@type': 'Person', name: 'Hamza Idiris' },
        ...(project.technologies?.length
          ? { keywords: project.technologies.join(', ') }
          : {}),
      },
    });

    trackEvent('project_view', {
      projectId: project._id,
      path: `/projects/${project.slug}`,
      meta: { label: project.title },
    });
  }, [project]);

  if (isLoading) {
    return (
      <Container className="py-24">
        <LoadingState label="Loading project" rows={4} />
      </Container>
    );
  }

  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <Container className="py-24">
        {notFound ? (
          <EmptyState
            title="Project not found"
            description="This project either does not exist or has not been published yet."
            action={
              <Button to="/projects" variant="secondary">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to all projects
              </Button>
            }
          />
        ) : (
          <ErrorState
            title="This project could not be loaded"
            description="The API did not respond. Check that the server is running, then try again."
            onRetry={refetch}
          />
        )}
      </Container>
    );
  }

  const { related = [], next } = data;
  const hasStory =
    project.problem ||
    project.solution ||
    project.architecture ||
    project.features?.length ||
    project.challenges?.length ||
    project.lessonsLearned?.length;

  return (
    <>
      <Section className="pb-12 pt-10 sm:pt-14">
        <motion.div initial="hidden" animate="visible" variants={staggerChildren(0.07)}>
          <motion.div variants={fadeUp}>
            <Link
              to="/projects"
              className="inline-flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-ink-200"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              All projects
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center gap-2">
            <StatusBadge status={project.status} />
            {project.category ? <Badge tone="muted">{project.category}</Badge> : null}
            {project.year ? <Badge tone="muted">{project.year}</Badge> : null}
          </motion.div>

          <motion.h1 variants={fadeUp} className="mt-5 max-w-4xl text-4xl sm:text-5xl">
            {project.title}
          </motion.h1>

          {project.tagline ? (
            <motion.p variants={fadeUp} className="mt-3 font-mono text-sm text-accent-300">
              {project.tagline}
            </motion.p>
          ) : null}

          <motion.p variants={fadeUp} className="mt-6 max-w-3xl text-lg leading-relaxed text-ink-300">
            {project.shortDescription}
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            {project.liveUrl ? (
              <Button
                href={project.liveUrl}
                onClick={() =>
                  trackEvent('project_demo_click', {
                    projectId: project._id,
                    meta: { label: project.title },
                  })
                }
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                View live demo
              </Button>
            ) : project.status === 'in-progress' ? (
              <span className="inline-flex h-11 items-center gap-2 rounded-lg border border-amber-500/25 bg-amber-500/[0.07] px-5 text-sm text-amber-200">
                Currently in development
              </span>
            ) : null}

            {project.githubUrl ? (
              <Button
                href={project.githubUrl}
                variant="secondary"
                onClick={() =>
                  trackEvent('project_repo_click', {
                    projectId: project._id,
                    meta: { label: project.title },
                  })
                }
              >
                <GithubIcon className="h-4 w-4" />
                Source code
              </Button>
            ) : null}

            {project.videoUrl ? (
              <Button href={project.videoUrl} variant="outline">
                <Play className="h-4 w-4" aria-hidden="true" />
                Watch demo
              </Button>
            ) : null}
          </motion.div>

          {project.technologies?.length ? (
            <motion.ul variants={fadeUp} className="mt-8 flex flex-wrap gap-2">
              {project.technologies.map((technology) => (
                <li
                  key={technology}
                  className="rounded-lg border border-[var(--hairline)] bg-ink-850 px-3 py-1.5 font-mono text-xs text-ink-300"
                >
                  {technology}
                </li>
              ))}
            </motion.ul>
          ) : null}
        </motion.div>
      </Section>

      {project.coverImage ? (
        <Container>
          <motion.div
            {...revealOnScroll}
            variants={fadeUp}
            className="overflow-hidden rounded-2xl border border-[var(--hairline)] bg-ink-850"
          >
            <img
              src={resolveMediaUrl(project.coverImage)}
              alt={project.coverImageAlt || `${project.title} interface`}
              loading="lazy"
              decoding="async"
              className="w-full object-cover"
            />
          </motion.div>
        </Container>
      ) : null}

      {hasStory ? (
        <Section>
          <motion.div {...revealOnScroll} variants={staggerChildren(0.06)}>
            <StoryBlock icon={Target} eyebrow="01" title="The problem">
              {project.problem ? <Paragraphs text={project.problem} /> : null}
            </StoryBlock>

            <StoryBlock icon={Lightbulb} eyebrow="02" title="The solution">
              {project.solution ? <Paragraphs text={project.solution} /> : null}
            </StoryBlock>

            {project.users?.length ? (
              <StoryBlock icon={Users} eyebrow="03" title="Who uses it">
                <ul className="flex flex-wrap gap-2">
                  {project.users.map((user) => (
                    <li
                      key={user}
                      className="rounded-lg border border-[var(--hairline)] bg-ink-850 px-3 py-1.5 text-sm text-ink-300"
                    >
                      {user}
                    </li>
                  ))}
                </ul>
              </StoryBlock>
            ) : null}

            <StoryBlock icon={ListChecks} eyebrow="04" title="Key features">
              {project.features?.length ? <BulletList items={project.features} /> : null}
            </StoryBlock>

            <StoryBlock icon={Wrench} eyebrow="05" title="The build">
              {project.architecture || project.process ? (
                <>
                  {project.architecture ? <Paragraphs text={project.architecture} /> : null}
                  {project.process ? (
                    <div className="mt-6 rounded-xl border border-[var(--hairline)] bg-ink-850 p-5">
                      <p className="mb-2 font-mono text-xs uppercase tracking-[0.14em] text-ink-500">
                        Development process
                      </p>
                      <Paragraphs text={project.process} />
                    </div>
                  ) : null}
                </>
              ) : null}
            </StoryBlock>

            <StoryBlock icon={Wrench} eyebrow="06" title="The challenges">
              {project.challenges?.length ? (
                <BulletList items={project.challenges} marker="number" />
              ) : null}
            </StoryBlock>

            <StoryBlock icon={TrendingUp} eyebrow="07" title="What I learned">
              {project.lessonsLearned?.length ? <BulletList items={project.lessonsLearned} /> : null}
            </StoryBlock>

            <StoryBlock icon={TrendingUp} eyebrow="08" title="The outcome">
              {project.outcome ? <Paragraphs text={project.outcome} /> : null}
            </StoryBlock>
          </motion.div>
        </Section>
      ) : null}

      {project.screenshots?.length ? (
        <Section className="border-t border-[var(--hairline)]">
          <h2 className="text-2xl">Screens</h2>
          <motion.div
            {...revealOnScroll}
            variants={staggerChildren(0.08)}
            className="mt-8 grid gap-6 sm:grid-cols-2"
          >
            {project.screenshots.map((screenshot) => (
              <motion.figure
                key={screenshot.url}
                variants={fadeUp}
                className="overflow-hidden rounded-xl border border-[var(--hairline)] bg-ink-850"
              >
                <img
                  src={resolveMediaUrl(screenshot.url)}
                  alt={screenshot.alt || `${project.title} screenshot`}
                  loading="lazy"
                  decoding="async"
                  className="w-full object-cover"
                />
                {screenshot.caption ? (
                  <figcaption className="border-t border-[var(--hairline)] px-4 py-3 text-sm text-ink-500">
                    {screenshot.caption}
                  </figcaption>
                ) : null}
              </motion.figure>
            ))}
          </motion.div>
        </Section>
      ) : null}

      {next ? (
        <Section className="border-t border-[var(--hairline)] py-12">
          <Link
            to={`/projects/${next.slug}`}
            className="group flex flex-col gap-2 rounded-xl border border-[var(--hairline)] bg-ink-850 p-6 transition-colors hover:border-[var(--hairline-strong)] sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink-500">
                Next project
              </p>
              <p className="mt-1.5 text-xl text-ink-50">{next.title}</p>
            </div>
            <ArrowRight
              className="h-5 w-5 text-ink-500 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-accent-300"
              aria-hidden="true"
            />
          </Link>
        </Section>
      ) : null}

      {related.length ? (
        <Section className="border-t border-[var(--hairline)]">
          <h2 className="text-2xl">Related projects</h2>
          <motion.div
            {...revealOnScroll}
            variants={staggerChildren(0.08)}
            className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {related.map((item, index) => (
              <ProjectCard key={item._id} project={item} index={index} />
            ))}
          </motion.div>
        </Section>
      ) : null}
    </>
  );
}
