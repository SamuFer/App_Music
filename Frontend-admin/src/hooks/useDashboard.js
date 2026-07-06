import { useQuery } from "@tanstack/react-query"
import { dashboardApi } from '../api/dashboard'

export function useDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    refetchInterval: 30000 
  })

  const stats = data?.data || {}

  return {
    totalHistoricalVotes: stats.totalHistoricalVotes || 0,
    totalRegisteredUsers: stats.totalRegisteredUsers || 0,
    totalCreatedThemes: stats.totalCreatedThemes || 0,
    votesPerUserRatio: stats.votesPerUserRatio || 0,
    rankingThemes: stats.rankingThemesByParticipation || [],
    isLoading,
    error
  };
}