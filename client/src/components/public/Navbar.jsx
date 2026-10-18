import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { NAV_LINKS } from '../../lib/siteDefaults.js';
import { Button } from '../ui/Button.jsx';
import { Container } from '../ui/Section.jsx';
import { ThemeToggle } from '../ui/ThemeToggle.jsx';

function Wordmark() {
  return (
    <Link
      to="/"
      className="group flex items-center gap-2.5 rounded-md py-1 text-ink-50"
      aria-label="Hamza Idiris — home"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent-500/30 bg-accent-500/10 font-mono text-sm font-medium text-accent-300 transition-colors group-hover:bg-accent-500/15">
        HI
      </span>
      <span className="hidden text-sm font-semibold tracking-tight sm:block">Hamza Idiris</span>
    </Link>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const panelRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector('a')?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-[var(--hairline)] bg-ink-900/85 backdrop-blur-xl'
          : 'border-b border-transparent',
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <Wordmark />

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'relative rounded-md px-3 py-2 text-sm transition-colors',
                      isActive ? 'text-ink-50' : 'text-ink-400 hover:text-ink-100',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {isActive ? (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-x-3 -bottom-px h-px bg-accent-400"
                        />
                      ) : null}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button to="/contact" size="sm" className="hidden sm:inline-flex">
            Get in touch
          </Button>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-200 transition-colors hover:bg-ink-800 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-navigation"
            ref={panelRef}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="border-t border-[var(--hairline)] bg-ink-900/95 backdrop-blur-xl md:hidden"
          >
            <nav aria-label="Mobile" className="px-5 py-4">
              <ul className="flex flex-col">
                {NAV_LINKS.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      end={link.to === '/'}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center justify-between border-b border-[var(--hairline)] py-4 text-base transition-colors',
                          isActive ? 'text-accent-300' : 'text-ink-200 hover:text-ink-50',
                        )
                      }
                    >
                      {link.label}
                      <span className="font-mono text-xs text-ink-600">→</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
              <Button to="/contact" size="lg" className="mt-5 w-full">
                Get in touch
              </Button>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
