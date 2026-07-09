import { apiFetch } from './client'; // Asegúrate de que la ruta apunte correctamente a tu client

export const auditApi = {
  // 1. Detalle general de canciones de la temática (con sus promedios grupales)
  getThemeDetailedResults: (themeId) => apiFetch(`/themes/${themeId}/votes/audit`),

  // 2. Podio / Top 3 de canciones más votadas
  getThemeTopThree: (themeId) => apiFetch(`/themes/${themeId}/votes/top-three`),

  // 3. Detalle aislado de votos por usuario para una canción seleccionada
  getSongAuditDetails: (songId) => apiFetch(`/songs/${songId}/votes/audit`),
};