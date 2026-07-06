import { apiFetch } from './client';

export const songsApi = {
  // Obtiene las canciones asociadas a una temática/jornada específica
  getByTheme: (themeId) => apiFetch(`/themes/${themeId}/songs`),
  
  // Crea una nueva canción en una temática
    create: ({ themeId, ...songData }) => apiFetch(`/themes/${themeId}/songs`, {
    method: 'POST',
    body: JSON.stringify(songData),
    }),
  
  // Elimina una canción por su ID único
  delete: (songId) => apiFetch(`/songs/${songId}`, {
    method: 'DELETE',
  }),
};