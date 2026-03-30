import { useState } from "react";
import type { Song } from "../types/song";
import SpotifyPlayer from './SpotifyPlayer.tsx'
import ScoreForm from './ScoreForm.tsx'

interface Props {
  songs: Song[];
}

export default function SongSlider({ songs }: Props) {
  const [current, setCurrent] = useState(0);

  // --- Estado: sin canciones que votar ---
  if (!songs || songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <span className="text-5xl">🎉</span>
        <h2 className="text-2xl font-bold text-white">
          ¡Todas las canciones están votadas!
        </h2>
        <p className="text-gray-400 text-sm">
          Vuelve más tarde para ver los resultados.
        </p>
      </div>
    );
  }

  const song = songs[current];
  const total = songs.length;

  const prev = () => setCurrent((i) => (i - 1 + total) % total);
  const next = () => setCurrent((i) => (i + 1) % total);

  return (
    <>
      {/* ── Tarjeta principal ── */}
      <div className="w-full max-w-360 border-white border-2">

        {/* Cabecera */}
        <header className="bg-purple border-b border-pink px-5 py-8 flex items-center justify-between md:px-10 text-white">
          <span className="text-[0.95rem] tracking-widest uppercase">
            DÍA {song.day} — En Votación
          </span>
          {/* TODO: calcular tiempo restante real desde song.votingDeadline */}
          <span className="text-[0.95rem] flex items-center gap-1">
            ⏱ 1d 14h
          </span>
        </header>

        {/* Cuerpo: dos columnas */}
        <div className="flex flex-col md:flex-row w-full">

          {/* Columna izquierda — info + player */}
          <article className="flex flex-col w-full p-5 gap-4 border-b md:border-b-0 md:border-r border-white/20">
            <div className="flex w-full justify-between gap-4">
              <div className="text-xs text-white/80 tracking-widest">
                // {song.theme} //
              </div>
              <div className="text-xs text-white/50">
                Por <span className="text-white">{song.submittedBy}</span>
              </div>
            </div>

            <h1
              className="font-vt text-[2.6rem] tracking-wide leading-none text-white mb-1"
              style={{ textShadow: "3px 0 0 #ff2d78, -2px 0 0 #00f5ff" }}
            >
              {song.title}
            </h1>

            <p className="text-sm tracking-[3px] text-white uppercase">
              [{song.artist}]
            </p>

            {/* TODO: reemplazar con <SpotifyPlayer> cuando esté listo */}
            <div className="mt-2 border border-dashed border-white/20 rounded p-4 text-white/30 text-xs text-center tracking-widest">
              <SpotifyPlayer trackId={song.spotifyTrackId} trackTitle={song.title} />
            </div>
          </article>

          {/* Columna derecha — ScoreForm */}
          <div className="flex flex-col w-full md:w-1/2 p-5 justify-center items-right">
            <ScoreForm songId={song.id} userId="mock-user-1" />
          </div>

        </div>
      </div>

      {/* ── Navegación inferior ── */}
      <nav className="flex w-full max-w-360 justify-between" aria-label="Navegar entre canciones">
        <button
          onClick={prev}
          className="text-xs text-white/50 hover:text-white tracking-widest uppercase transition"
          aria-label="Canción anterior"
        >
          ← Canción anterior
        </button>

        {/* Indicador de posición */}
        <span className="text-xs text-white/30 tracking-widest">
          {current + 1} / {total}
        </span>

        <button
          onClick={next}
          className="text-xs text-white/50 hover:text-white tracking-widest uppercase transition"
          aria-label="Siguiente canción"
        >
          Siguiente canción →
        </button>
      </nav>
    </>
  );
}