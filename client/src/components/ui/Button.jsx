import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn.js';

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 ' +
  'disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap';

const variants = {
  primary:
    'bg-accent-500 text-ink-950 hover:bg-accent-400 shadow-[0_0_0_1px_var(--color-accent-600)] ' +
    'hover:shadow-[0_8px_30px_-12px_var(--color-accent-500)]',
  secondary: 'bg-ink-750 text-ink-100 hairline hover:bg-ink-700 hover:border-[var(--hairline-strong)]',
  outline: 'hairline text-ink-200 hover:text-ink-50 hover:border-[var(--hairline-strong)] hover:bg-ink-800',
  ghost: 'text-ink-300 hover:text-ink-50 hover:bg-ink-800',
  danger: 'bg-red-500/90 text-white hover:bg-red-500',
  link: 'text-accent-300 hover:text-accent-200 underline underline-offset-4',
};

const sizes = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-9 w-9',
};

export const Button = forwardRef(function Button(
  { as, to, href, variant = 'primary', size = 'md', className, children, loading, ...props },
  ref,
) {
  const classes = cn(base, variants[variant], sizes[size], className);
  const content = loading ? (
    <>
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        aria-hidden="true"
      />
      <span>{children}</span>
    </>
  ) : (
    children
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    const external = href.startsWith('http');
    return (
      <a
        ref={ref}
        href={href}
        className={classes}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...props}
      >
        {content}
      </a>
    );
  }

  const Component = as || 'button';
  return (
    <Component
      ref={ref}
      className={classes}
      type={Component === 'button' ? props.type || 'button' : undefined}
      disabled={loading || props.disabled}
      {...props}
    >
      {content}
    </Component>
  );
});
