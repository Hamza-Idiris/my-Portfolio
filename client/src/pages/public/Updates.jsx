import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '../../lib/api.js';
import { applySeo } from '../../lib/seo.js';
import { Section } from '../../components/ui/Section.jsx';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/States.jsx';
import { UpdateCard } from '../../components/public/UpdateCard.jsx';
import { ContactCta } from '../../components/public/ContactCta.jsx';
import { fadeUp, revealOnScroll, staggerChildren } from '../../lib/motion.js';
import { cn } from '../../lib/cn.js';
import { useSiteSettings } from '../../hooks/useSiteSettings.js';

export default function Updates() {
  const [category, setCategory] = useState('');
  const { settings } = useSiteSettings();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['posts'],
    queryFn: () => api.get('/api/posts'),
  });

  useEffect(() => {
    applySeo({
      title: 'Updates',
      description:
        'Development updates from Hamza Idiris: what he built, what he learned, and the problems he solved along the way.',
      path: '/updates',
    });
  }, []);

  const items = data?.items || [];
  const categories = data?.facets?.categories || [];

  const filtered = useMemo(
    () => (category ? items.filter((post) => post.category === category) : items),
    [items, category],
  );

  return (
    <>
      <Section className="pb-10 pt-16 sm:pt-20">
        <motion.div initial="hidden" animate="visible" variants={staggerChildren(0.08)}>
          <motion.p
            variants={fadeUp}
            className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-accent-400"
          >
            Updates
          </motion.p>
          <motion.h1 variants={fadeUp} className="max-w-3xl text-4xl sm:text-5xl">
            Notes from the build
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-400">
            Short write-ups on what I am building, what broke along the way, and what I took from
            fixing it.
          </motion.p>
        </motion.div>
      </Section>

      {categories.length ? (
        <Section className="py-0">
          <div className="flex flex-wrap items-center gap-2 border-y border-[var(--hairline)] py-5">
            {[{ value: '', label: 'All' }, ...categories.map((name) => ({ value: name, label: name }))].map(
              (option) => {
                const active = category === option.value;
                return (
                  <button
                    key={option.value || 'all'}
                    type="button"
                    onClick={() => setCategory(option.value)}
                    aria-pressed={active}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm transition-colors',
                      active
                        ? 'border-accent-500/40 bg-accent-500/10 text-accent-200'
                        : 'border-[var(--hairline)] text-ink-400 hover:border-[var(--hairline-strong)] hover:text-ink-100',
                    )}
                  >
                    {option.label}
                  </button>
                );
              },
            )}
          </div>
        </Section>
      ) : null}

      <Section className="pt-12">
        {isError ? (
          <ErrorState
            title="Updates could not be loaded"
            description="The API did not respond. Check that the server is running, then try again."
            onRetry={refetch}
          />
        ) : isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-72 w-full" />
            ))}
          </div>
        ) : !items.length ? (
          <EmptyState
            title="No updates published yet"
            description="Development updates written from the admin dashboard will appear here."
          />
        ) : !filtered.length ? (
          <EmptyState
            title="No updates in this category"
            description="Try another category."
          />
        ) : (
          <motion.div
            {...revealOnScroll}
            key={category}
            variants={staggerChildren(0.07)}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((post) => (
              <UpdateCard key={post._id} post={post} />
            ))}
          </motion.div>
        )}
      </Section>

      <ContactCta title={settings.home.ctaTitle} description={settings.home.ctaDescription} />
    </>
  );
}
