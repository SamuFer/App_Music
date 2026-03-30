// src/components/SpotifyPlayer.tsx
interface Props {
  trackId: string;
  trackTitle: string;
}

export default function SpotifyPlayer({ trackId, trackTitle }: Props) {
  const embedUrl = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;

  return (
    <iframe
      src={embedUrl}
      title={`Reproductor de Spotify: ${trackTitle}`}
      width="100%"
      height="80"
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  );
}