import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, FileText, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useAdminResource } from '../../hooks/useAdminResource.js';
import {
  AdminBadge,
  AdminButton,
  AdminEmptyState,
  AdminErrorState,
  AdminLoading,
  ConfirmDialog,
  PageHeader,
  Panel,
  inputClasses,
  useSaveFeedback,
} from '../../components/admin/AdminPrimitives.jsx';
import { formatDate } from '../../lib/format.js';

export default function AdminUpdates() {
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const { notify, element: toast } = useSaveFeedback();

  const { items, isLoading, isError, refetch, update, remove } = useAdminResource('updates', {
    search: search || undefined,
    limit: 100,
  });

  const toggle = (post, field) => {
    update.mutate(
      { id: post._id, [field]: !post[field] },
      {
        onSuccess: () => notify('Update saved'),
        onError: (error) => notify(error.message, 'error'),
      },
    );
  };

  return (
    <>
      <PageHeader
        title="Updates"
        description="Short posts about what you are building and learning."
        actions={
          <Link to="/admin/updates/new">
            <AdminButton variant="primary">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Write update
            </AdminButton>
          </Link>
        }
      />

      <Panel bodyClassName="p-0">
        <div className="border-b border-slate-800 p-4">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search updates"
            aria-label="Search updates"
            className={`${inputClasses} max-w-md`}
          />
        </div>

        {isLoading ? (
          <AdminLoading label="Loading updates" />
        ) : isError ? (
          <AdminErrorState message="Updates could not be loaded." onRetry={refetch} />
        ) : !items.length ? (
          <AdminEmptyState
            icon={FileText}
            title={search ? 'No updates match that search' : 'No updates yet'}
            description={
              search
                ? 'Try a different search term.'
                : 'Writing regularly shows recruiters that you are actively building.'
            }
            action={
              !search ? (
                <Link to="/admin/updates/new">
                  <AdminButton variant="primary">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Write your first update
                  </AdminButton>
                </Link>
              ) : null
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-4 py-3 font-medium">Title</th>
                  <th scope="col" className="px-4 py-3 font-medium">Category</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 font-medium">Published</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {items.map((post) => (
                  <tr key={post._id} className="transition-colors hover:bg-slate-900/60">
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/updates/${post._id}`}
                        className="font-medium text-slate-100 hover:text-teal-300"
                      >
                        {post.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-slate-500">
                        /{post.slug} · {post.readingTime || 1} min read
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{post.category}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {post.published ? (
                          <AdminBadge tone="accent">Published</AdminBadge>
                        ) : (
                          <AdminBadge>Draft</AdminBadge>
                        )}
                        {post.featured ? <AdminBadge tone="info">Featured</AdminBadge> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {post.publishedAt ? formatDate(post.publishedAt) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <AdminButton
                          size="icon"
                          variant="ghost"
                          onClick={() => toggle(post, 'featured')}
                          aria-label={post.featured ? 'Remove from featured' : 'Mark as featured'}
                        >
                          <Star className={`h-4 w-4 ${post.featured ? 'fill-teal-400 text-teal-400' : ''}`} />
                        </AdminButton>
                        <AdminButton
                          size="icon"
                          variant="ghost"
                          onClick={() => toggle(post, 'published')}
                          aria-label={post.published ? 'Unpublish' : 'Publish'}
                        >
                          {post.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </AdminButton>
                        <Link to={`/admin/updates/${post._id}`} aria-label={`Edit ${post.title}`}>
                          <AdminButton size="icon" variant="ghost">
                            <Pencil className="h-4 w-4" />
                          </AdminButton>
                        </Link>
                        <AdminButton
                          size="icon"
                          variant="ghost"
                          className="text-red-400 hover:bg-red-500/10"
                          onClick={() => setPendingDelete(post)}
                          aria-label={`Delete ${post.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </AdminButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete "${pendingDelete?.title}"?`}
        description="This permanently removes the update. It cannot be undone."
        loading={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() =>
          remove.mutate(pendingDelete._id, {
            onSuccess: () => {
              notify('Update deleted');
              setPendingDelete(null);
            },
            onError: (error) => notify(error.message, 'error'),
          })
        }
      />

      {toast}
    </>
  );
}
