import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Eye,
  EyeOff,
  FolderKanban,
  Pencil,
  Plus,
  Star,
  Trash2,
} from 'lucide-react';
import { useAdminResource } from '../../hooks/useAdminResource.js';
import { GithubIcon } from '../../components/ui/BrandIcons.jsx';
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

const STATUS_TONES = {
  completed: 'success',
  'in-progress': 'warning',
  planned: 'info',
  archived: 'neutral',
};

const STATUS_LABELS = {
  completed: 'Completed',
  'in-progress': 'In progress',
  planned: 'Planned',
  archived: 'Archived',
};

export default function AdminProjects() {
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const { notify, element: toast } = useSaveFeedback();

  const { items, isLoading, isError, refetch, update, remove, reorder } = useAdminResource(
    'projects',
    { search: search || undefined, limit: 100 },
  );

  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;

    const reordered = [...items];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

    reorder.mutate(
      reordered.map((item, position) => ({ id: item._id, order: position })),
      { onSuccess: () => notify('Order updated') },
    );
  };

  const toggle = (project, field) => {
    update.mutate(
      { id: project._id, [field]: !project[field] },
      {
        onSuccess: () =>
          notify(
            field === 'published'
              ? project.published
                ? 'Project unpublished'
                : 'Project published'
              : project.featured
                ? 'Removed from featured'
                : 'Marked as featured',
          ),
        onError: (error) => notify(error.message, 'error'),
      },
    );
  };

  return (
    <>
      <PageHeader
        title="Projects"
        description="Only published projects appear on the public site."
        actions={
          <Link to="/admin/projects/new">
            <AdminButton variant="primary">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New project
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
            placeholder="Search projects by title, description or technology"
            aria-label="Search projects"
            className={`${inputClasses} max-w-md`}
          />
        </div>

        {isLoading ? (
          <AdminLoading label="Loading projects" />
        ) : isError ? (
          <AdminErrorState message="Projects could not be loaded." onRetry={refetch} />
        ) : !items.length ? (
          <AdminEmptyState
            icon={FolderKanban}
            title={search ? 'No projects match that search' : 'No projects yet'}
            description={
              search
                ? 'Try a different search term.'
                : 'Create your first project to show it on the public site.'
            }
            action={
              !search ? (
                <Link to="/admin/projects/new">
                  <AdminButton variant="primary">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    New project
                  </AdminButton>
                </Link>
              ) : null
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-4 py-3 font-medium">Project</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 font-medium">Links</th>
                  <th scope="col" className="px-4 py-3 font-medium">Updated</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {items.map((project, index) => (
                  <tr key={project._id} className="transition-colors hover:bg-slate-900/60">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col gap-0.5 pt-0.5">
                          <button
                            type="button"
                            onClick={() => move(index, -1)}
                            disabled={index === 0}
                            aria-label={`Move ${project.title} up`}
                            className="text-slate-600 transition-colors hover:text-slate-300 disabled:opacity-30"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => move(index, 1)}
                            disabled={index === items.length - 1}
                            aria-label={`Move ${project.title} down`}
                            className="text-slate-600 transition-colors hover:text-slate-300 disabled:opacity-30"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/admin/projects/${project._id}`}
                            className="font-medium text-slate-100 hover:text-teal-300"
                          >
                            {project.title}
                          </Link>
                          <p className="mt-0.5 truncate text-xs text-slate-500">/{project.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <AdminBadge tone={STATUS_TONES[project.status]}>
                          {STATUS_LABELS[project.status] || project.status}
                        </AdminBadge>
                        {project.published ? (
                          <AdminBadge tone="accent">Published</AdminBadge>
                        ) : (
                          <AdminBadge>Draft</AdminBadge>
                        )}
                        {project.featured ? <AdminBadge tone="info">Featured</AdminBadge> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        {project.githubUrl ? (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${project.title} repository`}
                            className="hover:text-slate-200"
                          >
                            <GithubIcon className="h-4 w-4" />
                          </a>
                        ) : null}
                        {project.liveUrl ? (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${project.title} live demo`}
                            className="hover:text-slate-200"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {formatDate(project.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <AdminButton
                          size="icon"
                          variant="ghost"
                          onClick={() => toggle(project, 'featured')}
                          aria-label={project.featured ? 'Remove from featured' : 'Mark as featured'}
                          title={project.featured ? 'Remove from featured' : 'Mark as featured'}
                        >
                          <Star
                            className={`h-4 w-4 ${project.featured ? 'fill-teal-400 text-teal-400' : ''}`}
                          />
                        </AdminButton>
                        <AdminButton
                          size="icon"
                          variant="ghost"
                          onClick={() => toggle(project, 'published')}
                          aria-label={project.published ? 'Unpublish' : 'Publish'}
                          title={project.published ? 'Unpublish' : 'Publish'}
                        >
                          {project.published ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </AdminButton>
                        <Link to={`/admin/projects/${project._id}`} aria-label={`Edit ${project.title}`}>
                          <AdminButton size="icon" variant="ghost" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </AdminButton>
                        </Link>
                        <AdminButton
                          size="icon"
                          variant="ghost"
                          className="text-red-400 hover:bg-red-500/10"
                          onClick={() => setPendingDelete(project)}
                          aria-label={`Delete ${project.title}`}
                          title="Delete"
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
        description="This permanently removes the project and its case study. It cannot be undone."
        loading={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() =>
          remove.mutate(pendingDelete._id, {
            onSuccess: () => {
              notify('Project deleted');
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
