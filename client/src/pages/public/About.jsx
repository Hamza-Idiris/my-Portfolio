import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Download, MapPin } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../../components/ui/BrandIcons.jsx';
import { api } from '../../lib/api.js';
import { applySeo } from '../../lib/seo.js';
import { Container, Section, SectionHeader } from '../../components/ui/Section.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { EmptyState } from '../../components/ui/States.jsx';
import { TechStack } from '../../components/public/TechStack.jsx';
import { Journey } from '../../components/public/Journey.jsx';
import { Certifications } from '../../components/public/Certifications.jsx';
import { ContactCta } from '../../components/public/ContactCta.jsx';
import { ResumeButton } from '../../components/public/ResumeButton.jsx';
import { fadeUp, revealOnScroll, staggerChildren } from '../../lib/motion.js';
import { findSocial, useSiteSettings } from '../../hooks/useSiteSettings.js';
import { trackEvent } from '../../lib/analytics.js';

const Paragraphs = ({ text, className = 'mt-5 leading-relaxed text-ink-300 first:mt-0' }) =>
  String(text || '')
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((paragraph, index) => (
      <p key={index} className={className}>
        {paragraph}
      </p>
    ));

function TextSection({ eyebrow, title, text }) {
  if (!text) return null;

  return (
    <motion.div variants={fadeUp} className="border-t border-[var(--hairline)] py-10">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr] lg:gap-12">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent-400">{eyebrow}</p>
          <h2 className="mt-1 text-xl">{title}</h2>
        </div>
        <div className="max-w-2xl">
          <Paragraphs text={text} />
        </div>
      </div>
    </motion.div>
  );
}

export default function About() {
  const { settings } = useSiteSettings();
  const { profile, socialLinks, resume } = settings;

  const { data } = useQuery({
    queryKey: ['about-content'],
    queryFn: async () => {
      const [skills, journey, certifications] = await Promise.all([
        api.get('/api/skills'),
        api.get('/api/journey'),
        api.get('/api/certifications'),
      ]);
      return { skills: skills.items, journey: journey.items, certifications: certifications.items };
    },
  });

  const github = findSocial(socialLinks, 'github');
  const linkedin = findSocial(socialLinks, 'linkedin');

  useEffect(() => {
    applySeo({
      title: 'About',
      description:
        'Hamza Idiris is a full stack web and mobile developer working with React, Node.js, Express, MongoDB and Flutter to build complete, practical applications.',
      path: '/about',
    });
  }, []);

  const hasWrittenContent =
    profile.bio || profile.whatIBuild || profile.philosophy || profile.currentFocus;

  return (
    <>
      <Section className="pb-10 pt-16 sm:pt-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerChildren(0.08)}
          className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16"
        >
          <div>
            <motion.p
              variants={fadeUp}
              className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-accent-400"
            >
              About
            </motion.p>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl">
              {profile.name}
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-3 font-mono text-sm text-ink-400">
              {profile.title}
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="mt-7 max-w-2xl text-lg leading-relaxed text-ink-200"
            >
              {profile.shortBio}
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
              <ResumeButton resume={resume} location="about">
                <Button as="span" variant="secondary">
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download CV
                </Button>
              </ResumeButton>
              {github ? (
                <Button
                  href={github.url}
                  variant="outline"
                  onClick={() => trackEvent('github_click', { meta: { location: 'about' } })}
                >
                  <GithubIcon className="h-4 w-4" />
                  GitHub
                </Button>
              ) : null}
              {linkedin ? (
                <Button
                  href={linkedin.url}
                  variant="outline"
                  onClick={() => trackEvent('linkedin_click', { meta: { location: 'about' } })}
                >
                  <LinkedinIcon className="h-4 w-4" />
                  LinkedIn
                </Button>
              ) : null}
            </motion.div>
          </div>

          <motion.div variants={fadeUp}>
            <div className="surface overflow-hidden rounded-2xl">
              <div className="aspect-square bg-ink-850">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={`${profile.name}, ${profile.title}`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_35%,var(--color-ink-750),var(--color-ink-900))]">
                    <span className="font-mono text-5xl font-semibold tracking-tighter text-ink-700">
                      HI
                    </span>
                  </div>
                )}
              </div>
              <dl className="divide-y divide-[var(--hairline)] text-sm">
                {profile.availabilityEnabled && profile.availability ? (
                  <div className="flex items-center justify-between gap-4 px-5 py-3.5">
                    <dt className="text-ink-500">Status</dt>
                    <dd className="text-accent-300">{profile.availability}</dd>
                  </div>
                ) : null}
                {profile.location ? (
                  <div className="flex items-center justify-between gap-4 px-5 py-3.5">
                    <dt className="text-ink-500">Location</dt>
                    <dd className="inline-flex items-center gap-1.5 text-ink-200">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {profile.location}
                    </dd>
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <dt className="text-ink-500">Focus</dt>
                  <dd className="text-right text-ink-200">MERN &amp; Flutter</dd>
                </div>
              </dl>
            </div>
          </motion.div>
        </motion.div>
      </Section>

      <Section className="py-0">
        {hasWrittenContent ? (
          <motion.div {...revealOnScroll} variants={staggerChildren(0.06)}>
            <TextSection eyebrow="01" title="Who I am" text={profile.bio} />
            <TextSection eyebrow="02" title="What I build" text={profile.whatIBuild} />
            <TextSection eyebrow="03" title="How I work" text={profile.philosophy} />
            <TextSection eyebrow="04" title="Current focus" text={profile.currentFocus} />
            <TextSection eyebrow="05" title="Where I am heading" text={profile.futureGoals} />
          </motion.div>
        ) : (
          <div className="py-10">
            <EmptyState
              title="This section has not been written yet"
              description="Add your bio, philosophy and current focus from Admin → Profile and they will appear here."
            />
          </div>
        )}
      </Section>

      <TechStack skills={data?.skills || []} />

      <Journey journey={data?.journey || []} />

      <Certifications certifications={data?.certifications || []} />

      <ContactCta title={settings.home.ctaTitle} description={settings.home.ctaDescription} />
    </>
  );
}
