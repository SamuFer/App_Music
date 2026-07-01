import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { themesApi } from '../api/themes'

export function useThemes() {
  const queryClient = useQueryClient()

  // Obtener todas las temáticas
  const { data, isLoading } = useQuery({
    queryKey: ['themes'],
    queryFn: themesApi.getAll
  });

  // Extraemos las temáticas siguiendo el formato de tu API (data.data)
  const themes = data?.data || (Array.isArray(data) ? data : [])

  // Crear una nueva jornada/temática
  const createThemeMutation = useMutation({
    mutationFn: themesApi.create,
    onSuccess: () => {
      // Al crear una, forzamos a React Query a traer la lista actualizada
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    }
  })

  // Eliminar una temática
  const deleteThemeMutation = useMutation({
    mutationFn: themesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    }
  })

  return {
    themes,
    isLoading,
    createTheme: createThemeMutation.mutate,
    isCreating: createThemeMutation.isPending,
    deleteTheme: deleteThemeMutation.mutate,

    createThemeError: createThemeMutation.error,
    isCreateError: createThemeMutation.isError
  };
}