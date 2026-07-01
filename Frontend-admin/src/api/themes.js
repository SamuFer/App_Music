import { apiFetch } from './client'

export const themesApi = {
  // Obtiene todas las temáticas usando la ruta de tu ThemeAdminController
  getAll: () => apiFetch('/themes'),

  // Crea una temática con los campos exactos del req.body de tu controlador
  create: (data) => apiFetch('/themes', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Elimina una temática usando el ID en los parámetros
  delete: (id) => apiFetch(`/themes/${id}`, { 
    method: 'DELETE' 
  })
}