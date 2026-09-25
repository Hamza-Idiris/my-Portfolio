import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { Container } from '../ui/Section.jsx';
import { fadeUp, revealOnScroll, staggerChildren } from '../../lib/motion.js';
import { trackEvent } from '../../lib/analytics.js';

export function ContactCta({ title, description }) {
  return (
    <section className="border-t border-[var(--hairline)] py-20 sm:py-24">
      <Container>
        <motion.div
          {...revealOnScroll}
          variants={staggerChildren(0.08)}
          className="glow-accent relative overflow-hidden rounded-2xl border border-[var(--hairline)] bg-ink-850 px-6 py-14 text-center sm:px-12 sm:py-16"
        >
          <div className="relative">
            <motion.h2 variants={fadeUp} className="mx-auto max-w-2xl text-3xl sm:text-4xl">
              {title}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-4 max-w-xl text-lg text-ink-300"
            >
              {description}
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="mt-9 flex flex-wrap justify-center gap-3"
            >
              <Button
                to="/contact"
                size="lg"
                onClick={() => trackEvent('cta_click', { meta: { label: 'Get in touch' } })}
              >
                Get in touch
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button to="/projects" variant="outline" size="lg">
                View my work
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
