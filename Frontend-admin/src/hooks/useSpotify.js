// src/hooks/useSpotify.js
import { useState, useEffect } from 'react'
import { spotifyApi } from '../api/spotify'

export function useSpotify() {
  const [query, setQuery] = useState('')
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Si el usuario borra el buscador, limpiamos las canciones y el error inmediatamente
    if (!query || query.trim() === '') {
      setTracks([])
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    // ⏱️ DEBOUNCE: Esperamos 400ms después de que el usuario deje de escribir
    const delayDebounceFn = setTimeout(async () => {
      try {
        const data = await spotifyApi.search(query)
        // Guardamos el array de canciones que viene en data.tracks
        setTracks(data.tracks || [])
      } catch (err) {
        // Tu apiFetch ya lanza un Error con el mensaje formateado como '// Error...'
        setError(err.message)
        setTracks([])
      } finally {
        setLoading(false)
      }
    }, 400)

    // Si el usuario vuelve a escribir antes de los 400ms, cancelamos el temporizador anterior
    return () => clearTimeout(delayDebounceFn)
  }, [query]);

  return {
    query,
    setQuery,
    tracks,
    loading,
    error,
    setTracks // Lo exportamos por si queremos limpiar la lista al seleccionar una canción
  };
}