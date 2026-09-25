import { useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAdminResource } from '../../hooks/useAdminResource.js';
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
  useSaveFeedback,
} from './AdminPrimitives.jsx';

/**
 * Shared manager for the small ordered collections: skills, services and
 * journey entries. Each page supplies its own fields and row rendering; the
 * list, drawer form, ordering, delete confirmation and toasts are shared.
 */
export function SimpleResourceManager({
  resource,
  title,
  description,
  itemNoun,
  emptyIcon,
  emptyDescription,
  blank,
  renderRow,
  renderForm,
  groupBy,
}) {
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const { notify, element: toast } = useSaveFeedback();

  const { items, isLoading, isError, refetch, create, update, remove, reorder } = useAdminResource(
    resource,
    { limit: 100 },
  );

  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const reordered = [...items];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    reorder.mutate(reordered.map((item, position) => ({ id: item._id, order: position })));
  };

  const save = (event) => {
    event.preventDefault();
    const { _id, createdAt, updatedAt, __v, ...payload } = editing;
    const mutation = _id ? update : create;

    mutation.mutate(_id ? { id: _id, ...payload } : payload, {
      onSuccess: () => {
        notify(_id ? 'Changes saved' : `${itemNoun} added`);
        setEditing(null);
      },
      onError: (error) => notify(error.message, 'error'),
    });
  };

  const groups = groupBy
    ? items.reduce((accumulator, item) => {
        const key = groupBy(item);
        accumulator[key] = accumulator[key] || [];
        accumulator[key].push(item);
        return accumulator;
      }, {})
    : null;

  const renderList = (list) => (
    <ul className="divide-y divide-slate-800">
      {list.map((item) => {
        const index = items.indexOf(item);
        return (
          <li
            key={item._id}
            className="flex items-start justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-slate-900/60"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex flex-col gap-0.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Move up"
                  className="text-slate-600 transition-colors hover:text-slate-300 disabled:opacity-30"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label="Move down"
                  className="text-slate-600 transition-colors hover:text-slate-300 disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="min-w-0">{renderRow(item)}</div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {item.published === false ? <AdminBadge>Hidden</AdminBadge> : null}
              <AdminButton
                size="icon"
                variant="ghost"
                onClick={() => setEditing(item)}
                aria-label="Edit"
              >
                <Pencil className="h-4 w-4" />
              </AdminButton>
              <AdminButton
                size="icon"
                variant="ghost"
                className="text-red-400 hover:bg-red-500/10"
                onClick={() => setPendingDelete(item)}
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </AdminButton>
            </div>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <AdminButton variant="primary" onClick={() => setEditing({ ...blank })}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add {itemNoun.toLowerCase()}
          </AdminButton>
        }
      />

      {isLoading ? (
        <Panel>
          <AdminLoading label={`Loading ${title.toLowerCase()}`} />
        </Panel>
      ) : isError ? (
        <Panel>
          <AdminErrorState message={`${title} could not be loaded.`} onRetry={refetch} />
        </Panel>
      ) : !items.length ? (
        <Panel>
          <AdminEmptyState
            icon={emptyIcon}
            title={`No ${title.toLowerCase()} yet`}
            description={emptyDescription}
            action={
              <AdminButton variant="primary" onClick={() => setEditing({ ...blank })}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add {itemNoun.toLowerCase()}
              </AdminButton>
            }
          />
        </Panel>
      ) : groups ? (
        <div className="space-y-5">
          {Object.entries(groups).map(([group, list]) => (
            <Panel key={group} title={group} bodyClassName="p-0">
              {renderList(list)}
            </Panel>
          ))}
        </div>
      ) : (
        <Panel bodyClassName="p-0">{renderList(items)}</Panel>
      )}

      <Drawer
        open={Boolean(editing)}
        title={editing?._id ? `Edit ${itemNoun.toLowerCase()}` : `New ${itemNoun.toLowerCase()}`}
        onClose={() => setEditing(null)}
      >
        {editing ? (
          <form onSubmit={save} className="space-y-4">
            {renderForm(editing, (patch) => setEditing((previous) => ({ ...previous, ...patch })))}
            <div className="flex justify-end gap-2 pt-2">
              <AdminButton variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </AdminButton>
              <AdminButton
                type="submit"
                variant="primary"
                loading={create.isPending || update.isPending}
              >
                Save
              </AdminButton>
            </div>
          </form>
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete this ${itemNoun.toLowerCase()}?`}
        description="This cannot be undone."
        loading={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() =>
          remove.mutate(pendingDelete._id, {
            onSuccess: () => {
              notify(`${itemNoun} deleted`);
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
