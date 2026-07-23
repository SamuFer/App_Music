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

  // ✏️ Agrega esta mutación para el UPDATE
  const updateThemeMutation = useMutation({
    mutationFn: ({ id, data }) => themesApi.update(id, data),
    onSuccess: () => {
      // Esto invalida la caché de temáticas y hace que se recarguen solas en pantalla
      queryClient.invalidateQueries({ queryKey: ['themes'] }) 
    }
  })

  return {
    themes,
    isLoading,
    createTheme: createThemeMutation.mutate,
    isCreating: createThemeMutation.isPending,
    deleteTheme: deleteThemeMutation.mutate,

    createThemeError: createThemeMutation.error,
    isCreateError: createThemeMutation.isError,
    
    // 🌟 Asegúrate de retornar estos tres elementos:
    updateTheme: updateThemeMutation.mutate,
    isUpdating: updateThemeMutation.isPending,
    updateError: updateThemeMutation.error,
    
    // 🔄 Una función comodín para forzar el refresco manual cuando lo necesites
    invalidateThemes: () => queryClient.invalidateQueries({ queryKey: ['themes'] })
  };
}