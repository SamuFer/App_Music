import { z } from 'zod';

export const songSchema = z.object({
  title: z.string().min(1, 'El título de la canción es obligatorio'),
  artist: z.string().min(1, 'El nombre del artista o banda es requerido'),
  spotifyTrackId: z.string().min(1, 'El Spotify Track ID es obligatorio'),
});