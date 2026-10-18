import { cn } from '../../lib/cn.js';

const tones = {
  neutral: 'bg-ink-750 text-ink-300 border-[var(--hairline)]',
  accent: 'bg-accent-500/10 text-accent-400 dark:text-accent-300 border-accent-500/30',
  success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30',
  info: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30',
  muted: 'bg-ink-800 text-ink-400 border-[var(--hairline)]',
};

export function Badge({ tone = 'neutral', className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        tones[tone] || tones.neutral,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

const STATUS_TONES = {
  completed: 'success',
  'in progress': 'warning',
  'in-progress': 'warning',
  planned: 'info',
  archived: 'muted',
};

export function StatusBadge({ status, className }) {
  const key = String(status || '').toLowerCase();
  const label = {
    completed: 'Completed',
    'in-progress': 'In progress',
    planned: 'Planned',
    archived: 'Archived',
  }[key] || status;

  return (
    <Badge tone={STATUS_TONES[key] || 'neutral'} className={className}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </Badge>
  );
}
