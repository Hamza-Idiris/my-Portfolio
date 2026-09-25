import { motion } from 'framer-motion';
import { cn } from '../../lib/cn.js';
import { fadeUp, revealOnScroll, staggerChildren } from '../../lib/motion.js';

export function Container({ className, children, ...props }) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8', className)} {...props}>
      {children}
    </div>
  );
}

export function Section({ id, className, containerClassName, children, ...props }) {
  return (
    <section id={id} className={cn('py-20 sm:py-24 lg:py-28', className)} {...props}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

export function SectionHeader({ eyebrow, title, description, align = 'left', action, className }) {
  return (
    <motion.div
      {...revealOnScroll}
      variants={staggerChildren(0.08)}
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center sm:text-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow ? (
          <motion.p
            variants={fadeUp}
            className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-accent-400"
          >
            {eyebrow}
          </motion.p>
        ) : null}
        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl">
          {title}
        </motion.h2>
        {description ? (
          <motion.p variants={fadeUp} className="mt-4 text-base leading-relaxed text-ink-300">
            {description}
          </motion.p>
        ) : null}
      </div>
      {action ? (
        <motion.div variants={fadeUp} className="shrink-0">
          {action}
        </motion.div>
      ) : null}
    </motion.div>
  );
}
