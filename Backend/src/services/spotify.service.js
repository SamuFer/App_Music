import { AppError } from '../utils/customError.js';

export const SpotifyService = class {
  /**
   * Obtiene el token de acceso temporal de Spotify (Proceso seguro interno)
   */
  static async getAccessToken() {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new AppError("Faltan las credenciales de Spotify en las variables de entorno.", 500);
    }

    try {
      const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${authHeader}`
        },
        body: "grant_type=client_credentials"
      });

      if (!response.ok) {
        throw new AppError("No se pudo obtener el token de autenticación de Spotify.", response.status);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error en el servicio de autenticación de Spotify: ${error.message}`, 500);
    }
  }

  /**
   * Busca canciones en la API oficial de Spotify filtrando por el parámetro 'q'
   */
  static async search(query) {
    try {
      // 1. Conseguimos el token usando nuestro propio método estático
      const token = await this.getAccessToken();

      // 2. Hacemos la petición a los servidores de Spotify
      const spotifyUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`;
      const response = await fetch(spotifyUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new AppError("La API de Spotify ha rechazado la solicitud de búsqueda.", response.status);
      }

      const data = await response.json();

      // 3. Mapeamos las propiedades normalizadas con la propiedad 'id' limpia
      return data.tracks.items.map(track => ({
        id: track.id, 
        title: track.name,
        artist: track.artists.map(artist => artist.name).join(", "),
        album: track.album.name,
        image: track.album.images[2]?.url || track.album.images[0]?.url 
      }));

    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error en el servidor al buscar la canción en Spotify: ${error.message}`, 500);
    }
  }
};