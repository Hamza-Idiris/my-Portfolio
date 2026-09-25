import { motion } from 'framer-motion';
import { Section, SectionHeader } from '../ui/Section.jsx';
import { fadeUp, revealOnScroll, staggerChildren } from '../../lib/motion.js';
import { EmptyState } from '../ui/States.jsx';

export function Journey({ journey = [], id = 'journey' }) {
  return (
    <Section id={id} className="border-t border-[var(--hairline)]">
      <SectionHeader
        eyebrow="Development journey"
        title="How I got here"
        description="Each step came from building something, not from finishing a course."
      />

      {!journey.length ? (
        <EmptyState
          className="mt-10"
          title="No journey entries yet"
          description="Milestones added from the admin dashboard will appear here."
        />
      ) : (
        <motion.ol
          {...revealOnScroll}
          variants={staggerChildren(0.07)}
          className="relative mt-12 border-l border-[var(--hairline)] pl-8 sm:pl-10"
        >
          {journey.map((entry) => (
            <motion.li key={entry._id || entry.title} variants={fadeUp} className="relative pb-10 last:pb-0">
              <span
                className={
                  entry.current
                    ? 'absolute -left-[41px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-accent-400 bg-ink-900 sm:-left-[49px]'
                    : 'absolute -left-[38px] top-1.5 h-2.5 w-2.5 rounded-full border border-ink-600 bg-ink-750 sm:-left-[46px]'
                }
                aria-hidden="true"
              >
                {entry.current ? <span className="h-1.5 w-1.5 rounded-full bg-accent-400" /> : null}
              </span>

              {entry.period ? (
                <p className="mb-1 font-mono text-xs uppercase tracking-[0.14em] text-accent-400">
                  {entry.period}
                </p>
              ) : null}
              <h3 className="text-base">{entry.title}</h3>
              {entry.description ? (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-400">
                  {entry.description}
                </p>
              ) : null}
            </motion.li>
          ))}
        </motion.ol>
      )}
    </Section>
  );
}
