import { useId } from 'react';
import { cn } from '../../lib/cn.js';

const controlClasses =
  'w-full rounded-lg bg-ink-850 px-3.5 py-2.5 text-sm text-ink-100 placeholder:text-ink-500 ' +
  'hairline transition-colors focus:border-accent-500/60 focus:outline-none focus-visible:outline-none ' +
  'focus:ring-2 focus:ring-accent-500/25 disabled:opacity-60';

export function Field({ label, hint, error, required, children, className, htmlFor }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-ink-200">
          {label}
          {required ? (
            <span className="ml-1 text-accent-400" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs text-red-300" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextField({ label, hint, error, className, id, ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={props.required}
      htmlFor={inputId}
      className={className}
    >
      <input
        id={inputId}
        className={cn(controlClasses, error && 'border-red-500/50')}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      />
    </Field>
  );
}

export function TextArea({ label, hint, error, className, id, rows = 5, ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  return (
    <Field
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
        className={cn(controlClasses, 'resize-y', error && 'border-red-500/50')}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      />
    </Field>
  );
}

export function SelectField({ label, hint, error, className, id, options = [], ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={props.required}
      htmlFor={inputId}
      className={className}
    >
      <select
        id={inputId}
        className={cn(controlClasses, 'appearance-none pr-9', error && 'border-red-500/50')}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export { controlClasses };
