import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { applySeo } from '../../lib/seo.js';
import { Section } from '../../components/ui/Section.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { NAV_LINKS } from '../../lib/siteDefaults.js';
import { fadeUp, staggerChildren } from '../../lib/motion.js';

export default function NotFound() {
  useEffect(() => {
    applySeo({
      title: 'Page not found',
      description: 'This page does not exist.',
      noIndex: true,
    });
  }, []);

  return (
    <Section className="pt-20">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerChildren(0.08)}
        className="mx-auto max-w-xl text-center"
      >
        <motion.p
          variants={fadeUp}
          className="font-mono text-sm uppercase tracking-[0.2em] text-accent-400"
        >
          404
        </motion.p>
        <motion.h1 variants={fadeUp} className="mt-4 text-4xl sm:text-5xl">
          This page does not exist
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-5 leading-relaxed text-ink-400">
          The address you followed does not match anything on this site. It may have been moved, or
          the link may have been mistyped.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-9 flex flex-wrap justify-center gap-3">
          <Button to="/" size="lg">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Button>
          <Button to="/projects" variant="secondary" size="lg">
            View projects
          </Button>
        </motion.div>

        <motion.nav variants={fadeUp} aria-label="Site sections" className="mt-12">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-ink-600">
            Or try one of these
          </p>
          <ul className="flex flex-wrap justify-center gap-2">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Button to={link.to} variant="outline" size="sm">
                  {link.label}
                </Button>
              </li>
            ))}
          </ul>
        </motion.nav>
      </motion.div>
    </Section>
  );
}
