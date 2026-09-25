import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock } from 'lucide-react';
import { api, ApiError, resolveMediaUrl } from '../../lib/api.js';
import { applySeo, absoluteUrl } from '../../lib/seo.js';
import { Container, Section } from '../../components/ui/Section.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States.jsx';
import { Markdown } from '../../components/public/Markdown.jsx';
import { UpdateCard } from '../../components/public/UpdateCard.jsx';
import { fadeUp, revealOnScroll, staggerChildren } from '../../lib/motion.js';
import { formatDate } from '../../lib/format.js';
import { trackEvent } from '../../lib/analytics.js';

export default function UpdateDetail() {
  const { slug } = useParams();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => api.get(`/api/posts/${slug}`),
  });

  const post = data?.post;

  useEffect(() => {
    if (!post) return;

    applySeo({
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      path: `/updates/${post.slug}`,
      image: post.coverImage || undefined,
      type: 'article',
      publishedTime: post.publishedAt,
      tags: post.tags,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt || post.publishedAt,
        author: { '@type': 'Person', name: post.author || 'Hamza Idiris' },
        mainEntityOfPage: absoluteUrl(`/updates/${post.slug}`),
        ...(post.coverImage ? { image: post.coverImage } : {}),
        ...(post.tags?.length ? { keywords: post.tags.join(', ') } : {}),
      },
    });

    trackEvent('update_view', {
      postId: post._id,
      path: `/updates/${post.slug}`,
      meta: { label: post.title },
    });
  }, [post]);

  if (isLoading) {
    return (
      <Container className="py-24">
        <LoadingState label="Loading update" rows={3} />
      </Container>
    );
  }

  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <Container className="py-24">
        {notFound ? (
          <EmptyState
            title="Update not found"
            description="This update either does not exist or has not been published yet."
            action={
              <Button to="/updates" variant="secondary">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to all updates
              </Button>
            }
          />
        ) : (
          <ErrorState
            title="This update could not be loaded"
            description="The API did not respond. Check that the server is running, then try again."
            onRetry={refetch}
          />
        )}
      </Container>
    );
  }

  const related = data?.related || [];

  return (
    <>
      <article>
        <Section className="pb-8 pt-10 sm:pt-14">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerChildren(0.07)}
            className="mx-auto max-w-3xl"
          >
            <motion.div variants={fadeUp}>
              <Link
                to="/updates"
                className="inline-flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-ink-200"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                All updates
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center gap-3">
              {post.category ? <Badge tone="accent">{post.category}</Badge> : null}
              <span className="font-mono text-xs text-ink-500">
                {formatDate(post.publishedAt || post.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-500">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {post.readingTime || 1} min read
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="mt-5 text-3xl leading-tight sm:text-4xl">
              {post.title}
            </motion.h1>

            {post.excerpt ? (
              <motion.p variants={fadeUp} className="mt-4 text-lg leading-relaxed text-ink-400">
                {post.excerpt}
              </motion.p>
            ) : null}

            <motion.p variants={fadeUp} className="mt-6 text-sm text-ink-500">
              By {post.author || 'Hamza Idiris'}
            </motion.p>
          </motion.div>
        </Section>

        {post.coverImage ? (
          <Container>
            <motion.div
              {...revealOnScroll}
              variants={fadeUp}
              className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-[var(--hairline)] bg-ink-850"
            >
              <img
                src={resolveMediaUrl(post.coverImage)}
                alt={post.coverImageAlt || ''}
                loading="lazy"
                decoding="async"
                className="w-full object-cover"
              />
            </motion.div>
          </Container>
        ) : null}

        <Section className="pt-10">
          <div className="mx-auto max-w-3xl">
            {post.content ? (
              <Markdown content={post.content} />
            ) : (
              <EmptyState
                title="This update has no content yet"
                description="The body of this post has not been written."
              />
            )}

            {post.tags?.length ? (
              <ul className="mt-12 flex flex-wrap gap-2 border-t border-[var(--hairline)] pt-8">
                {post.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-lg border border-[var(--hairline)] bg-ink-850 px-3 py-1.5 font-mono text-xs text-ink-400"
                  >
                    #{tag}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </Section>
      </article>

      {related.length ? (
        <Section className="border-t border-[var(--hairline)]">
          <h2 className="text-2xl">Related updates</h2>
          <motion.div
            {...revealOnScroll}
            variants={staggerChildren(0.08)}
            className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {related.map((item) => (
              <UpdateCard key={item._id} post={item} />
            ))}
          </motion.div>
        </Section>
      ) : null}
    </>
  );
}
