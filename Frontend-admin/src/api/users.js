import { apiFetch } from './client' 

export const userApi = {
  // Obtener lista paginada y filtrada para el admin
  getAll: ({ limit = 10, offset = 0, name = '' } = {}) => {
    const params = new URLSearchParams({ limit, offset });
    if (name) params.append('name', name);
    return apiFetch(`/users?${params.toString()}`);
  },

  // Obtener por ID
  // getById: (id) => apiFetch(`/users/${id}`),

  // Crear usuario desde el admin
  create: (data) => apiFetch('/users', { method: 'POST', body: JSON.stringify(data) }),
  
  // Actualizar perfil (name, email, role)
  update: (id, data) => apiFetch(`/users/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),

  // Soft Delete (desactivar)
  delete: (id) => apiFetch(`/users/${id}`, { method: 'DELETE' }),

  // Restaurar / Reactivar cuenta (PATCH)
  restore: (id) => apiFetch(`/users/${id}/restore`, { 
    method: 'PATCH' 
  })
}