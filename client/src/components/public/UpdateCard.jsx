import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { fadeUp } from '../../lib/motion.js';
import { formatDate } from '../../lib/format.js';
import { resolveMediaUrl } from '../../lib/api.js';

export function UpdateCard({ post, compact = false }) {
  return (
    <motion.article
      variants={fadeUp}
      className="group surface relative flex flex-col overflow-hidden rounded-[var(--radius-card)] transition-colors duration-200 hover:border-[var(--hairline-strong)]"
    >
      {!compact && post.coverImage ? (
        <div className="aspect-[16/9] overflow-hidden bg-ink-850">
          <img
            src={resolveMediaUrl(post.coverImage)}
            alt={post.coverImageAlt || ''}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {post.category ? <Badge tone="accent">{post.category}</Badge> : null}
          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-500">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {post.readingTime || 1} min read
          </span>
        </div>

        <h3 className="text-lg leading-snug">
          <Link to={`/updates/${post.slug}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>

        {post.excerpt ? (
          <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ink-400 line-clamp-3">
            {post.excerpt}
          </p>
        ) : null}

        <p className="mt-5 font-mono text-xs text-ink-600">
          {formatDate(post.publishedAt || post.createdAt)}
        </p>
      </div>
    </motion.article>
  );
}
