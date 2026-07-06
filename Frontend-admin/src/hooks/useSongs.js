import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { songsApi } from '../api/song';

export function useSongs(themeId) {
  const queryClient = useQueryClient();

  // 1. Consulta para traer las canciones de la temática actual
  const { data, isLoading, error } = useQuery({
    queryKey: ['songs', themeId],
    queryFn: () => songsApi.getByTheme(themeId),
    enabled: !!themeId, // Solo se ejecuta si hay un themeId seleccionado
  });

  const songs = data?.data || [];

  // 2. Mutación para agregar una canción
  const createSongMutation = useMutation({
    mutationFn: songsApi.create,
    onSuccess: () => {
      // Forzamos a React Query a refrescar la lista de canciones de este tema
      queryClient.invalidateQueries({ queryKey: ['songs', themeId] });
    },
  });

  // 3. Mutación para eliminar una canción
  const deleteSongMutation = useMutation({
    mutationFn: songsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs', themeId] });
    },
  });

  return {
    songs,
    isLoading,
    createSong: createSongMutation.mutate,
    isCreating: createSongMutation.isPending,
    createSongError: createSongMutation.error,
    isCreateError: createSongMutation.isError,
    deleteSong: deleteSongMutation.mutate,
    isDeleting: deleteSongMutation.isPending,
  };
}