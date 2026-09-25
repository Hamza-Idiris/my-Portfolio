import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  Activity,
  Award,
  BarChart3,
  Briefcase,
  ChevronRight,
  FileText,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Milestone,
  Settings as SettingsIcon,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { useAdminSession, useLogout } from '../../hooks/useAdminAuth.js';
import { cn } from '../../lib/cn.js';
import { AdminLoading } from './AdminPrimitives.jsx';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
      { to: '/admin/updates', label: 'Updates', icon: FileText },
      { to: '/admin/certifications', label: 'Certifications', icon: Award },
      { to: '/admin/skills', label: 'Skills', icon: Sparkles },
      { to: '/admin/services', label: 'Services', icon: Briefcase },
      { to: '/admin/journey', label: 'Journey', icon: Milestone },
    ],
  },
  {
    label: 'Insight',
    items: [
      { to: '/admin/messages', label: 'Messages', icon: Inbox, badge: 'unread' },
      { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/admin/reports', label: 'Reports', icon: FileText },
      { to: '/admin/activity', label: 'Activity log', icon: Activity },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/admin/profile', label: 'Profile', icon: User },
      { to: '/admin/settings', label: 'Settings', icon: SettingsIcon },
    ],
  },
];

const LABELS = {
  admin: 'Dashboard',
  projects: 'Projects',
  updates: 'Updates',
  certifications: 'Certifications',
  skills: 'Skills',
  services: 'Services',
  journey: 'Journey',
  messages: 'Messages',
  analytics: 'Analytics',
  reports: 'Reports',
  activity: 'Activity log',
  profile: 'Profile',
  settings: 'Settings',
  new: 'New',
};

function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="hidden sm:block">
      <ol className="flex items-center gap-1.5 text-sm">
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join('/')}`;
          const isLast = index === segments.length - 1;
          const label = LABELS[segment] || 'Details';

          return (
            <li key={href} className="flex items-center gap-1.5">
              {index > 0 ? (
                <ChevronRight className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
              ) : null}
              {isLast ? (
                <span className="font-medium text-slate-100" aria-current="page">
                  {label}
                </span>
              ) : (
                <Link to={href} className="text-slate-400 transition-colors hover:text-slate-200">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Sidebar({ unreadCount, onNavigate, className }) {
  return (
    <div className={cn('flex h-full flex-col bg-slate-950', className)}>
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-800 px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/15 font-mono text-sm font-semibold text-teal-300">
          HI
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-100">Portfolio admin</p>
          <p className="truncate text-xs text-slate-500">hamzaidiris.dev</p>
        </div>
      </div>

      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-5">
            <p className="mb-1.5 px-3 text-[11px] font-medium uppercase tracking-wider text-slate-600">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-slate-800 font-medium text-slate-50'
                          : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200',
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge === 'unread' && unreadCount > 0 ? (
                      <span className="rounded-full bg-teal-500/20 px-1.5 py-0.5 text-[11px] font-medium text-teal-300">
                        {unreadCount}
                      </span>
                    ) : null}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-900 hover:text-slate-200"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          View public site
        </a>
      </div>
    </div>
  );
}

function UserMenu({ admin }) {
  const [open, setOpen] = useState(false);
  const logout = useLogout();

  useEffect(() => {
    if (!open) return undefined;
    const close = () => setOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  return (
    <div className="relative" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-800"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold uppercase text-slate-300">
          {(admin?.username || 'A').slice(0, 2)}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium text-slate-100">{admin?.username}</span>
          <span className="block text-xs text-slate-500">{admin?.role}</span>
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 py-1 shadow-xl shadow-black/40"
        >
          <div className="border-b border-slate-800 px-4 py-3">
            <p className="truncate text-sm font-medium text-slate-100">{admin?.name || admin?.username}</p>
            <p className="truncate text-xs text-slate-500">{admin?.email}</p>
          </div>
          <Link
            to="/admin/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-slate-800"
          >
            <SettingsIcon className="h-4 w-4" aria-hidden="true" />
            Account settings
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => logout.mutate()}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-300 transition-colors hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function AdminLayout() {
  const { admin, isLoading, isAuthenticated } = useAdminSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const { data: messages } = useQuery({
    queryKey: ['admin', 'messages', 'unread-count'],
    queryFn: () => api.get('/api/admin/messages', { params: { status: 'unread', limit: 1 } }),
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  });

  useEffect(() => {
    document.title = 'Admin — Hamza Idiris';
    const robots = document.querySelector('meta[name="robots"]') || document.createElement('meta');
    robots.setAttribute('name', 'robots');
    robots.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(robots);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-950">
        <AdminLoading label="Checking your session" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  const unreadCount = messages?.counts?.unread || 0;

  return (
    <div className="min-h-dvh bg-slate-900 text-slate-200">
      <Sidebar
        unreadCount={unreadCount}
        className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-800 lg:flex"
      />

      {mobileOpen ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <Sidebar
            unreadCount={unreadCount}
            onNavigate={() => setMobileOpen(false)}
            className="fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-800 lg:hidden"
          />
        </>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-800 lg:hidden"
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Breadcrumbs />
          </div>

          <UserMenu admin={admin} />
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Suspense fallback={<AdminLoading label="Loading" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
