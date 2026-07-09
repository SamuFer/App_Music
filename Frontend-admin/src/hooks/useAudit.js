import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../api/audit.js'; // 🌟 Importamos el objeto agrupado

export function useAudit(themeId, songId = null) {
  
  // 1. Detalle general de canciones de la temática
  const themeResultsQuery = useQuery({
    queryKey: ['audit', 'theme', themeId],
    queryFn: () => auditApi.getThemeDetailedResults(themeId), // 🌟 Cambiado a auditApi.
    enabled: !!themeId,
  });

  const themeResults = themeResultsQuery.data?.data || themeResultsQuery.data || [];

  // 2. Podio / Top 3 de canciones más votadas
  const topThreeQuery = useQuery({
    queryKey: ['audit', 'top3', themeId],
    queryFn: () => auditApi.getThemeTopThree(themeId), // 🌟 Cambiado a auditApi.
    enabled: !!themeId,
  });

  const topThree = topThreeQuery.data?.data || topThreeQuery.data || [];

  // 3. Detalle aislado de votos por usuario para una canción seleccionada
  const songDetailsQuery = useQuery({
    queryKey: ['audit', 'song', songId],
    queryFn: () => auditApi.getSongAuditDetails(songId), // 🌟 Cambiado a auditApi.
    enabled: !!songId,
  });

  const songDetails = songDetailsQuery.data?.data || songDetailsQuery.data || null;

  return {
    themeResults,
    isThemeLoading: themeResultsQuery.isLoading,
    
    topThree,
    isTopThreeLoading: topThreeQuery.isLoading,
    
    songDetails,
    isSongLoading: songDetailsQuery.isLoading,
  };
}