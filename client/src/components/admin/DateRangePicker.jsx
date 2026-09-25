import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { AdminButton, inputClasses } from './AdminPrimitives.jsx';
import { cn } from '../../lib/cn.js';

export const RANGE_PRESETS = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'year', label: 'This year' },
  { value: 'custom', label: 'Custom' },
];

export function DateRangePicker({ value, onChange, className }) {
  const [custom, setCustom] = useState({ from: value.from || '', to: value.to || '' });

  const applyPreset = (preset) => {
    if (preset === 'custom') {
      onChange({ range: 'custom', from: custom.from, to: custom.to });
      return;
    }
    onChange({ range: preset });
  };

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center', className)}>
      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
        {RANGE_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => applyPreset(preset.value)}
            aria-pressed={value.range === preset.value}
            className={cn(
              'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
              value.range === preset.value
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:text-slate-200',
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {value.range === 'custom' ? (
        <div className="flex flex-wrap items-center gap-2">
          <CalendarDays className="h-4 w-4 text-slate-500" aria-hidden="true" />
          <input
            type="date"
            aria-label="From date"
            value={custom.from}
            max={custom.to || undefined}
            onChange={(event) => setCustom((previous) => ({ ...previous, from: event.target.value }))}
            className={cn(inputClasses, 'h-9 w-auto py-1')}
          />
          <span className="text-xs text-slate-500">to</span>
          <input
            type="date"
            aria-label="To date"
            value={custom.to}
            min={custom.from || undefined}
            onChange={(event) => setCustom((previous) => ({ ...previous, to: event.target.value }))}
            className={cn(inputClasses, 'h-9 w-auto py-1')}
          />
          <AdminButton
            size="sm"
            variant="primary"
            disabled={!custom.from}
            onClick={() => onChange({ range: 'custom', from: custom.from, to: custom.to })}
          >
            Apply
          </AdminButton>
        </div>
      ) : null}
    </div>
  );
}
