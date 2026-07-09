import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAudit } from '../hooks/useAudit.js';

export default function AuditPage() {
  const { themeId } = useParams();
  const navigate = useNavigate();
  const [selectedSongId, setSelectedSongId] = useState(null);

  const { 
    themeResults, 
    isThemeLoading, 
    topThree, 
    isTopThreeLoading, 
    songDetails, 
    isSongLoading 
  } = useAudit(themeId, selectedSongId);

  const themeTitle = themeResults[0]?.theme || 'Jornada';
  const themeDay = themeResults[0]?.day ? `Día ${themeResults[0].day}` : 'Auditoría';

  return (
    <div className="space-y-8 text-slate-800">
      
      {/* 1. ENCABEZADO COHERENTE CON TU DISEÑO */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
            {themeDay}
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">AUDITORÍA: {themeTitle}</h1>
          <p className="text-slate-500 font-medium text-sm">Inspección de promedios, podios y transacciones de votos individuales.</p>
        </div>
        <button 
          onClick={() => navigate('/themes')}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer self-start sm:self-center"
        >
          ← Volver a Themes
        </button>
      </header>

      {/* 2. EL PODIO (TOP 3) - ADAPTADO A TUS TARJETAS BLANCAS */}
      <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
          🏆 Podio de Rendimiento (Top 3 Medias)
        </h2>
        
        {isTopThreeLoading ? (
          <div className="h-32 flex items-center justify-center text-slate-400 font-medium animate-pulse">Cargando podio...</div>
        ) : topThree.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4 font-medium">No hay suficientes votos registrados para generar el podio.</p>
        ) : (
          <div className="flex flex-col md:flex-row items-end justify-center gap-4 max-w-2xl mx-auto pt-4">
            
            {/* 2º PUESTO (Izquierda) */}
            {topThree[1] && (
              <div className="flex-1 w-full text-center bg-slate-50 border border-slate-200 rounded-[1.5rem] p-4 flex flex-col justify-between order-2 md:order-1 h-36 shadow-sm">
                <div>
                  <span className="text-2xl">🥈</span>
                  <p className="text-xs font-bold text-slate-500 mt-1 truncate">{topThree[1].title || "Canción sin título"}</p>
                  {/* <p className="text-[11px] text-indigo-500 font-semibold truncate">
                   {topThree[0].artist || "Artista Desconocido"}
                  </p> */}
                </div>
                <div className="text-lg font-black text-slate-700 mt-2 bg-white border border-slate-200 py-1 rounded-xl shadow-inner">
                  ★ {topThree[1].notaMedia} <span className="text-xs text-slate-400 font-normal">({topThree[1].totalVotosEmitidos}v)</span>
                </div>
              </div>
            )}

            {/* 1º PUESTO (Centro - Más alto) */}
            {topThree[0] && (
              <div className="flex-1 w-full text-center bg-indigo-50/50 border-2 border-indigo-500/20 rounded-[1.5rem] p-5 flex flex-col justify-between order-1 md:order-2 h-44 shadow-md shadow-indigo-100/50">
                <div>
                  <span className="text-4xl block animate-bounce">👑</span>
                  <p className="text-xs font-black text-indigo-600 mt-1 truncate">{topThree[0].title || "Canción sin título"}</p>
                  {/* <p className="text-[11px] text-indigo-500 font-semibold truncate">
                   {topThree[0].artist || "Artista Desconocido"}
                  </p> */}
                </div>
                <div className="text-xl font-black text-indigo-600 mt-2 bg-white border border-indigo-200 py-1.5 rounded-xl shadow-inner">
                  ★ {topThree[0].notaMedia} <span className="text-xs text-indigo-400 font-normal">({topThree[0].totalVotosEmitidos}v)</span>
                </div>
              </div>
            )}

            {/* 3º PUESTO (Derecha) */}
            {topThree[2] && (
              <div className="flex-1 w-full text-center bg-slate-50 border border-slate-200 rounded-[1.5rem] p-4 flex flex-col justify-between order-3 md:order-3 h-32 shadow-sm">
                <div>
                  <span className="text-2xl">🥉</span>
                  <p className="text-xs font-bold text-slate-500 mt-1 truncate">{topThree[2].title || "Canción sin título"}</p>
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
          <p className="text-xs text-slate-500 font-medium mt-1">Haz clic en cualquier canción para desglosar el historial de usuarios que emitieron su voto.</p>
        </div>

        {isThemeLoading ? (
          <div className="p-12 text-center text-slate-400 font-medium animate-pulse">Cargando resultados detallados...</div>
        ) : themeResults.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">No hay canciones registradas en esta temática.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider font-black">
                  <th className="p-4 pl-6">Canción / Artista</th>
                  <th className="p-4">Spotify ID</th>
                  <th className="p-4">Propuesta Por</th>
                  <th className="p-4 text-center">Nota Media</th>
                  <th className="p-4 text-right pr-6">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {themeResults.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{item.title}</div>
                      <div className="text-xs text-slate-400 font-medium">{item.artist}</div>
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-400">{item.spotifyTrackId}</td>
                    <td className="p-4 text-slate-500 text-xs">{item.submittedBy || 'Sistema'}</td>
                    <td className="p-4">
                      <div className="mx-auto w-16 text-center py-1 rounded-xl font-black text-xs bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-inner">
                        ★ {item.groupAverage}
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

      {/* 4. MODAL CLARO: HISTORIAL DE VOTOS POR USUARIO */}
      {selectedSongId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Cabecera del Modal */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-lg text-slate-900 tracking-tight">Historial de Auditoría Interna</h3>
                {songDetails && (
                  <p className="text-xs font-medium text-slate-500 mt-1">
                    "{songDetails?.song.title}" — {songDetails?.song.artist}
                  </p>
                )}
              </div>
              <button 
                onClick={() => setSelectedSongId(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold px-2.5 py-0.5 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-5">
              {isSongLoading ? (
                <div className="p-8 text-center text-slate-400 font-medium animate-pulse">Consultando transacciones de voto...</div>
              ) : !songDetails || songDetails.metrics.allVotes.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4 font-medium">Esta canción no ha recibido puntuaciones individuales todavía.</p>
              ) : (
                <>
                  {/* Minificha de Métricas Aisladas */}
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

                  {/* Listado de Usuarios y Notas */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">Registros de emisión:</p>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                      {songDetails.metrics.allVotes.map((voto, index) => (
                        <div key={index} className="flex items-center justify-between p-4 text-xs font-medium hover:bg-slate-50/50 transition-colors">
                          <div>
                            <p className="font-mono text-slate-700 font-bold">User: {voto.name || `Usuario (ID: ...${voto.userId.substring(18)})`}</p>
                            <p className="text-slate-400 mt-0.5 text-[11px]">Emitido el: {new Date(voto.votedAt).toLocaleDateString()}</p>
                          </div>
                          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl font-black text-sm text-amber-700 shadow-inner">
                            {voto.score} / 10
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Pie del Modal */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right pr-6">
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