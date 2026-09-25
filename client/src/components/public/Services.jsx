import { motion } from 'framer-motion';
import * as icons from 'lucide-react';
import { Code2 } from 'lucide-react';
import { Section, SectionHeader } from '../ui/Section.jsx';
import { fadeUp, revealOnScroll, staggerChildren } from '../../lib/motion.js';
import { EmptyState } from '../ui/States.jsx';

/** Icons are stored as lucide names so they stay editable from the dashboard. */
const resolveIcon = (name) => {
  const Icon = name && icons[name];
  return typeof Icon === 'function' || typeof Icon === 'object' ? Icon : Code2;
};

export function Services({ services = [], intro, id = 'what-i-build' }) {
  return (
    <Section id={id} className="border-t border-[var(--hairline)]">
      <SectionHeader
        eyebrow="What I build"
        title="Complete products, not just interfaces"
        description={
          intro || 'The kinds of work I take on, across the whole stack from data to deployment.'
        }
      />

      {!services.length ? (
        <EmptyState
          className="mt-10"
          title="No services listed yet"
          description="Services added from the admin dashboard will appear here."
        />
      ) : (
        <motion.ul
          {...revealOnScroll}
          variants={staggerChildren(0.06)}
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service) => {
            const Icon = resolveIcon(service.icon);
            return (
              <motion.li
                key={service._id || service.title}
                variants={fadeUp}
                className="surface group rounded-[var(--radius-card)] p-6 transition-colors duration-200 hover:border-[var(--hairline-strong)]"
              >
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--hairline)] bg-ink-850 text-accent-300 transition-colors group-hover:border-accent-500/30 group-hover:bg-accent-500/[0.07]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="text-base">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-400">{service.description}</p>
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </Section>
  );
}
