import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive, Inbox, Mail, MailOpen, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import {
  AdminBadge,
  AdminButton,
  AdminEmptyState,
  AdminErrorState,
  AdminLoading,
  ConfirmDialog,
  Drawer,
  PageHeader,
  Panel,
  inputClasses,
  useSaveFeedback,
} from '../../components/admin/AdminPrimitives.jsx';
import { formatDateTime, formatRelativeTime } from '../../lib/format.js';
import { cn } from '../../lib/cn.js';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
  { value: 'archived', label: 'Archived' },
];

const STATUS_TONES = { unread: 'accent', read: 'neutral', archived: 'info' };

export default function AdminMessages() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const { notify, element: toast } = useSaveFeedback();
  const queryClient = useQueryClient();

  const params = { status: status || undefined, search: search || undefined, limit: 50 };
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'messages', params],
    queryFn: () => api.get('/api/admin/messages', { params }),
  });

  const setMessageStatus = useMutation({
    mutationFn: ({ id, status: next }) => api.patch(`/api/admin/messages/${id}`, { status: next }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id) => api.delete(`/api/admin/messages/${id}`),
    onSuccess: invalidate,
  });

  const openMessage = (message) => {
    setOpen(message);
    if (message.status === 'unread') {
      setMessageStatus.mutate({ id: message._id, status: 'read' });
    }
  };

  const items = data?.items || [];
  const counts = data?.counts || {};

  return (
    <>
      <PageHeader
        title="Messages"
        description="Everything sent through the contact form on your site."
      />

      <Panel bodyClassName="p-0">
        <div className="flex flex-col gap-3 border-b border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
            {FILTERS.map((filter) => (
              <button
                key={filter.value || 'all'}
                type="button"
                onClick={() => setStatus(filter.value)}
                aria-pressed={status === filter.value}
                className={cn(
                  'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                  status === filter.value
                    ? 'bg-slate-800 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200',
                )}
              >
                {filter.label}
                {filter.value && counts[filter.value] ? (
                  <span className="ml-1.5 text-slate-500">{counts[filter.value]}</span>
                ) : null}
              </button>
            ))}
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search messages"
            aria-label="Search messages"
            className={`${inputClasses} sm:max-w-xs`}
          />
        </div>

        {isLoading ? (
          <AdminLoading label="Loading messages" />
        ) : isError ? (
          <AdminErrorState message="Messages could not be loaded." onRetry={refetch} />
        ) : !items.length ? (
          <AdminEmptyState
            icon={Inbox}
            title={search || status ? 'No messages match' : 'No messages yet'}
            description={
              search || status
                ? 'Try clearing the filters.'
                : 'Messages sent through your contact form will appear here, and you will also get an email.'
            }
          />
        ) : (
          <ul className="divide-y divide-slate-800">
            {items.map((message) => (
              <li key={message._id}>
                <button
                  type="button"
                  onClick={() => openMessage(message)}
                  className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-900/60"
                >
                  <span className="mt-0.5 text-slate-600">
                    {message.status === 'unread' ? (
                      <Mail className="h-4 w-4 text-teal-400" />
                    ) : (
                      <MailOpen className="h-4 w-4" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'text-sm',
                          message.status === 'unread'
                            ? 'font-semibold text-slate-50'
                            : 'font-medium text-slate-200',
                        )}
                      >
                        {message.name}
                      </span>
                      <span className="text-xs text-slate-500">{message.email}</span>
                      {message.projectType ? (
                        <AdminBadge tone="info">{message.projectType}</AdminBadge>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-slate-400">
                      {message.subject || message.message}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-slate-600">
                    {formatRelativeTime(message.createdAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Drawer
        open={Boolean(open)}
        title={open?.subject || 'Message'}
        onClose={() => setOpen(null)}
        footer={
          open ? (
            <div className="flex flex-wrap justify-between gap-2">
              <div className="flex gap-2">
                <AdminButton
                  onClick={() =>
                    setMessageStatus.mutate(
                      { id: open._id, status: open.status === 'archived' ? 'read' : 'archived' },
                      {
                        onSuccess: () => {
                          notify(open.status === 'archived' ? 'Restored' : 'Archived');
                          setOpen(null);
                        },
                      },
                    )
                  }
                >
                  <Archive className="h-4 w-4" aria-hidden="true" />
                  {open.status === 'archived' ? 'Restore' : 'Archive'}
                </AdminButton>
                <AdminButton
                  variant="ghost"
                  className="text-red-400 hover:bg-red-500/10"
                  onClick={() => setPendingDelete(open)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Delete
                </AdminButton>
              </div>
              <a href={`mailto:${open.email}?subject=Re: ${encodeURIComponent(open.subject || 'Your message')}`}>
                <AdminButton variant="primary">Reply by email</AdminButton>
              </a>
            </div>
          ) : null
        }
      >
        {open ? (
          <div className="space-y-5">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              {[
                ['From', open.name],
                ['Email', open.email],
                ['Received', formatDateTime(open.createdAt)],
                ['Project type', open.projectType],
                ['Budget', open.budget],
                ['Timeline', open.timeline],
                ['Status', open.status],
              ]
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label} className="contents">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="text-slate-200">
                      {label === 'Status' ? (
                        <AdminBadge tone={STATUS_TONES[value]}>{value}</AdminBadge>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                ))}
            </dl>

            <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                {open.message}
              </p>
            </div>
          </div>
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this message?"
        description="The message will be permanently removed. This cannot be undone."
        loading={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() =>
          remove.mutate(pendingDelete._id, {
            onSuccess: () => {
              notify('Message deleted');
              setPendingDelete(null);
              setOpen(null);
            },
          })
        }
      />

      {toast}
    </>
  );
}
