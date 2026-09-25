import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { AdminButton, AdminField, inputClasses } from './AdminPrimitives.jsx';

/** Edits an array of short strings: features, challenges, technologies, tags. */
export function ListEditor({ label, hint, value = [], onChange, placeholder, suggestions = [] }) {
  const [draft, setDraft] = useState('');

  const add = (entry) => {
    const trimmed = (entry ?? draft).trim();
    if (!trimmed || value.includes(trimmed)) {
      setDraft('');
      return;
    }
    onChange([...value, trimmed]);
    setDraft('');
  };

  const removeAt = (index) => onChange(value.filter((_, position) => position !== index));

  const available = suggestions.filter((suggestion) => !value.includes(suggestion));

  return (
    <AdminField label={label} hint={hint}>
      <div className="space-y-2.5">
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            placeholder={placeholder}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                add();
              }
            }}
            className={inputClasses}
            aria-label={`Add ${label}`}
          />
          <AdminButton onClick={() => add()} aria-label={`Add ${label}`}>
            <Plus className="h-4 w-4" />
          </AdminButton>
        </div>

        {available.length ? (
          <div className="flex flex-wrap gap-1.5">
            {available.slice(0, 8).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => add(suggestion)}
                className="rounded-md border border-dashed border-slate-700 px-2 py-1 text-xs text-slate-500 transition-colors hover:border-slate-600 hover:text-slate-300"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        ) : null}

        {value.length ? (
          <ul className="space-y-1.5">
            {value.map((entry, index) => (
              <li
                key={`${entry}-${index}`}
                className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200"
              >
                <span className="min-w-0 break-words">{entry}</span>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  aria-label={`Remove ${entry}`}
                  className="shrink-0 text-slate-600 transition-colors hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-600">Nothing added yet.</p>
        )}
      </div>
    </AdminField>
  );
}
