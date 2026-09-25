import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../lib/api.js';

const ME_KEY = ['admin', 'me'];

export function useAdminSession() {
  const query = useQuery({
    queryKey: ME_KEY,
    queryFn: () => api.get('/api/admin/auth/me'),
    retry: false,
    staleTime: 2 * 60_000,
  });

  const unauthenticated = query.isError && query.error instanceof ApiError && query.error.status === 401;

  return {
    admin: query.data?.admin || null,
    isLoading: query.isLoading,
    isAuthenticated: Boolean(query.data?.admin),
    unauthenticated,
    error: query.error,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials) => api.post('/api/admin/auth/login', credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(ME_KEY, { admin: data.admin });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/api/admin/auth/logout'),
    onSettled: () => {
      queryClient.setQueryData(ME_KEY, null);
      queryClient.removeQueries({ queryKey: ['admin'] });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.patch('/api/admin/auth/account', payload),
    onSuccess: (data) => {
      queryClient.setQueryData(ME_KEY, { admin: data.admin });
    },
  });
}
