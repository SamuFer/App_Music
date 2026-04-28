import { apiFetch } from './client' 

export const userApi = {
  getAll: () => apiFetch('/users'),

  create: (data) => apiFetch('/users', { method: 'POST', body: JSON.stringify(data) }),
  
  delete: (id) => apiFetch(`/users/${id}`, { method: 'DELETE' }),
}