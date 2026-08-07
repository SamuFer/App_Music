import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; 
import { userApi } from '../api/users';

export function useUsers({ page = 1, limit = 10, name = '' } = {}) {
  const queryClient = useQueryClient();

  // 1. Convertimos la página al offset que requiere tu backend
  const offset = (page - 1) * limit;

  // 2. Consulta de React Query con parámetros en la queryKey
  const { data, isLoading } = useQuery({
    // La queryKey DEBE incluir los filtros para que React Query
    // sepa cuándo volver a pedir datos al cambiar de página
    queryKey: ['users', { limit, offset, name }],
    queryFn: () => userApi.getAll({ limit, offset, name })
  });

  // Extraemos la lista de usuarios según tu formatPaginatedResponse
  const users = data?.data || [];
  
  // Extraemos la información de paginación que envía tu backend
  const paginationInfo = data?.pagination || {
    totalDocuments: 0,
    counts: 0,
    limit,
    offset
  };

  // Calculamos el total de páginas según los datos del backend
  const totalPages = Math.ceil(paginationInfo.totalDocuments / limit) || 1;

  // Mutaciones CRUD
  const createMutation = useMutation({
    mutationFn: userApi.create,
    onSuccess: () => // 🟢 Sintaxis recomendada
queryClient.invalidateQueries({ queryKey: ['users'] })
  });

  const updateMutation = useMutation({
    // 🟢 Desestructuramos { id, userData } para pasárselos por separado a userApi.update
    mutationFn: ({ id, userData }) => userApi.update(id, userData),
    onSuccess: () => queryClient.invalidateQueries(['users'])
  });

  const deleteMutation = useMutation({
    mutationFn: userApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  });

  const restoreMutation = useMutation({
    mutationFn: userApi.restore,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  });

  return {
    users,
    isLoading,
    pagination: {
      ...paginationInfo,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    },
    createUser: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateUser: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteUser: deleteMutation.mutate,
    restoreUser: restoreMutation.mutate
  };
}