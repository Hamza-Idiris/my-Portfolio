import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAdminSession, useLogin } from '../../hooks/useAdminAuth.js';
import { AdminButton, AdminInput, AdminLoading } from '../../components/admin/AdminPrimitives.jsx';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const { isAuthenticated, isLoading } = useAdminSession();
  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = 'Sign in — Admin';
    const robots = document.querySelector('meta[name="robots"]') || document.createElement('meta');
    robots.setAttribute('name', 'robots');
    robots.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(robots);
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-950">
        <AdminLoading label="Checking your session" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={location.state?.from || '/admin'} replace />;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    login.mutate(credentials, {
      onSuccess: () => navigate(location.state?.from || '/admin', { replace: true }),
    });
  };

  const update = (field) => (event) =>
    setCredentials((previous) => ({ ...previous, [field]: event.target.value }));

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/15 text-teal-300">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="text-xl font-semibold text-slate-50">Portfolio admin</h1>
          <p className="mt-1.5 text-sm text-slate-500">Sign in to manage your site.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-800 bg-slate-900 p-6"
          noValidate
        >
          {login.isError ? (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300"
            >
              {login.error?.message || 'Sign in failed. Please try again.'}
            </div>
          ) : null}

          <AdminInput
            label="Username or email"
            name="identifier"
            autoComplete="username"
            required
            autoFocus
            value={credentials.identifier}
            onChange={update('identifier')}
          />

          <AdminInput
            className="mt-4"
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={credentials.password}
            onChange={update('password')}
          />

          <AdminButton
            type="submit"
            variant="primary"
            size="lg"
            className="mt-6 w-full"
            loading={login.isPending}
          >
            {login.isPending ? 'Signing in' : 'Sign in'}
          </AdminButton>
        </form>

        <p className="mt-6 text-center text-xs text-slate-600">
          This area is private. Visitors never see it.
        </p>
      </div>
    </div>
  );
}
