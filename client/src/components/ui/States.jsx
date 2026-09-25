import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { Button } from './Button.jsx';

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-[linear-gradient(90deg,var(--color-ink-800),var(--color-ink-750),var(--color-ink-800))] bg-[length:200%_100%]',
        className,
      )}
      aria-hidden="true"
    />
  );
}

export function LoadingState({ label = 'Loading', className, rows = 3 }) {
  return (
    <div className={cn('space-y-4', className)} role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-24 w-full" />
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <div
      className={cn(
        'surface flex flex-col items-center justify-center rounded-[var(--radius-card)] px-6 py-14 text-center',
        className,
      )}
    >
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ink-750 text-ink-400">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="text-lg">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-400">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'The content could not be loaded. Please try again.',
  onRetry,
  className,
}) {
  return (
    <div
      role="alert"
      className={cn(
        'surface flex flex-col items-center justify-center rounded-[var(--radius-card)] px-6 py-14 text-center',
        className,
      )}
    >
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-300">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="text-lg">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-400">{description}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" className="mt-6" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
