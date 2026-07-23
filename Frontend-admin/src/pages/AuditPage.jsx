import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useCallback } from 'react';
import { useAudit } from '../hooks/useAudit.js';
import { useThemes } from '../hooks/useThemes.js';

export default function AuditPage() {
  const { themeId } = useParams();
  const navigate = useNavigate();
  
  // Sincronizamos el estado del modal de desglose con la URL (?song=id)
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSongId = searchParams.get('song');

  const setSelectedSongId = useCallback((id) => {
    if (id) {
      setSearchParams({ song: id });
    } else {
      setSearchParams({}); // Limpia los parámetros de búsqueda para cerrar el modal
    }
  }, [setSearchParams]);

  // Traemos las canciones, el podio y los detalles de los votos con tu hook useAudit
  const { 
    themeResults = [], 
    isThemeLoading, 
    topThree = [], 
    isTopThreeLoading, 
    songDetails, 
    isSongLoading 
  } = useAudit(themeId, selectedSongId);

  // Traemos la lista general de temáticas con tu hook useThemes para cruzar datos
  const { themes = [], isLoading: isGlobalThemesLoading } = useThemes();

  // Buscamos el objeto de temática que corresponde a esta página
  const currentTheme = themes.find(t => String(t._id || t.id) === String(themeId));

  // Mapeamos las propiedades con fallback seguro si aún no han cargado (apuntando al "title" real de tu Schema)
  const themeTitle = currentTheme?.title || themeResults[0]?.theme || 'Temática de Prueba';
  const themeDay = currentTheme?.day 
    ? `Día ${currentTheme.day}` 
    : (themeResults[0]?.day ? `Día ${themeResults[0].day}` : 'Día 30');

  // Mapeo unificado de Fechas desde el modelo real de la Temática (MongoDB)
  const fechaInicioPlaneada = currentTheme?.startDate;
  const fechaLimiteVotacion = currentTheme?.votingDeadline;
  const fechaClausuraReal = currentTheme?.closedAt; 
  const estadoTematica = currentTheme?.status || 'upcoming'; // 'upcoming', 'active', 'closed'

  // Bloqueo de scroll y listener de Escape para UX óptima del Modal
  useEffect(() => {
    if (selectedSongId) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setSelectedSongId(null);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedSongId, setSelectedSongId]);

  return (
    <div className="space-y-8 text-slate-800">
      
      {/* 1. ENCABEZADO OPTIMIZADO CON METADATOS Y TIMESTAMPS */}
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-3 flex-1">
          
          {/* BADGES SUPERIORES */}
          <div className="flex flex-wrap items-center gap-2">
            {isThemeLoading || isGlobalThemesLoading ? (
              <div className="h-5 w-16 bg-slate-200 animate-pulse rounded-full" />
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
                {themeDay}
              </span>
            )}

            {/* BADGES DINÁMICOS DE ESTADO (Vienen directo del status de tu modelo) */}
            {!isGlobalThemesLoading && currentTheme && (
              <>
                {estadoTematica === 'active' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Votación Activa
                  </span>
                )}
                {estadoTematica === 'closed' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    Cerrada
                  </span>
                )}
                {estadoTematica === 'upcoming' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                    Próxima (Planificada)
                  </span>
                )}
              </>
            )}

            {/* Timestamps del Sistema (ID de la transacción de auditoría) */}
            {themeId && (
              <span className="text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full">
                ⚙️ ID de Auditoría: <span className="font-mono text-slate-500">{themeId.substring(themeId.length - 8)}</span>
              </span>
            )}
          </div>

          {/* TÍTULO PRINCIPAL */}
          <div>
            {isThemeLoading || isGlobalThemesLoading ? (
              <div className="h-9 w-80 bg-slate-200 animate-pulse rounded-xl mt-1" />
            ) : (
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                AUDITORÍA: {themeTitle}
              </h1>
            )}
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">
              Inspección de promedios, podios y transacciones de votos individuales de esta jornada.
            </p>
          </div>

          {/* PANEL DE TIEMPOS DE LAS VOTACIONES UNIFICADO */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-3 text-xs w-full sm:w-auto">
              
              {/* Inicio Real/Planeado de Votaciones (startDate) */}
              <div>
                <span className="text-slate-400 block text-[9px] font-black uppercase tracking-wider font-bold">Apertura Votaciones</span>
                <span className="text-slate-700 font-bold">
                  {fechaInicioPlaneada 
                    ? new Date(fechaInicioPlaneada).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) 
                    : '—'}
                </span>
              </div>

              {/* Divisor Visual */}
              <div className="hidden sm:block h-6 w-px bg-slate-200" />

              {/* Límite teórico de Votación (votingDeadline) */}
              <div>
                <span className="text-slate-400 block text-[9px] font-black uppercase tracking-wider font-bold">Límite de Voto</span>
                <span className="text-slate-700 font-bold">
                  {fechaLimiteVotacion 
                    ? new Date(fechaLimiteVotacion).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) 
                    : '—'}
                </span>
              </div>

              {/* Cierre Real de Votaciones (closedAt) si ya ha sido clausurada */}
              {fechaClausuraReal && (
                <>
                  <div className="hidden sm:block h-6 w-px bg-slate-200" />
                  <div>
                    <span className="text-indigo-500 block text-[9px] font-black uppercase tracking-wider font-bold">Clausurado el (closedAt)</span>
                    <span className="text-indigo-600 font-extrabold">
                      {new Date(fechaClausuraReal).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                </>
              )}

            </div>
          </div>

        </div>

        <button 
          onClick={() => navigate('/themes')}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer self-start xl:self-center"
        >
          ← Volver a Themes
        </button>
      </header>

      {/* 2. EL PODIO (TOP 3) */}
      <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
          🏆 Podio de Rendimiento (Top 3 Medias)
        </h2>
        
        {isTopThreeLoading ? (
          <div className="flex flex-col md:flex-row items-end justify-center gap-4 max-w-2xl mx-auto pt-4">
            <div className="flex-1 w-full bg-slate-50 border border-slate-200/60 rounded-[1.5rem] p-4 h-36 animate-pulse" />
            <div className="flex-1 w-full bg-slate-50 border border-slate-200/60 rounded-[1.5rem] p-5 h-44 animate-pulse" />
            <div className="flex-1 w-full bg-slate-50 border border-slate-200/60 rounded-[1.5rem] p-4 h-32 animate-pulse" />
          </div>
        ) : topThree.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4 font-medium">
            No hay suficientes votos registrados para generar el podio.
          </p>
        ) : (
          <div className="flex flex-col md:flex-row items-end justify-center gap-4 max-w-2xl mx-auto pt-4">
            
            {/* 2º PUESTO */}
            {topThree[1] && (
              <div className="flex-1 w-full text-center bg-slate-50 border border-slate-200 rounded-[1.5rem] p-4 flex flex-col justify-between order-2 md:order-1 h-36 shadow-sm">
                <div>
                  <span className="text-2xl">🥈</span>
                  <p className="text-xs font-bold text-slate-500 mt-1 truncate">
                    {topThree[1].title || "Canción sin título"}
                  </p>
                </div>
                <div className="text-lg font-black text-slate-700 mt-2 bg-white border border-slate-200 py-1 rounded-xl shadow-inner">
                  ★ {topThree[1].notaMedia} <span className="text-xs text-slate-400 font-normal">({topThree[1].totalVotosEmitidos}v)</span>
                </div>
              </div>
            )}

            {/* 1º PUESTO */}
            {topThree[0] && (
              <div className="flex-1 w-full text-center bg-indigo-50/50 border-2 border-indigo-500/20 rounded-[1.5rem] p-5 flex flex-col justify-between order-1 md:order-2 h-44 shadow-md shadow-indigo-100/50">
                <div>
                  <span className="text-4xl block animate-bounce">👑</span>
                  <p className="text-xs font-black text-indigo-600 mt-1 truncate">
                    {topThree[0].title || "Canción sin título"}
                  </p>
                </div>
                <div className="text-xl font-black text-indigo-600 mt-2 bg-white border border-indigo-200 py-1.5 rounded-xl shadow-inner">
                  ★ {topThree[0].notaMedia} <span className="text-xs text-indigo-400 font-normal">({topThree[0].totalVotosEmitidos}v)</span>
                </div>
              </div>
            )}

            {/* 3º PUESTO */}
            {topThree[2] && (
              <div className="flex-1 w-full text-center bg-slate-50 border border-slate-200 rounded-[1.5rem] p-4 flex flex-col justify-between order-3 h-32 shadow-sm">
                <div>
                  <span className="text-2xl">🥉</span>
                  <p className="text-xs font-bold text-slate-500 mt-1 truncate">
                    {topThree[2].title || "Canción sin título"}
                  </p>
                </div>
                <div className="text-base font-black text-slate-600 mt-2 bg-white border border-slate-200 py-1 rounded-xl shadow-inner">
                  ★ {topThree[2].notaMedia} <span className="text-xs text-slate-400 font-normal">({topThree[2].totalVotosEmitidos}v)</span>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* 3. LISTADO GENERAL DE CANCIONES */}
      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-lg">Resultados Detallados de la Jornada</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Haz clic en "Auditar Votos" en cualquier canción para desglosar el historial de usuarios que emitieron su voto.
          </p>
        </div>

        {isThemeLoading ? (
          <div className="p-12 space-y-4">
            <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
          </div>
        ) : themeResults.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">
            No hay canciones registradas en esta temática.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider font-black">
                  <th className="p-4 pl-6">Canción / Artista</th>
                  <th className="p-4">Spotify ID</th>
                  <th className="p-4">Propuesta Por</th>
                  <th className="p-4 text-center">Puntaje</th>
                  <th className="p-4 text-right pr-6">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {themeResults.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-400 font-medium">
                        {item.artist}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-400">
                      {item.spotifyTrackId}
                    </td>
                    <td className="p-4 text-slate-500 text-xs">
                      {item.submittedBy || 'Sistema'}
                    </td>
                    
                    {/* COLUMNA UNIFICADA DE PUNTAJE Y CANTIDAD DE VOTOS */}
                    <td className="p-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="px-3 py-1 rounded-xl font-black text-xs bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-inner">
                          ★ {item.groupAverage || "0.0"}
                        </span>
                        {/* <span className="text-[10px] text-slate-400 font-bold mt-1">
                          {item.totalVotes || 0} {item.totalVotes === 1 ? 'voto' : 'votos'}
                        </span> */}
                      </div>
                    </td>

                    <td className="p-4 text-right pr-6">
                      <button
                        onClick={() => setSelectedSongId(item.id)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-600 transition-all cursor-pointer shadow-sm"
                      >
                        Auditar Votos
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. MODAL/DRAWER DESGLOSE DE VOTOS */}
      {selectedSongId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-150 pointer-events-auto"
            onClick={() => setSelectedSongId(null)}
          />

          <div 
            className="
              relative w-full bg-white border border-slate-200 shadow-2xl z-10 
              transition-all duration-200 ease-out flex flex-col pointer-events-auto
              fixed bottom-0 left-0 right-0 rounded-t-[2.5rem] max-h-[85vh]
              sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:rounded-[2rem] 
              sm:max-w-xl sm:h-auto sm:max-h-[80vh] sm:p-0 overflow-hidden
            "
          >
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto my-3 shrink-0 sm:hidden" />

            <div className="px-6 pb-4 pt-2 sm:pt-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div>
                <h3 className="font-black text-lg text-slate-900 tracking-tight">
                  Historial de Auditoría Interna
                </h3>
                {songDetails && (
                  <p className="text-xs font-semibold text-indigo-600 mt-1 truncate max-w-[280px] sm:max-w-md">
                    "{songDetails?.song.title}" — {songDetails?.song.artist}
                  </p>
                )}
              </div>
              <button 
                onClick={() => setSelectedSongId(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold px-3 py-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {isSongLoading ? (
                <div className="p-8 space-y-4">
                  <div className="h-16 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse" />
                  <div className="h-12 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse" />
                </div>
              ) : !songDetails || songDetails.metrics.allVotes.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4 font-medium">
                  Esta canción no ha recibido puntuaciones individuales todavía.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center shadow-inner">
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Votos Totales</div>
                      <div className="text-xl font-black text-slate-800 mt-0.5">{songDetails.metrics.totalVotes}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Media Auditada</div>
                      <div className="text-xl font-black text-indigo-600 mt-0.5">★ {Number(songDetails.metrics.averageScore).toFixed(1)}</div>
                    </div>
                  </div>

                  <div className="space-y-2 pb-6 sm:pb-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">Registros de emisión:</p>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                      {songDetails.metrics.allVotes.map((voto, index) => {
                        const displayUserId = voto.userId && voto.userId.length > 18 
                          ? voto.userId.substring(voto.userId.length - 6) 
                          : 'ID';

                        return (
                          <div key={index} className="flex items-center justify-between p-4 text-xs font-medium hover:bg-slate-50/50 transition-colors">
                            <div>
                              <p className="font-mono text-slate-700 font-bold">
                                {voto.name || `Usuario (ID: ...${displayUserId})`}
                              </p>
                              <p className="text-slate-400 mt-0.5 text-[11px]">
                                Emitido el: {new Date(voto.votedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl font-black text-sm text-amber-700 shadow-inner">
                              {voto.score} / 10
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="hidden sm:block p-4 bg-slate-50 border-t border-slate-100 text-right pr-6">
              <button
                onClick={() => setSelectedSongId(null)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
              >
                Cerrar Panel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}