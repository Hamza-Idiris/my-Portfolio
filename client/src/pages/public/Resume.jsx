import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Download, FileText, Mail } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../../components/ui/BrandIcons.jsx';
import { api } from '../../lib/api.js';
import { applySeo } from '../../lib/seo.js';
import { Section } from '../../components/ui/Section.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { EmptyState } from '../../components/ui/States.jsx';
import { ContactCta } from '../../components/public/ContactCta.jsx';
import { fadeUp, staggerChildren } from '../../lib/motion.js';
import { findSocial, useSiteSettings } from '../../hooks/useSiteSettings.js';
import { formatDate } from '../../lib/format.js';
import { trackEvent } from '../../lib/analytics.js';

const CATEGORY_ORDER = ['Frontend', 'Backend', 'Database', 'Mobile', 'Tools', 'Other'];

export default function Resume() {
  const { settings } = useSiteSettings();
  const { profile, resume, socialLinks } = settings;

  const { data } = useQuery({
    queryKey: ['resume-content'],
    queryFn: async () => {
      const [skills, projects] = await Promise.all([
        api.get('/api/skills'),
        api.get('/api/projects'),
      ]);
      return { skills: skills.grouped, projects: projects.items };
    },
  });

  const github = findSocial(socialLinks, 'github');
  const linkedin = findSocial(socialLinks, 'linkedin');
  const email = settings.contact.email || profile.email;

  useEffect(() => {
    applySeo({
      title: 'Resume',
      description: `Resume of ${profile.name}, ${profile.title}, working with React, Node.js, Express, MongoDB and Flutter.`,
      path: '/resume',
    });
  }, [profile.name, profile.title]);

  const grouped = data?.skills || {};
  const categories = Object.keys(grouped).sort(
    (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b),
  );

  return (
    <>
      <Section className="pt-16 sm:pt-20">
        <motion.div initial="hidden" animate="visible" variants={staggerChildren(0.08)}>
          <motion.p
            variants={fadeUp}
            className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-accent-400"
          >
            Resume
          </motion.p>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl">
            {profile.name}
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-3 font-mono text-sm text-ink-400">
            {profile.title}
          </motion.p>

          {resume.summary || profile.shortBio ? (
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300"
            >
              {resume.summary || profile.shortBio}
            </motion.p>
          ) : null}

          <motion.div variants={fadeUp} className="mt-8">
            {resume.url ? (
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  href={resume.url}
                  size="lg"
                  download={resume.fileName || 'hamza-idiris-cv.pdf'}
                  onClick={() => trackEvent('cv_download', { meta: { location: 'resume_page' } })}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download resume
                </Button>
                {resume.updatedAt ? (
                  <span className="font-mono text-xs text-ink-600">
                    Updated {formatDate(resume.updatedAt)}
                  </span>
                ) : null}
              </div>
            ) : (
              <EmptyState
                icon={FileText}
                className="max-w-2xl"
                title="No resume file uploaded yet"
                description="A downloadable PDF has not been added. In the meantime, the summary below covers the same ground, and the projects section has the detail."
                action={
                  <Button to="/projects" variant="secondary">
                    View my projects instead
                  </Button>
                }
              />
            )}
          </motion.div>

          <motion.ul variants={fadeUp} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {email ? (
              <li>
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-2 text-ink-400 transition-colors hover:text-ink-100"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {email}
                </a>
              </li>
            ) : null}
            {github ? (
              <li>
                <a
                  href={github.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('github_click', { meta: { location: 'resume' } })}
                  className="inline-flex items-center gap-2 text-ink-400 transition-colors hover:text-ink-100"
                >
                  <GithubIcon className="h-4 w-4" />
                  GitHub
                </a>
              </li>
            ) : null}
            {linkedin ? (
              <li>
                <a
                  href={linkedin.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('linkedin_click', { meta: { location: 'resume' } })}
                  className="inline-flex items-center gap-2 text-ink-400 transition-colors hover:text-ink-100"
                >
                  <LinkedinIcon className="h-4 w-4" />
                  LinkedIn
                </a>
              </li>
            ) : null}
          </motion.ul>
        </motion.div>
      </Section>

      {categories.length ? (
        <Section className="border-t border-[var(--hairline)]">
          <h2 className="text-2xl">Technical skills</h2>
          <dl className="mt-8 space-y-6">
            {categories.map((category) => (
              <div key={category} className="grid gap-2 sm:grid-cols-[160px_1fr] sm:gap-6">
                <dt className="font-mono text-xs uppercase tracking-[0.14em] text-accent-400 sm:pt-1">
                  {category}
                </dt>
                <dd className="text-ink-300">
                  {grouped[category].map((skill) => skill.name).join(' · ')}
                </dd>
              </div>
            ))}
          </dl>
        </Section>
      ) : null}

      {data?.projects?.length ? (
        <Section className="border-t border-[var(--hairline)]">
          <h2 className="text-2xl">Selected projects</h2>
          <ul className="mt-8 space-y-8">
            {data.projects.map((project) => (
              <li key={project._id} className="grid gap-2 sm:grid-cols-[160px_1fr] sm:gap-6">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-500 sm:pt-1">
                  {project.category} · {project.status === 'in-progress' ? 'In progress' : 'Completed'}
                </p>
                <div>
                  <h3 className="text-lg">{project.title}</h3>
                  <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-400">
                    {project.shortDescription}
                  </p>
                  <p className="mt-2 font-mono text-xs text-ink-600">
                    {project.technologies?.join(' · ')}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <ContactCta title={settings.home.ctaTitle} description={settings.home.ctaDescription} />
    </>
  );
}
