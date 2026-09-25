import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileUp, Save, ShieldAlert, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useAdminSettings } from '../../hooks/useAdminResource.js';
import { useAdminSession, useUpdateAccount } from '../../hooks/useAdminAuth.js';
import {
  AdminButton,
  AdminErrorState,
  AdminInput,
  AdminLoading,
  AdminTextarea,
  PageHeader,
  Panel,
  Toggle,
  useSaveFeedback,
} from '../../components/admin/AdminPrimitives.jsx';
import { formatDate } from '../../lib/format.js';
import { cn } from '../../lib/cn.js';

const TABS = [
  { id: 'site', label: 'Site' },
  { id: 'resume', label: 'Resume' },
  { id: 'account', label: 'Account' },
  { id: 'privacy', label: 'Analytics & privacy' },
];

function ResumePanel({ resume, notify }) {
  const inputRef = useRef(null);
  const queryClient = useQueryClient();

  const upload = useMutation({
    mutationFn: async (file) => {
      const body = new FormData();
      body.append('file', file);
      return api.post('/api/admin/uploads/resume', body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      notify('Resume uploaded');
    },
    onError: (error) => notify(error.message, 'error'),
  });

  return (
    <Panel
      title="Resume file"
      description="Replace the downloadable PDF without touching any code."
    >
      {resume?.url ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900 p-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-100">
              {resume.fileName || 'resume.pdf'}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {resume.updatedAt ? `Uploaded ${formatDate(resume.updatedAt)}` : 'Uploaded'}
            </p>
          </div>
          <a href={resume.url} target="_blank" rel="noopener noreferrer">
            <AdminButton size="sm">View</AdminButton>
          </a>
        </div>
      ) : (
        <div className="mb-4 rounded-lg border border-dashed border-slate-700 p-4">
          <p className="text-sm text-slate-300">No resume uploaded yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Until you upload one, the Download CV buttons link to the resume page, which shows your
            skills and projects instead of a broken download.
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="sr-only"
        aria-label="Upload resume PDF"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload.mutate(file);
          event.target.value = '';
        }}
      />

      <AdminButton
        variant="primary"
        loading={upload.isPending}
        onClick={() => inputRef.current?.click()}
      >
        <FileUp className="h-4 w-4" aria-hidden="true" />
        {resume?.url ? 'Replace PDF' : 'Upload PDF'}
      </AdminButton>
    </Panel>
  );
}

function AccountPanel({ notify }) {
  const { admin } = useAdminSession();
  const updateAccount = useUpdateAccount();
  const [form, setForm] = useState({
    username: '',
    email: '',
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (admin) {
      setForm((previous) => ({
        ...previous,
        username: admin.username,
        email: admin.email,
        name: admin.name || '',
      }));
    }
  }, [admin]);

  const set = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrors({});

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setErrors({ confirmPassword: 'The two passwords do not match' });
      return;
    }

    const payload = { username: form.username, email: form.email, name: form.name };
    if (form.currentPassword) payload.currentPassword = form.currentPassword;
    if (form.newPassword) payload.newPassword = form.newPassword;

    updateAccount.mutate(payload, {
      onSuccess: (data) => {
        notify(
          data.changed?.includes('password') ? 'Password changed' : 'Account updated',
        );
        setForm((previous) => ({
          ...previous,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      },
      onError: (error) => {
        if (error.details) {
          setErrors(Object.fromEntries(error.details.map((detail) => [detail.field, detail.message])));
        }
        notify(error.message, 'error');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {admin?.mustChangePassword ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/25 bg-amber-500/10 p-4">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
          <p className="text-sm text-amber-200">
            You are still using the password generated by the seed script. Change it below before
            putting this site online.
          </p>
        </div>
      ) : null}

      <Panel title="Sign-in details" description="Used only to access this dashboard">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminInput
            label="Username"
            value={form.username}
            onChange={set('username')}
            error={errors.username}
            autoComplete="username"
          />
          <AdminInput
            label="Email"
            type="email"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            autoComplete="email"
          />
          <AdminInput
            className="sm:col-span-2"
            label="Display name"
            value={form.name}
            onChange={set('name')}
          />
        </div>
      </Panel>

      <Panel
        title="Change password"
        description="Your existing password is never shown. Confirm it to make any sensitive change."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminInput
            className="sm:col-span-2"
            label="Current password"
            type="password"
            value={form.currentPassword}
            onChange={set('currentPassword')}
            error={errors.currentPassword}
            autoComplete="current-password"
            hint="Required when changing your username, email or password."
          />
          <AdminInput
            label="New password"
            type="password"
            value={form.newPassword}
            onChange={set('newPassword')}
            error={errors.newPassword}
            autoComplete="new-password"
            hint="At least 10 characters, with upper case, lower case and a number."
          />
          <AdminInput
            label="Confirm new password"
            type="password"
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
        </div>
      </Panel>

      <div className="flex justify-end">
        <AdminButton type="submit" variant="primary" loading={updateAccount.isPending}>
          <Save className="h-4 w-4" aria-hidden="true" />
          Save account
        </AdminButton>
      </div>
    </form>
  );
}

export default function AdminSettings() {
  const [tab, setTab] = useState('site');
  const { settings, isLoading, isError, save } = useAdminSettings();
  const [form, setForm] = useState(null);
  const { notify, element: toast } = useSaveFeedback();
  const queryClient = useQueryClient();

  const prune = useMutation({
    mutationFn: () => api.post('/api/admin/analytics/prune'),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'analytics'] });
      notify(`Removed ${result.removed} old events`);
    },
    onError: (error) => notify(error.message, 'error'),
  });

  useEffect(() => {
    if (settings) {
      setForm({
        contact: { ...settings.contact },
        home: { ...settings.home },
        seo: { ...settings.seo, keywords: settings.seo?.keywords || [] },
        analytics: { ...settings.analytics },
        resume: { ...settings.resume },
      });
    }
  }, [settings]);

  if (isLoading || !form) return <AdminLoading label="Loading settings" />;
  if (isError) return <AdminErrorState message="Settings could not be loaded." />;

  const setSection = (section, field) => (event) => {
    const value = event?.target ? event.target.value : event;
    setForm((previous) => ({ ...previous, [section]: { ...previous[section], [field]: value } }));
  };

  const saveSettings = (payload, message) =>
    save.mutate(payload, {
      onSuccess: () => notify(message),
      onError: (error) => notify(error.message, 'error'),
    });

  return (
    <>
      <PageHeader title="Settings" description="Site-wide configuration and your account." />

      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-slate-800">
        {TABS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setTab(entry.id)}
            aria-current={tab === entry.id ? 'page' : undefined}
            className={cn(
              'whitespace-nowrap border-b-2 px-4 py-2.5 text-sm transition-colors',
              tab === entry.id
                ? 'border-teal-500 font-medium text-slate-100'
                : 'border-transparent text-slate-500 hover:text-slate-300',
            )}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {tab === 'site' ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            saveSettings(
              { contact: form.contact, home: form.home, seo: form.seo },
              'Site settings saved',
            );
          }}
          className="space-y-5"
        >
          <Panel title="Contact">
            <div className="space-y-4">
              <AdminInput
                label="Contact email"
                type="email"
                value={form.contact.email}
                onChange={setSection('contact', 'email')}
                hint="Where contact notifications are sent, and shown publicly on the contact page."
              />
              <AdminInput
                label="Response time note"
                value={form.contact.responseTime}
                onChange={setSection('contact', 'responseTime')}
                placeholder="I usually reply within a couple of days."
              />
              <AdminTextarea
                label="Contact page intro"
                value={form.contact.intro}
                onChange={setSection('contact', 'intro')}
                rows={3}
              />
              <Toggle
                label="Contact form open"
                description="Turn off to hide the form and show your email address instead."
                checked={form.contact.formEnabled}
                onChange={(value) => setSection('contact', 'formEnabled')(value)}
              />
            </div>
          </Panel>

          <Panel title="Homepage call to action">
            <div className="space-y-4">
              <AdminInput
                label="CTA title"
                value={form.home.ctaTitle}
                onChange={setSection('home', 'ctaTitle')}
              />
              <AdminInput
                label="CTA description"
                value={form.home.ctaDescription}
                onChange={setSection('home', 'ctaDescription')}
              />
              <AdminTextarea
                label="What I build intro"
                value={form.home.whatIBuildIntro}
                onChange={setSection('home', 'whatIBuildIntro')}
                rows={2}
              />
            </div>
          </Panel>

          <Panel title="Default SEO" description="Used on pages without their own metadata">
            <div className="space-y-4">
              <AdminInput
                label="Default title"
                value={form.seo.defaultTitle}
                onChange={setSection('seo', 'defaultTitle')}
              />
              <AdminTextarea
                label="Default description"
                value={form.seo.defaultDescription}
                onChange={setSection('seo', 'defaultDescription')}
                rows={3}
              />
              <AdminInput
                label="Social preview image URL"
                value={form.seo.ogImage}
                onChange={setSection('seo', 'ogImage')}
                hint="Shown when a link to your site is shared. 1200x630 pixels works best."
              />
            </div>
          </Panel>

          <div className="flex justify-end">
            <AdminButton type="submit" variant="primary" loading={save.isPending}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Save settings
            </AdminButton>
          </div>
        </form>
      ) : null}

      {tab === 'resume' ? (
        <div className="space-y-5">
          <ResumePanel resume={settings.resume} notify={notify} />
          <Panel title="Resume summary" description="Shown on the resume page above the download">
            <AdminTextarea
              label="Summary"
              value={form.resume.summary}
              onChange={setSection('resume', 'summary')}
              rows={4}
            />
            <div className="mt-4 flex justify-end">
              <AdminButton
                variant="primary"
                loading={save.isPending}
                onClick={() =>
                  saveSettings({ resume: { summary: form.resume.summary } }, 'Resume summary saved')
                }
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Save summary
              </AdminButton>
            </div>
          </Panel>
        </div>
      ) : null}

      {tab === 'account' ? <AccountPanel notify={notify} /> : null}

      {tab === 'privacy' ? (
        <div className="space-y-5">
          <Panel title="Analytics" description="How visitor activity is recorded">
            <div className="space-y-4">
              <Toggle
                label="Collect analytics"
                description="Turn off to stop recording any visitor events. Existing data is kept."
                checked={form.analytics.enabled}
                onChange={(value) => setSection('analytics', 'enabled')(value)}
              />
              <AdminInput
                label="Retention (days)"
                type="number"
                min="30"
                max="3650"
                value={form.analytics.retentionDays}
                onChange={(event) =>
                  setSection('analytics', 'retentionDays')(Number(event.target.value))
                }
                hint="Events older than this can be removed with the button below."
              />
              <div className="flex flex-wrap justify-end gap-2">
                <AdminButton
                  variant="outline"
                  loading={prune.isPending}
                  onClick={() => prune.mutate()}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove old events
                </AdminButton>
                <AdminButton
                  variant="primary"
                  loading={save.isPending}
                  onClick={() => saveSettings({ analytics: form.analytics }, 'Analytics settings saved')}
                >
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Save
                </AdminButton>
              </div>
            </div>
          </Panel>

          <Panel title="What is collected">
            <ul className="space-y-2 text-sm text-slate-400">
              {[
                'A random identifier that lives only in the visitor’s browser tab',
                'The page visited and the type of interaction',
                'Broad device, browser and operating system families',
                'A traffic source category such as search, social or direct',
                'A country-level region, only when the host provides one',
              ].map((entry) => (
                <li key={entry} className="flex gap-2.5">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-teal-500" aria-hidden="true" />
                  {entry}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-500">
              No cookies, no cross-site tracking, no fingerprinting, and no form content.
            </p>
          </Panel>
        </div>
      ) : null}

      {toast}
    </>
  );
}
