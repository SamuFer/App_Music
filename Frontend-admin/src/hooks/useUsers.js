import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; 
import { userApi } from '../api/users'

export function useUsers() {
  const queryClient = useQueryClient();

  // Obtener usuarios
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userApi.getAll
  });

  // EXPLICACIÓN: Si tu JSON es { "data": [...] }, extraemos data.
  // Si no, intentamos usar data directamente. Si es null, devolvemos []
  const users = data?.data || (Array.isArray(data) ? data : []);

  // Crear usuario
  const createMutation = useMutation({
    mutationFn: userApi.create,
    onSuccess: () => queryClient.invalidateQueries(['users'])
  });

  // Eliminar usuario
  const deleteMutation = useMutation({
    mutationFn: userApi.delete,
    onSuccess: () => queryClient.invalidateQueries(['users'])
  });

  return {
    users,
    isLoading,
    createUser: createMutation.mutate,
    isCreating: createMutation.isPending,
    deleteUser: deleteMutation.mutate
  };
}