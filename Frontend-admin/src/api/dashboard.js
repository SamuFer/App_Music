import { apiFetch } from './client';

export const dashboardApi = {
  // Obtiene los contadores y KPIs principales para el administrador
  getStats: () => apiFetch('/votes/dashboard/stats') 
};