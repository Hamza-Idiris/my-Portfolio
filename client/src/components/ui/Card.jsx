import { cn } from '../../lib/cn.js';

export function Card({ className, interactive = false, children, ...props }) {
  return (
    <div
      className={cn(
        'surface rounded-[var(--radius-card)]',
        interactive &&
          'transition-colors duration-200 hover:border-[var(--hairline-strong)] hover:bg-ink-750',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 p-5 sm:p-6', className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...props }) {
  return (
    <div className={cn('p-5 pt-0 sm:p-6 sm:pt-0', className)} {...props}>
      {children}
    </div>
  );
}
