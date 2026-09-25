import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { History } from 'lucide-react';
import { api } from '../../lib/api.js';
import {
  AdminBadge,
  AdminButton,
  AdminEmptyState,
  AdminErrorState,
  AdminLoading,
  PageHeader,
  Panel,
  inputClasses,
} from '../../components/admin/AdminPrimitives.jsx';
import { formatDateTime } from '../../lib/format.js';

const ACTION_LABELS = {
  login: 'Signed in',
  logout: 'Signed out',
  password_changed: 'Password changed',
  account_updated: 'Account updated',
  settings_updated: 'Settings updated',
  project_created: 'Project created',
  project_updated: 'Project updated',
  project_deleted: 'Project deleted',
  project_reordered: 'Projects reordered',
  update_created: 'Update created',
  update_updated: 'Update edited',
  update_deleted: 'Update deleted',
  skill_created: 'Skill added',
  skill_updated: 'Skill updated',
  skill_deleted: 'Skill deleted',
  service_created: 'Service added',
  service_updated: 'Service updated',
  service_deleted: 'Service deleted',
  'journey entry_created': 'Milestone added',
  'journey entry_updated': 'Milestone updated',
  'journey entry_deleted': 'Milestone deleted',
  message_updated: 'Message updated',
  message_deleted: 'Message deleted',
  file_uploaded: 'File uploaded',
  file_deleted: 'File deleted',
  resume_updated: 'Resume replaced',
  report_exported: 'Report exported',
  analytics_pruned: 'Old analytics removed',
};

const TONES = {
  login: 'accent',
  logout: 'neutral',
  password_changed: 'warning',
};

export default function AdminActivity() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const params = { search: search || undefined, page, limit: 30 };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'activity', params],
    queryFn: () => api.get('/api/admin/activity', { params }),
  });

  const items = data?.items || [];
  const totalPages = Math.ceil((data?.total || 0) / 30);

  return (
    <>
      <PageHeader
        title="Activity log"
        description="A record of every change made from this dashboard. Passwords and credentials are never logged."
      />

      <Panel bodyClassName="p-0">
        <div className="border-b border-slate-800 p-4">
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search actions"
            aria-label="Search activity"
            className={`${inputClasses} max-w-md`}
          />
        </div>

        {isLoading ? (
          <AdminLoading label="Loading activity" />
        ) : isError ? (
          <AdminErrorState message="The activity log could not be loaded." onRetry={refetch} />
        ) : !items.length ? (
          <AdminEmptyState
            icon={History}
            title="No activity recorded"
            description="Actions you take in this dashboard will be listed here."
          />
        ) : (
          <>
            <ul className="divide-y divide-slate-800">
              {items.map((entry) => (
                <li key={entry._id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <AdminBadge tone={TONES[entry.action] || 'neutral'}>
                        {ACTION_LABELS[entry.action] || entry.action}
                      </AdminBadge>
                      {entry.targetLabel ? (
                        <span className="text-sm text-slate-200">{entry.targetLabel}</span>
                      ) : null}
                    </div>
                    {entry.detail ? (
                      <p className="mt-1 text-xs text-slate-500">{entry.detail}</p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">{formatDateTime(entry.timestamp)}</p>
                    {entry.adminUsername ? (
                      <p className="text-xs text-slate-600">{entry.adminUsername}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>

            {totalPages > 1 ? (
              <div className="flex items-center justify-between border-t border-slate-800 px-5 py-3">
                <p className="text-xs text-slate-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <AdminButton size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                    Previous
                  </AdminButton>
                  <AdminButton
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </AdminButton>
                </div>
              </div>
            ) : null}
          </>
        )}
      </Panel>
    </>
  );
}
