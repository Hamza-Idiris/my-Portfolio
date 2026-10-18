import { motion } from 'framer-motion';
import { Section, SectionHeader } from '../ui/Section.jsx';
import { fadeUp, revealOnScroll, staggerChildren } from '../../lib/motion.js';
import { EmptyState } from '../ui/States.jsx';

const CATEGORY_ORDER = ['Frontend', 'Backend', 'Database', 'Mobile', 'Tools', 'Other'];

export function TechStack({ skills = [], id = 'stack' }) {
  const grouped = skills.reduce((accumulator, skill) => {
    const key = skill.category || 'Other';
    accumulator[key] = accumulator[key] || [];
    accumulator[key].push(skill);
    return accumulator;
  }, {});

  const categories = Object.keys(grouped).sort(
    (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b),
  );

  return (
    <Section id={id} className="border-t border-[var(--hairline)]">
      <SectionHeader
        eyebrow="Tech stack"
        title="The tools I work with"
        description="Technologies I have used to build and ship the projects on this site."
      />

      {!categories.length ? (
        <EmptyState
          className="mt-10"
          title="No technologies listed yet"
          description="Technologies added from the admin dashboard will appear here."
        />
      ) : (
        <motion.div
          {...revealOnScroll}
          variants={staggerChildren(0.08)}
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {categories.map((category) => (
            <motion.div
              key={category}
              variants={fadeUp}
              className="surface rounded-[var(--radius-card)] p-6"
            >
              <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-accent-400">
                {category}
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {grouped[category].map((skill) => (
                  <li
                    key={skill._id || skill.name}
                    className={
                      skill.primary
                        ? 'rounded-lg border border-accent-500/30 bg-accent-500/10 dark:bg-accent-500/[0.07] px-2.5 py-1.5 text-sm font-medium text-accent-400 dark:text-accent-200'
                        : 'rounded-lg border border-[var(--hairline)] bg-ink-850 px-2.5 py-1.5 text-sm font-normal text-ink-300 dark:text-ink-200'
                    }
                    title={skill.description || undefined}
                  >
                    {skill.name}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      )}
    </Section>
  );
}
