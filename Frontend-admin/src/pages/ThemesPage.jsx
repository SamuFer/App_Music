import React from 'react';

// DATOS TANTEADOS (MOCK DATA)
const MOCK_THEMES = [
  {
    id: 1,
    dayNumber: 16,
    title: "Canción para llorar y beber",
    songTitle: "The Night Will Always Win",
    artist: "ZUTOMAYO",
    status: "active", // La que está actualmente en votación
    expiresAt: "2026-04-28T23:59:00",
    votesCount: 45,
    averageScore: 8.4
  },
  {
    id: 2,
    dayNumber: 15,
    title: "Un viaje al espacio",
    songTitle: "Space Oddity",
    artist: "David Bowie",
    status: "closed", // Ya terminó
    votesCount: 120,
    averageScore: 9.2
  },
  {
    id: 3,
    dayNumber: 17,
    title: "Energía pura para el gym",
    songTitle: "Harder, Better, Faster, Stronger",
    artist: "Daft Punk",
    status: "upcoming", // Programada para mañana
    votesCount: 0,
    averageScore: 0
  }
];

export default function ThemesPage() {
 return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
      
      {/* HEADER DE LA PÁGINA */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">TEMÁTICAS</h1>
          <p className="text-slate-500 font-medium">Control de jornadas y canciones del día.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm text-center">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Total Días</span>
            <span className="text-xl font-black text-indigo-600">16</span>
          </div>
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm text-center">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Votos Mes</span>
            <span className="text-xl font-black text-pink-500">1.2k</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <aside className="lg:col-span-4 space-y-6">
          <section className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
            {/* Decoración sutil de fondo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full -mr-16 -mt-16"></div>
            
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-indigo-400 text-2xl">✦</span> 
              Nueva Jornada
            </h2>

            <form className="space-y-4 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Día Nº</label>
                  <input type="number" className="w-full bg-slate-800 border-none rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="17" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Estado Inicial</label>
                  <select className="w-full bg-slate-800 border-none rounded-xl p-3 text-white appearance-none">
                    <option>Upcoming</option>
                    <option>Active</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Título de la Temática</label>
                <input type="text" className="w-full bg-slate-800 border-none rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Ej: Canción para viajar..." />
              </div>

              <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5 space-y-3">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Metadata Spotify</p>
                <input type="text" className="w-full bg-slate-800 border-none rounded-lg p-2 text-sm text-white" placeholder="ID de la canción (trackId)" />
                <div className="flex gap-2">
                   <input type="text" className="w-1/2 bg-slate-800 border-none rounded-lg p-2 text-sm text-white" placeholder="Canción" />
                   <input type="text" className="w-1/2 bg-slate-800 border-none rounded-lg p-2 text-sm text-white" placeholder="Artista" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Cierre de Votación</label>
                <input type="datetime-local" className="w-full bg-slate-800 border-none rounded-xl p-3 text-white" />
              </div>

              <button type="button" className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
                Lanzar Jornada
              </button>
            </form>
          </section>
        </aside>

        {/* COLUMNA DERECHA: LISTADO */}
        <main className="lg:col-span-8">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="font-bold text-slate-800">Historial de Jornadas</h2>
            <div className="flex gap-2">
               <button className="text-[10px] font-bold bg-slate-200 px-3 py-1 rounded-full text-slate-600">Todas</button>
               <button className="text-[10px] font-bold bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-400">Activas</button>
            </div>
          </div>

          <div className="grid gap-4">
            {MOCK_THEMES.map((theme) => (
              <div key={theme.id} className="bg-white border border-slate-200 p-5 rounded-[1.5rem] flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition-all group">
                
                {/* Indicador de Día */}
                <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 
                  ${theme.status === 'active' ? 'border-pink-500 bg-pink-50 text-pink-600' : theme.status === 'upcoming' ? 'border-blue-400 bg-blue-50 text-blue-400' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
                  <span className="text-[10px] font-black uppercase">Día</span>
                  <span className="text-2xl font-black">{theme.dayNumber}</span>
                  {/* <span className="text-[6px] font-bold text-red-500" >{theme.status}</span> */}
                </div>

                {/* Info Principal */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 text-lg uppercase tracking-tight">{theme.title}</h3>
                    {theme.status === 'active' && (
                      <span className="flex h-2 w-2 rounded-full bg-pink-500 animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm font-medium">
                    <span className="text-slate-600">{theme.songTitle}</span> — {theme.artist}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex gap-8 px-6 border-l border-slate-100 hidden md:flex">
                  <div className="text-center">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Votos</span>
                    <span className="text-lg font-bold text-slate-700">{theme.votesCount}</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Puntaje</span>
                    <span className="text-lg font-bold text-indigo-500">{theme.averageScore || '—'}</span>
                  </div>
                  {/* <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase" >Estado</span>
                    <span className="text-ms font-bold text-red-500" >{theme.status}</span>
                  </div> */}
                </div>

                {/* Acciones */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900">
                    ✎
                  </button>
                  <button className="p-2 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500">
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}