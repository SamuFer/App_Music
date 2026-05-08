// src/components/SongSlider.tsx
import { useState } from "react";
import type { Song } from "../types/song";
import SpotifyPlayer from './SpotifyPlayer.tsx'
import ScoreForm from './ScoreForm.tsx'

interface Props {
  songs: Song[];
}

export default function SongSlider({ songs: initialSongs }: Props) {
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [current, setCurrent] = useState(0);
  const total = initialSongs.length; // fijo desde el inicio, no cambia

  const voted = total - songs.length;
  const percent = total > 0 ? Math.round((voted / total) * 100) : 0;

  // Al votar con éxito: elimina la canción actual de la lista pendiente
  const handleVoteSuccess = () => {
    setSongs((prev) => {
      const next = prev.filter((_, i) => i !== current);
      // Si el índice actual ya no existe, retrocede uno
      if (current >= next.length && next.length > 0) {
        setCurrent(next.length - 1);
      }
      return next;
    });
  };

  // --- Estado: sin canciones que votar ---
  if (songs.length === 0) {
    return (
      <div className="w-full max-w-360 flex flex-col items-center gap-6">
        <ProgressBar voted={total} total={total} percent={100} />
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <span className="text-5xl">🎉</span>
          <h2 className="font-vt text-2xl text-white tracking-widest">
            ¡Todas las canciones votadas!
          </h2>
          <p className="font-vt text-dim text-sm tracking-[2px]">
            // Vuelve más tarde para ver los resultados
          </p>
        </div>
      </div>
    );
  }

  const song = songs[current];
  const remaining = songs.length;

  const prev = () => setCurrent((i) => (i - 1 + remaining) % remaining);
  const next = () => setCurrent((i) => (i + 1) % remaining);

  return (
    <>
      {/* ── Barra de progreso ── */}
      <ProgressBar voted={voted} total={total} percent={percent} />

      {/* ── Tarjeta principal ── */}
      <div className="font-display w-full max-w-360 border-white border-2">

        {/* Cabecera */}
        <header className="bg-linear-to-r from-black to-[#2C2C2C] border-b border-pink px-5 py-2 flex items-center justify-between md:px-5 text-white">
          <span className="text-[0.95rem] tracking-widest uppercase">
            DÍA {song.day} — En Votación
          </span>
          <span className="text-[0.95rem] flex items-center gap-1">
            ⏱ 1d 14h
          </span>
        </header>

        {/* Cuerpo: dos columnas */}
        <div className="flex flex-col md:flex-row w-full">

          {/* Columna izquierda — info + player */}
          <article className="flex flex-col w-full p-5 gap-4 border-b md:border-b-0 md:border-r border-white/20">
            <div className="flex w-full justify-between gap-4">
              <div className="text-xs font-text text-white/80 tracking-widest">
                // {song.theme} //
              </div>
              <div className="text-xs text-white/50">
                Por <span className="text-white">{song.submittedBy}</span>
              </div>
            </div>

            <h1 className="font-display font-bold text-[1.8rem] md:text-[2.6rem] tracking-wide leading-none text-rose mb-1">
              {song.title}
            </h1>

            <p className="text-sm italic tracking-[3px] text-white uppercase">
              {song.artist}
            </p>

            <div className="mt-2 border border-dashed border-white/20 rounded p-4 text-white/30 text-xs text-center tracking-widest">
              <SpotifyPlayer trackId={song.spotifyTrackId} trackTitle={song.title} />
            </div>
          </article>

          {/* Columna derecha — ScoreForm */}
          <div className="flex flex-col w-full md:w-1/2 p-5 justify-center items-right">
            <ScoreForm
              songId={song.id}
              userId="mock-user-1"
              onVoteSuccess={handleVoteSuccess}
            />
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

        <span className="text-xs text-white/30 tracking-widest">
          {current + 1} / {remaining}
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

// ── Componente auxiliar de barra ───────────────────────────────────────────────
function ProgressBar({ voted, total, percent }: { voted: number; total: number; percent: number }) {
  return (
    <div
      className="w-full max-w-360"
      role="progressbar"
      aria-valuenow={voted}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`${voted} de ${total} canciones votadas`}
    >
      <div className="font-display flex justify-between items-center mb-1.5">
        <span className="text-[0.75rem] tracking-[2px] text-dim">
          PROGRESO DE VOTACIÓN
        </span>
        <span className="font-vt text-[0.75rem] tracking-[2px] text-dim">
          <span className="text-cyan">{voted}</span> / {total} votadas
        </span>
      </div>

      <div className="w-full h-1.5 bg-dim/30 border border-dim/40">
        <div
          className="h-full bg-rose transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}