import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { songSchema } from '../schemas/songSchema';
import { useThemes } from '../hooks/useThemes';
import { useSongs } from '../hooks/useSongs';

export default function SongsPage() {
  const { themes, isLoading: loadingThemes } = useThemes();
  const [selectedThemeId, setSelectedThemeId] = useState('');
  
  const { 
    songs, 
    isLoading: loadingSongs, 
    createSong, 
    isCreating, 
    createSongError, // 👈 Usamos este correctamente
    isCreateError, 
    deleteSong 
  } = useSongs(selectedThemeId);

  // Encontrar el objeto completo de la temática seleccionada para evaluar su estado
  const currentTheme = themes?.find(t => t.id === selectedThemeId);
  const isThemeActive = currentTheme?.status === 'active';

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(songSchema)
  });

  const onSubmit = (data) => {
    if (!isThemeActive) return;

    // Nos aseguramos al 100% de que selectedThemeId sea un string limpio
    const cleanThemeId = String(selectedThemeId).trim();

    // Pasamos los datos exactamente en la estructura que espera tu cliente HTTP
    createSong({
        themeId: cleanThemeId,
        title: data.title,
        artist: data.artist,
        spotifyTrackId: data.spotifyTrackId
    }, {
        onSuccess: () => {
        reset(); // Limpia el formulario
        }
    });
 };
console.log("REVISANDO TEMÁTICAS DESDE EL BACKEND:", themes);
  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">GESTIÓN DE CANCIONES</h1>
        <p className="text-slate-500 font-medium">Asigna y administra las pistas musicales correspondientes a cada jornada.</p>
      </header>

      <hr className="border-slate-200" />

      {/* SELECCIÓN DE JORNADA */}
      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 space-y-2 max-w-xl">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecciona una Temática de Trabajo</label>
        {loadingThemes ? (
          <p className="text-sm text-slate-400">Cargando jornadas disponibles...</p>
        ) : (
          <select
            value={selectedThemeId}
            onChange={(e) => setSelectedThemeId(e.target.value)}
            className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm cursor-pointer"
          >
            <option value="">-- Elige una jornada/día --</option>
            {themes?.map((t) => (
              // 💡 Importante: El value tiene que ser EXCLUSIVAMENTE t.id para evitar el error de la imagen
              <option key={t.id} value={t.id}>
                Día {t.day} - {t.title} ({t.status.toUpperCase()})
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedThemeId && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* PANEL IZQUIERDO: FORMULARIO DINÁMICO BASADO EN EL ESTADO */}
          <aside className="lg:col-span-4">
            {isThemeActive ? (
              <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="text-indigo-400 text-2xl">✦</span> Nueva Canción
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-1">Ingresa los metadatos de la pista manualmente.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Spotify Track ID</label>
                    <input
                      {...register('spotifyTrackId')}
                      placeholder="Ej: 4ptS9a2j3GMDbK9XNMQ..."
                      className="w-full bg-slate-800 border-none rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                    {errors.spotifyTrackId && <span className="text-xs text-red-400 font-bold block mt-1">⚠️ {errors.spotifyTrackId.message}</span>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Título de la Canción</label>
                    <input
                      {...register('title')}
                      placeholder="Ej: Starboy"
                      className="w-full bg-slate-800 border-none rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                    {errors.title && <span className="text-xs text-red-400 font-bold block mt-1">⚠️ {errors.title.message}</span>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Artista / Banda</label>
                    <input
                      {...register('artist')}
                      placeholder="Ej: The Weeknd"
                      className="w-full bg-slate-800 border-none rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                    {errors.artist && <span className="text-xs text-red-400 font-bold block mt-1">⚠️ {errors.artist.message}</span>}
                  </div>

                  {/* 🛠️ SOLUCIÓN: Usamos createSongError en lugar de createThemeError */}
                  {isCreateError && (
                    <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-xs text-red-200 font-medium animate-pulse">
                      ⚠️ {createSongError?.message || "Error al guardar la canción"}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isCreating}
                    className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all cursor-pointer text-xs"
                  >
                    {isCreating ? 'Guardando...' : 'Guardar Canción ⚡'}
                  </button>
                </form>
              </div>
            ) : (
              // UX restrictiva: Bloqueamos la edición si no está activa
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] text-amber-800 space-y-3">
                <h3 className="font-black text-sm uppercase tracking-wide flex items-center gap-2">
                  🔒 JORNADA BLOQUEADA
                </h3>
                <p className="text-xs font-medium leading-relaxed">
                  Solo se permite anidar o modificar canciones en temáticas que estén en estado <span className="font-bold underline">Active</span>. Esta jornada se encuentra actualmente en estado: <span className="font-bold uppercase">{currentTheme?.status}</span>.
                </p>
              </div>
            )}
          </aside>

          {/* PANEL DERECHO: LISTADO DE CANCIONES */}
          <main className="lg:col-span-8 space-y-4">
            <div>
              <h2 className="font-bold text-slate-800 px-2">Pistas en esta Jornada</h2>
            </div>

            {loadingSongs ? (
              <p className="text-slate-400 text-center py-10 font-medium animate-pulse">Consultando canciones de la jornada...</p>
            ) : songs.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 p-12 rounded-[2rem] text-center">
                <p className="text-slate-400 font-medium text-sm">Esta temática no tiene ninguna canción asignada todavía.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {songs.map((song) => (
                  <div key={song.id} className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between gap-4 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center font-bold text-white shrink-0 text-xs">
                        🎵
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 uppercase tracking-tight text-sm">{song.title}</span>
                        <span className="text-xs text-slate-400 font-bold">{song.artist}</span>
                        <span className="text-[10px] font-mono text-slate-300 mt-0.5">ID: {song.spotifyTrackId}</span>
                      </div>
                    </div>

                    {/* El botón de borrar solo funciona si la jornada está activa */}
                    {isThemeActive && (
                      <button
                        onClick={() => deleteSong(song.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer md:opacity-0 group-hover:opacity-100"
                        title="Eliminar pista"
                      >
                        🗑
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </main>

        </div>
      )}
    </div>
  );
}