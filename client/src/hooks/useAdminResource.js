import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api.js';

/**
 * One hook for every admin content resource. The API exposes the same
 * list/create/update/delete/reorder shape for projects, updates, skills,
 * services and journey entries, so the client mirrors it instead of repeating
 * five nearly identical hooks.
 */
export function useAdminResource(resource, params = {}) {
  const queryClient = useQueryClient();
  const listKey = ['admin', resource, params];
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', resource] });

  const list = useQuery({
    queryKey: listKey,
    queryFn: () => api.get(`/api/admin/${resource}`, { params }),
  });

  const create = useMutation({
    mutationFn: (payload) => api.post(`/api/admin/${resource}`, payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, ...payload }) => api.patch(`/api/admin/${resource}/${id}`, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id) => api.delete(`/api/admin/${resource}/${id}`),
    onSuccess: invalidate,
  });

  const reorder = useMutation({
    mutationFn: (items) => api.post(`/api/admin/${resource}/reorder`, { items }),
    onSuccess: invalidate,
  });

  return {
    items: list.data?.items || [],
    total: list.data?.total || 0,
    isLoading: list.isLoading,
    isError: list.isError,
    refetch: list.refetch,
    create,
    update,
    remove,
    reorder,
  };
}

export function useAdminItem(resource, id) {
  return useQuery({
    queryKey: ['admin', resource, 'item', id],
    queryFn: () => api.get(`/api/admin/${resource}/${id}`),
    enabled: Boolean(id),
  });
}

export function useAdminSettings() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => api.get('/api/admin/settings'),
  });

  const save = useMutation({
    mutationFn: (payload) => api.patch('/api/admin/settings', payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['admin', 'settings'], data);
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
  });

  return { settings: query.data?.settings, isLoading: query.isLoading, isError: query.isError, save };
}

export function useUpload() {
  return useMutation({
    mutationFn: async ({ file, folder }) => {
      const body = new FormData();
      body.append('file', file);
      if (folder) body.append('folder', folder);
      const result = await api.post('/api/admin/uploads', body);
      return result.file;
    },
  });
}
