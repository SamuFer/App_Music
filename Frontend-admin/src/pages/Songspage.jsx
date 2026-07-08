import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { songSchema } from '../schemas/songSchema';
import { useThemes } from '../hooks/useThemes';
import { useSongs } from '../hooks/useSongs';
import { useSpotify } from '../hooks/useSpotify';

export default function SongsPage() {
  const { themes, isLoading: loadingThemes } = useThemes();
  const [selectedThemeId, setSelectedThemeId] = useState('');
  
  const { 
    songs, 
    isLoading: loadingSongs, 
    createSong, 
    isCreating, 
    createSongError, 
    isCreateError, 
    deleteSong 
  } = useSongs(selectedThemeId);

  // 1. Hook de Spotify para manejar la búsqueda automatizada
  const { query, setQuery, tracks, loading: loadingSpotify, error: errorSpotify, setTracks } = useSpotify();

  const currentTheme = themes?.find(t => t.id === selectedThemeId);
  const isThemeActive = currentTheme?.status === 'active';

  // 2. Extraemos 'setValue' y 'watch' de react-hook-form
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(songSchema)
  });

  // Escuchamos si cambian los campos manuales para gestionar cierres si es necesario
  const watchTitle = watch('title');

  const onSubmit = (data) => {
    if (!isThemeActive) return;

    const cleanThemeId = String(selectedThemeId).trim();

    createSong({
        themeId: cleanThemeId,
        title: data.title,
        artist: data.artist,
        spotifyTrackId: data.spotifyTrackId
    }, {
        onSuccess: () => {
          reset(); // Limpia el formulario completo
          setQuery(''); // Limpia la caja del buscador de Spotify
        }
    });
  };

  // 3. Función al hacer clic en una sugerencia de Spotify
  const manejarSeleccionTrack = (track) => {
    setValue('title', track.title, { shouldValidate: true });
    setValue('artist', track.artist, { shouldValidate: true });
    setValue('spotifyTrackId', track.id, { shouldValidate: true });
    
    // Cerramos el menú desplegable vaciando los tracks pero manteniendo el texto si quieres
    setQuery('')
    setTracks([])
  };

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
            onChange={(e) => {
              setSelectedThemeId(e.target.value);
              setQuery(''); // Resetea buscador si cambia de jornada
            }}
            className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm cursor-pointer"
          >
            <option value="">-- Elige una jornada/día --</option>
            {themes?.map((t) => (
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
                  <p className="text-xs text-slate-400 font-medium mt-1">Busca en Spotify para auto-completar o escribe manualmente.</p>
                </div>

                {/* 🔍 CONTROL INTEGRADO DE BUSQUEDA EN SPOTIFY */}
                <div className="space-y-1 relative">
                  <label className="text-[10px] font-black text-indigo-400 uppercase ml-1">Buscador Inteligente Spotify</label>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="🔍 Escribe título o artista..."
                    className="w-full bg-slate-800 border-none rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 text-sm placeholder:text-slate-500"
                  />
                  
                  {loadingSpotify && (
                    <p className="text-[11px] text-slate-400 animate-pulse ml-1">Buscando en la API...</p>
                  )}

                  {errorSpotify && (
                    <p className="text-[11px] text-red-400 ml-1 font-semibold">{errorSpotify}</p>
                  )}

                  {/* 📋 MENÚ DESPLEGABLE DE RESULTADOS */}
                  {tracks.length > 0 && (
                    <ul className="absolute top-[100%] left-0 right-0 bg-slate-800 border border-slate-700 rounded-xl mt-1 shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto divided-y divide-slate-700">
                      {tracks.map((track) => (
                        <li
                          key={track.id}
                          onClick={() => manejarSeleccionTrack(track)}
                          className="flex items-center gap-3 p-2.5 hover:bg-slate-700/60 transition-colors cursor-pointer text-left"
                        >
                          {track.image && (
                            <img 
                              src={track.image} 
                              alt={track.album} 
                              className="w-9 h-9 rounded-lg shrink-0 object-cover" 
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate text-slate-100">{track.title}</p>
                            <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                          </div>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md font-extrabold uppercase tracking-wide shrink-0">
                            Ok
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* CASO: NO ENCUENTRA MÚSICA EN SPOTIFY */}
                  {/* CASO: NO ENCUENTRA MÚSICA EN SPOTIFY (Solo si ya NO está cargando y el array está realmente vacío) */}
                  {query && !loadingSpotify && tracks && tracks.length === 0 && !errorSpotify && (
                    <p className="text-[11px] text-amber-400 ml-1 italic">
                      // No se encontraron coincidencias en Spotify. Puedes rellenar abajo manualmente.
                    </p>
                  )}
                </div>

                <div className="border-t border-slate-800 my-2" />

                {/* FORMULARIO TRADICIONAL DE REGISTRO */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Spotify Track ID</label>
                    <input
                      {...register('spotifyTrackId')}
                      placeholder="Se autocompleta desde el buscador..."
                      className="w-full bg-slate-800 border-none rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 text-sm placeholder:text-slate-600 font-mono text-xs"
                    />
                    {errors.spotifyTrackId && <span className="text-xs text-red-400 font-bold block mt-1">⚠️ {errors.spotifyTrackId.message}</span>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Título de la Canción</label>
                    <input
                      {...register('title')}
                      placeholder="Ej: Starboy"
                      className="w-full bg-slate-800 border-none rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 text-sm placeholder:text-slate-600"
                    />
                    {errors.title && <span className="text-xs text-red-400 font-bold block mt-1">⚠️ {errors.title.message}</span>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Artista / Banda</label>
                    <input
                      {...register('artist')}
                      placeholder="Ej: The Weeknd"
                      className="w-full bg-slate-800 border-none rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 text-sm placeholder:text-slate-600"
                    />
                    {errors.artist && <span className="text-xs text-red-400 font-bold block mt-1">⚠️ {errors.artist.message}</span>}
                  </div>

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