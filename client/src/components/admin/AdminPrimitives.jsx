import { useEffect, useId, useRef, useState } from 'react';
import { AlertTriangle, Inbox, Loader2, X } from 'lucide-react';
import { cn } from '../../lib/cn.js';

export function AdminLoading({ label = 'Loading', className }) {
  return (
    <div className={cn('flex items-center justify-center gap-2.5 py-16 text-slate-400', className)} role="status">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function PageHeader({ title, description, actions, className }) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div>
        <h1 className="text-2xl font-semibold text-slate-50">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm text-slate-400">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({ title, description, actions, children, className, bodyClassName }) {
  return (
    <section className={cn('rounded-xl border border-slate-800 bg-slate-950', className)}>
      {title || actions ? (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 px-5 py-4">
          <div>
            {title ? <h2 className="text-sm font-semibold text-slate-100">{title}</h2> : null}
            {description ? <p className="mt-1 text-xs text-slate-500">{description}</p> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className={cn('p-5', bodyClassName)}>{children}</div>
    </section>
  );
}

const BUTTON_VARIANTS = {
  primary: 'bg-teal-500 text-slate-950 hover:bg-teal-400',
  secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700',
  outline: 'border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100',
  ghost: 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
  danger: 'bg-red-500/90 text-white hover:bg-red-500',
};

const BUTTON_SIZES = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-3.5 text-sm',
  lg: 'h-10 px-4 text-sm',
  icon: 'h-8 w-8',
};

export function AdminButton({
  variant = 'secondary',
  size = 'md',
  className,
  children,
  loading,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={loading || props.disabled}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors',
        'disabled:pointer-events-none disabled:opacity-50',
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export const inputClasses =
  'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 ' +
  'placeholder:text-slate-600 transition-colors focus:border-teal-500/60 focus:outline-none ' +
  'focus:ring-2 focus:ring-teal-500/20 disabled:opacity-60';

export function AdminField({ label, hint, error, required, children, htmlFor, className }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-300">
          {label}
          {required ? <span className="ml-1 text-teal-400">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function AdminInput({ label, hint, error, className, id, ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  return (
    <AdminField
      label={label}
      hint={hint}
      error={error}
      required={props.required}
      htmlFor={inputId}
      className={className}
    >
      <input
        id={inputId}
        className={cn(inputClasses, error && 'border-red-500/60')}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      />
    </AdminField>
  );
}

export function AdminTextarea({ label, hint, error, className, id, rows = 4, ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  return (
    <AdminField
      label={label}
      hint={hint}
      error={error}
      required={props.required}
      htmlFor={inputId}
      className={className}
    >
      <textarea
        id={inputId}
        rows={rows}
        className={cn(inputClasses, 'resize-y', error && 'border-red-500/60')}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      />
    </AdminField>
  );
}

export function AdminSelect({ label, hint, error, className, id, options = [], ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  return (
    <AdminField
      label={label}
      hint={hint}
      error={error}
      required={props.required}
      htmlFor={inputId}
      className={className}
    >
      <select id={inputId} className={cn(inputClasses, error && 'border-red-500/60')} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </AdminField>
  );
}

export function Toggle({ label, description, checked, onChange, id }) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
          {label}
        </label>
        {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
      </div>
      <button
        type="button"
        id={inputId}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          checked ? 'bg-teal-500' : 'bg-slate-700',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
            checked ? 'translate-x-5.5' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  );
}

export function AdminBadge({ tone = 'neutral', children, className }) {
  const tones = {
    neutral: 'bg-slate-800 text-slate-300',
    success: 'bg-emerald-500/15 text-emerald-300',
    warning: 'bg-amber-500/15 text-amber-300',
    danger: 'bg-red-500/15 text-red-300',
    info: 'bg-sky-500/15 text-sky-300',
    accent: 'bg-teal-500/15 text-teal-300',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function AdminEmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-slate-500">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="text-sm font-medium text-slate-200">{title}</h3>
      {description ? <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function AdminErrorState({ message = 'Something went wrong', onRetry, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)} role="alert">
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-red-400">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="text-sm text-slate-300">{message}</p>
      {onRetry ? (
        <AdminButton className="mt-5" onClick={onRetry}>
          Try again
        </AdminButton>
      ) : null}
    </div>
  );
}

export function ConfirmDialog({ open, title, description, confirmLabel = 'Delete', onConfirm, onCancel, loading }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    dialogRef.current?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        tabIndex={-1}
        className="relative w-full max-w-md rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-2xl"
      >
        <h2 id="confirm-title" className="text-base font-semibold text-slate-50">
          {title}
        </h2>
        {description ? <p className="mt-2 text-sm text-slate-400">{description}</p> : null}
        <div className="mt-6 flex justify-end gap-2">
          <AdminButton variant="ghost" onClick={onCancel}>
            Cancel
          </AdminButton>
          <AdminButton variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}

export function Drawer({ open, title, onClose, children, footer }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col border-l border-slate-800 bg-slate-950 shadow-2xl"
      >
        <header className="flex items-center justify-between gap-4 border-b border-slate-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer ? <footer className="border-t border-slate-800 p-4">{footer}</footer> : null}
      </aside>
    </div>
  );
}

/** Small toast used to confirm saves without pulling in a toast library. */
export function useSaveFeedback(timeout = 2600) {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(null), timeout);
    return () => clearTimeout(timer);
  }, [message, timeout]);

  const element = message ? (
    <div
      role="status"
      className={cn(
        'fixed bottom-5 left-1/2 z-[80] -translate-x-1/2 rounded-lg px-4 py-2.5 text-sm shadow-lg',
        message.tone === 'error' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-900',
      )}
    >
      {message.text}
    </div>
  ) : null;

  return {
    notify: (text, tone = 'success') => setMessage({ text, tone }),
    element,
  };
}
