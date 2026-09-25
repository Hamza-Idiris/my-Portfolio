import { motion } from 'framer-motion';
import { ArrowRight, Download, MapPin } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../ui/BrandIcons.jsx';
import { Button } from '../ui/Button.jsx';
import { Container } from '../ui/Section.jsx';
import { fadeUp, staggerChildren } from '../../lib/motion.js';
import { findSocial } from '../../hooks/useSiteSettings.js';
import { trackEvent } from '../../lib/analytics.js';
import { ResumeButton } from './ResumeButton.jsx';

const STACK = ['React', 'Node.js', 'Express', 'MongoDB', 'Flutter'];

function AvailabilityPill({ label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-accent-500/25 bg-accent-500/[0.07] px-3 py-1.5 text-xs font-medium text-accent-300">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-400" />
      </span>
      {label}
    </span>
  );
}

/**
 * The visual pairs the profile photo with the stack he actually works in.
 * When no photo has been uploaded yet it degrades to a typographic monogram
 * rather than a stock image or a fake terminal.
 */
function ProfileVisual({ profile }) {
  return (
    <motion.div variants={fadeUp} className="relative mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-[var(--hairline)] bg-ink-850">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={`${profile.name}, ${profile.title}`}
            width="480"
            height="600"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_50%_30%,var(--color-ink-750),var(--color-ink-900))]">
            <span className="font-mono text-6xl font-semibold tracking-tighter text-ink-700">
              HI
            </span>
            <p className="px-8 text-center text-xs leading-relaxed text-ink-600">
              Add a profile photo from the admin dashboard
            </p>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink-950 to-transparent" />
      </div>

      <div className="absolute -bottom-5 left-1/2 w-[88%] -translate-x-1/2 rounded-xl border border-[var(--hairline)] bg-ink-800/95 p-3 backdrop-blur-sm">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">
          Primary stack
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {STACK.map((item) => (
            <li
              key={item}
              className="rounded-md border border-[var(--hairline)] bg-ink-850 px-2 py-1 font-mono text-[11px] text-ink-300"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export function Hero({ settings }) {
  const { profile, socialLinks, resume } = settings;
  const github = findSocial(socialLinks, 'github');
  const linkedin = findSocial(socialLinks, 'linkedin');

  return (
    <section className="glow-accent relative overflow-hidden pt-14 pb-24 sm:pt-20 lg:pt-24 lg:pb-32">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

      <Container className="relative">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerChildren(0.09, 0.05)}
          className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16"
        >
          <div>
            {profile.availabilityEnabled && profile.availability ? (
              <motion.div variants={fadeUp} className="mb-6">
                <AvailabilityPill label={profile.availability} />
              </motion.div>
            ) : null}

            <motion.h1
              variants={fadeUp}
              className="text-4xl leading-[1.08] sm:text-5xl lg:text-6xl"
            >
              {profile.name}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-3 font-mono text-sm text-accent-300 sm:text-base"
            >
              {profile.title}
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="mt-7 max-w-xl text-xl font-medium leading-snug text-ink-100 sm:text-2xl"
            >
              {profile.tagline}
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="mt-5 max-w-xl text-base leading-relaxed text-ink-400"
            >
              {profile.shortBio}
            </motion.p>

            <motion.div variants={fadeUp} className="mt-9 flex flex-wrap gap-3">
              <Button
                to="/projects"
                size="lg"
                onClick={() => trackEvent('cta_click', { meta: { label: 'View my work' } })}
              >
                View my work
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                to="/contact"
                variant="secondary"
                size="lg"
                onClick={() =>
                  trackEvent('cta_click', { meta: { label: "Let's work together" } })
                }
              >
                Let&rsquo;s work together
              </Button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm"
            >
              {github ? (
                <a
                  href={github.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('github_click', { meta: { location: 'hero' } })}
                  className="inline-flex items-center gap-2 text-ink-400 transition-colors hover:text-ink-100"
                >
                  <GithubIcon className="h-4 w-4" />
                  GitHub
                </a>
              ) : null}
              {linkedin ? (
                <a
                  href={linkedin.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('linkedin_click', { meta: { location: 'hero' } })}
                  className="inline-flex items-center gap-2 text-ink-400 transition-colors hover:text-ink-100"
                >
                  <LinkedinIcon className="h-4 w-4" />
                  LinkedIn
                </a>
              ) : null}
              <ResumeButton
                resume={resume}
                location="hero"
                className="inline-flex items-center gap-2 text-ink-400 transition-colors hover:text-ink-100"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download CV
              </ResumeButton>
              {profile.location ? (
                <span className="inline-flex items-center gap-2 text-ink-500">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {profile.location}
                </span>
              ) : null}
            </motion.div>
          </div>

          <ProfileVisual profile={profile} />
        </motion.div>
      </Container>
    </section>
  );
}
