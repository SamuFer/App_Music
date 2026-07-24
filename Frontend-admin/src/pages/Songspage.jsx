import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { songSchema } from '../schemas/songSchema';
import { useThemes } from '../hooks/useThemes';
import { useSongs } from '../hooks/useSongs';
import { useSpotify } from '../hooks/useSpotify';
import { useLocation } from 'react-router-dom';

export default function SongsPage() {
  const { themes, isLoading: loadingThemes } = useThemes();
  const location = useLocation(); // 2. Instanciamos el location
  const [selectedThemeId, setSelectedThemeId] = useState(location.state?.themeId || '');
  const [isFocused, setIsFocused] = useState(false);
  
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
  // 🛡️ NUEVA VALIDACIÓN EN TIEMPO REAL (Reflejo del Backend)
  // Permite gestión en 'active' y 'upcoming', pero bloquea 'closed' o expiradas.
  const canManageSongs = (() => {
    if (!currentTheme) return false;
    
    // Si explícitamente ya está guardada como cerrada
    if (currentTheme.status === 'closed') return false;
    
    // 2. Si el reloj ya superó el plazo de finalización, se bloquea por caducidad
    const ahora = new Date();
    const deadline = new Date(currentTheme.votingDeadline);
    if (ahora > deadline) return false;

    // 3. Permite tanto 'active' como 'upcoming'
    return currentTheme.status === 'active' || currentTheme.status === 'upcoming';
  })();

  // 2. Extraemos 'setValue' y 'watch' de react-hook-form
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(songSchema)
  });

  // Escuchamos si cambian los campos manuales para gestionar cierres si es necesario
  const watchTitle = watch('title');

  const onSubmit = (data) => {
    if (!canManageSongs) return;

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
            {canManageSongs ? (
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
                    //  CÓDIGO OPTIMIZADO (Más limpio)
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)} // 💡 Detecta cuando entras al buscador
                    onBlur={() => {
                      // Usamos un pequeño retraso para que le dé tiempo a registrar el clic en la lista antes de cerrarse
                      setTimeout(() => setIsFocused(false), 200); 
                    }}
                    placeholder="🔍 Escribe título o artista..."
                    className="w-full bg-slate-800 border-none rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 text-sm placeholder:text-slate-500"
                  />
                  
                  {/* 🛠️ FIX: Solo muestra el cargando si realmente hay texto escrito en el query */}
                  {loadingSpotify && query.trim() !== '' && (
                    <p className="text-[11px] text-slate-400 animate-pulse ml-1">Buscando en la API...</p>
                  )}

                  {errorSpotify && (
                    <p className="text-[11px] text-red-400 ml-1 font-semibold">{errorSpotify}</p>
                  )}

                  {/* 📋 MENÚ DESPLEGABLE DE RESULTADOS (Solo se muestra si está enfocado y hay canciones) */}
                  {isFocused && tracks.length > 0 && (
                    <ul className="absolute top-[100%] left-0 right-0 bg-slate-800 border border-slate-700 rounded-xl mt-1 shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto divide-y divide-slate-700">
                      {tracks.map((track) => (
                        <li
                          key={track.id}
                          onClick={() => manejarSeleccionTrack(track)}
                          className="flex items-center gap-3 p-2.5 hover:bg-slate-700/60 transition-colors cursor-pointer text-left group/item"
                        >
                          <div className="relative w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
                            {track.image && (
                              <img 
                                src={track.image} 
                                alt={track.album} 
                                className="w-full h-full object-cover" 
                              />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate text-slate-100">{track.title}</p>
                            <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                          </div>

                          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 group-hover/item:bg-emerald-500/20 group-hover/item:text-emerald-400 px-2 py-1 rounded-md font-extrabold uppercase tracking-wide shrink-0 transition-colors">
                            Seleccionar
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* 🛠️ FIX: Añadimos query.trim().length >= 3 para que no parpadee al empezar a escribir */}
                  {/* {query.trim().length >= 3 && !loadingSpotify && tracks && tracks.length === 0 && !errorSpotify && (
                    <p className="text-[11px] text-amber-400 ml-1 italic">
                      No se encontraron coincidencias en Spotify. Puedes rellenar abajo manualmente.
                    </p>
                  )} */}
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
                  {currentTheme?.status === 'closed' ? (
                    <span>Esta jornada ha sido **finalizada** formalmente. No se admiten modificaciones ni nuevas pistas.</span>
                  ) : (
                    <span>El tiempo límite de votación (`votingDeadline`) ya ha expirado. El sistema ha cerrado la admisión de canciones para esta temática o es una jornada UPCOMING.</span>
                  )}
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

                    {canManageSongs && (
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