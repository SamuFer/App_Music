import { useDashboard } from '../hooks/useDashboard'

export default function Dashboard() {
  const { 
    totalHistoricalVotes, 
    totalRegisteredUsers, 
    totalCreatedThemes, 
    votesPerUserRatio, 
    rankingThemes, 
    isLoading 
  } = useDashboard();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        <p className="text-slate-400 font-medium animate-pulse">Cargando métricas unificadas del sistema...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
      
      {/* CABECERA */}
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">PANEL DE CONTROL</h1>
        <p className="text-slate-500 font-medium">Resumen del estado general de la aplicación en tiempo real.</p>
      </header>

      <hr className="border-slate-200" />

      {/* REJILLA DE 4 TARJETAS PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Tarjeta: Usuarios Registrados */}
        <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-1">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Usuarios Totales</span>
            <span className="text-4xl font-black text-slate-900 tracking-tight">{totalRegisteredUsers}</span>
          </div>
          <div className="mt-4 text-xs text-indigo-600 font-bold bg-indigo-50 px-3 py-1.5 rounded-xl w-fit">
            👥 Comunidad registrada
          </div>
        </div>

        {/* Tarjeta: Votos Totales */}
        <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-1">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Votos Acumulados</span>
            <span className="text-4xl font-black text-pink-500 tracking-tight">{totalHistoricalVotes}</span>
          </div>
          <div className="mt-4 text-xs text-pink-600 font-bold bg-pink-50 px-3 py-1.5 rounded-xl w-fit">
            🎵 Notas guardadas
          </div>
        </div>

        {/* Tarjeta: Temáticas Totales */}
        <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-1">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jornadas Totales</span>
            <span className="text-4xl font-black text-blue-500 tracking-tight">{totalCreatedThemes}</span>
          </div>
          <div className="mt-4 text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1.5 rounded-xl w-fit">
            📅 Temáticas históricas
          </div>
        </div>

        {/* Tarjeta: Ratio de Engagement */}
        <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-1">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Media Votos / Usuario</span>
            <span className="text-4xl font-black text-emerald-500 tracking-tight">{votesPerUserRatio}</span>
          </div>
          <div className="mt-4 text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl w-fit">
            📈 Ratio de engagement
          </div>
        </div>

      </div>

      {/* SECCIÓN DEL RANKING */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">🏆 Ranking de Temáticas por Participación</h2>
          <p className="text-sm text-slate-400 font-medium">Las jornadas ordenadas por volumen de interacción.</p>
        </div>

        {rankingThemes.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 p-8 rounded-2xl text-center">
            <p className="text-slate-400 font-medium">No hay datos de votaciones registrados todavía.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Temática / Jornada</th>
                  <th className="py-4 px-6 text-center">Votos Emitidos</th>
                  <th className="py-4 px-6 text-right">Puntaje Global Promedio</th>
                </tr>
              </thead>
              {/* Cuerpo actualizado */}
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {rankingThemes.map((item, index) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-400 text-xs w-5">#{index + 1}</span>
                        <div className="flex flex-col">
                          {/* Mostramos el título real de la temática */}
                          <span className="font-bold text-slate-900 uppercase tracking-tight">
                            {item.themeTitle || 'Temática sin nombre'}
                          </span>
                          {/* Añadimos el número de día abajo como un detalle sutil */}
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            Día {item.themeDay || '—'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center font-black text-slate-800 text-base">
                      {item.totalVotes}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="inline-block px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-lg font-black text-indigo-600">
                        ⭐ {item.globalAverageScore ? item.globalAverageScore.toFixed(2) : '0.00'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* FOOTER DE CONTROL EXPLICATIVO */}
      <footer className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
        <p className="text-sm font-medium text-slate-300 text-center sm:text-left">
          Modo Administrador Activo — Sincronizado en tiempo real con MongoDB.
        </p>
        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-lg border border-white/5 shrink-0">
          V1.0.0
        </span>
      </footer>

    </div>
  )
}