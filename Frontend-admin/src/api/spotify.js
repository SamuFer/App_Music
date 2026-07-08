// src/api/spotify.js
import { apiFetch } from './client';

export const spotifyApi = {
  /**
   * Busca canciones en la API de Spotify a través de nuestro Backend Admin
   * @param {string} query - El término de búsqueda (ej: "Thriller")
   * @returns {Promise<Object>} Objeto que contiene el mensaje y el array 'tracks'
   */
  search: (query) => apiFetch(`/spotify/search?q=${encodeURIComponent(query)}`)
};