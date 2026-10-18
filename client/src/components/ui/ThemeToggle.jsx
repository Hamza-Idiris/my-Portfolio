import { useTheme } from '../../app/ThemeContext.jsx';
import { Sun, Moon } from 'lucide-react';
import { cn } from '../../lib/cn.js';

export function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--hairline)] transition-all duration-200',
        'bg-ink-800/80 text-ink-200 hover:text-ink-50 hover:bg-ink-750 hover:border-[var(--hairline-strong)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/30',
        className,
      )}
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      title={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
    >
      {isLight ? (
        <Sun className="h-4 w-4 text-amber-500 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-accent-300 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
