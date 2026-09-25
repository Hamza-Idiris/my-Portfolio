import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { GithubIcon } from '../../components/ui/BrandIcons.jsx';
import { api } from '../../lib/api.js';
import { applySeo, absoluteUrl } from '../../lib/seo.js';
import { SITE_DEFAULTS } from '../../lib/siteDefaults.js';
import { Button } from '../../components/ui/Button.jsx';
import { Container, Section, SectionHeader } from '../../components/ui/Section.jsx';
import { EmptyState, ErrorState, LoadingState, Skeleton } from '../../components/ui/States.jsx';
import { Hero } from '../../components/public/Hero.jsx';
import { ProjectCard } from '../../components/public/ProjectCard.jsx';
import { UpdateCard } from '../../components/public/UpdateCard.jsx';
import { TechStack } from '../../components/public/TechStack.jsx';
import { Services } from '../../components/public/Services.jsx';
import { Journey } from '../../components/public/Journey.jsx';
import { Certifications } from '../../components/public/Certifications.jsx';
import { ContactCta } from '../../components/public/ContactCta.jsx';
import { fadeUp, revealOnScroll, staggerChildren } from '../../lib/motion.js';
import { findSocial } from '../../hooks/useSiteSettings.js';
import { trackEvent } from '../../lib/analytics.js';

const mergeSettings = (data) => ({
  ...SITE_DEFAULTS,
  ...(data || {}),
  profile: { ...SITE_DEFAULTS.profile, ...(data?.profile || {}) },
  resume: { ...SITE_DEFAULTS.resume, ...(data?.resume || {}) },
  home: { ...SITE_DEFAULTS.home, ...(data?.home || {}) },
  socialLinks: data?.socialLinks?.length ? data.socialLinks : SITE_DEFAULTS.socialLinks,
});

function CurrentlyBuilding({ text, github }) {
  if (!text) return null;

  return (
    <Section className="border-t border-[var(--hairline)] py-14 sm:py-16">
      <motion.div
        {...revealOnScroll}
        variants={staggerChildren(0.08)}
        className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="max-w-2xl">
          <motion.p
            variants={fadeUp}
            className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-accent-400"
          >
            Currently building
          </motion.p>
          <motion.p variants={fadeUp} className="text-lg leading-relaxed text-ink-200">
            {text}
          </motion.p>
        </div>
        {github ? (
          <motion.div variants={fadeUp}>
            <Button
              href={github.url}
              variant="outline"
              onClick={() => trackEvent('github_click', { meta: { location: 'currently_building' } })}
            >
              <GithubIcon className="h-4 w-4" />
              Follow the work on GitHub
            </Button>
          </motion.div>
        ) : null}
      </motion.div>
    </Section>
  );
}

function AboutPreview({ profile }) {
  return (
    <Section className="border-t border-[var(--hairline)]">
      <motion.div
        {...revealOnScroll}
        variants={staggerChildren(0.08)}
        className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16"
      >
        <div>
          <motion.p
            variants={fadeUp}
            className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-accent-400"
          >
            About
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl">
            The person behind the code
          </motion.h2>
        </div>
        <div>
          <motion.p variants={fadeUp} className="text-lg leading-relaxed text-ink-200">
            {profile.shortBio}
          </motion.p>
          {profile.philosophy ? (
            <motion.p variants={fadeUp} className="mt-5 leading-relaxed text-ink-400">
              {profile.philosophy}
            </motion.p>
          ) : null}
          <motion.div variants={fadeUp} className="mt-8">
            <Button to="/about" variant="secondary">
              More about me
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </Section>
  );
}

export default function Home() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['home'],
    queryFn: () => api.get('/api/home'),
  });

  const settings = mergeSettings(data?.settings);
  const projects = data?.projects || [];
  const posts = data?.posts || [];
  const github = findSocial(settings.socialLinks, 'github');
  const linkedin = findSocial(settings.socialLinks, 'linkedin');

  useEffect(() => {
    applySeo({
      title: settings.seo?.defaultTitle || SITE_DEFAULTS.seo.defaultTitle,
      description: settings.seo?.defaultDescription || SITE_DEFAULTS.seo.defaultDescription,
      path: '/',
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: settings.profile.name,
          jobTitle: settings.profile.title,
          description: settings.profile.shortBio,
          url: absoluteUrl('/'),
          ...(settings.profile.avatarUrl ? { image: settings.profile.avatarUrl } : {}),
          ...(settings.profile.location ? { address: settings.profile.location } : {}),
          knowsAbout: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Flutter', 'REST APIs'],
          sameAs: settings.socialLinks.map((link) => link.url),
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: settings.profile.name,
          url: absoluteUrl('/'),
        },
      ],
    });
  }, [settings, github, linkedin]);

  if (isError) {
    return (
      <Container className="py-24">
        <ErrorState
          title="The site content could not be loaded"
          description="The API did not respond. Check that the server is running, then try again."
          onRetry={refetch}
        />
      </Container>
    );
  }

  return (
    <>
      <Hero settings={settings} />

      <Section id="selected-work" className="border-t border-[var(--hairline)]">
        <SectionHeader
          eyebrow="Selected projects"
          title="Real products. Real problems. Real code."
          description="Each of these started from a problem someone actually has. Open one to read how it was built."
          action={
            <Button to="/projects" variant="outline">
              All projects
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          }
        />

        {isLoading ? (
          <div className="mt-12 grid gap-6">
            <Skeleton className="h-72 w-full" />
            <div className="grid gap-6 sm:grid-cols-2">
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-80 w-full" />
            </div>
          </div>
        ) : !projects.length ? (
          <EmptyState
            className="mt-12"
            title="No projects published yet"
            description="Projects published from the admin dashboard will appear here."
          />
        ) : (
          <motion.div {...revealOnScroll} variants={staggerChildren(0.1)} className="mt-12 space-y-6">
            <ProjectCard project={projects[0]} featured index={0} />
            {projects.length > 1 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {projects.slice(1, 3).map((project, index) => (
                  <ProjectCard key={project._id} project={project} index={index + 1} />
                ))}
              </div>
            ) : null}
          </motion.div>
        )}
      </Section>

      <Services services={data?.services || []} intro={settings.home?.whatIBuildIntro} />

      <TechStack skills={data?.skills || []} />

      <Journey journey={data?.journey || []} />

      <Certifications certifications={data?.certifications || []} />

      <Section id="updates" className="border-t border-[var(--hairline)]">
        <SectionHeader
          eyebrow="Latest updates"
          title="What I have been working on"
          description="Short notes on what I built, what broke, and what I learned fixing it."
          action={
            <Button to="/updates" variant="outline">
              All updates
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          }
        />

        {isLoading ? (
          <LoadingState className="mt-12" rows={1} />
        ) : !posts.length ? (
          <EmptyState
            className="mt-12"
            title="No updates published yet"
            description="Development updates written from the admin dashboard will appear here."
          />
        ) : (
          <motion.div
            {...revealOnScroll}
            variants={staggerChildren(0.08)}
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {posts.map((post) => (
              <UpdateCard key={post._id} post={post} />
            ))}
          </motion.div>
        )}
      </Section>

      <CurrentlyBuilding text={settings.profile.currentlyBuilding} github={github} />

      <AboutPreview profile={settings.profile} />

      <ContactCta title={settings.home.ctaTitle} description={settings.home.ctaDescription} />
    </>
  );
}
