import songs from '../songs.json' with { type: 'json' }
import { DEFAULTS } from '../config.js'

export class SongModel {
  static async getAll ({ title, limit = DEFAULTS.LIMIT_PAGINATION, offset = DEFAULTS.LIMIT_OFFSET }) {
    let filteredSongs = songs

    if (title) {
      const searchTerm = title.toLowerCase()
      filteredSongs = filteredSongs.filter(song =>
        song.title.toLowerCase().includes(searchTerm)
      )
    }

    const limitNumber = Number(limit)
    const offsetNumber = Number(offset)

    return filteredSongs.slice(offsetNumber, offsetNumber + limitNumber)
  }

  static async getById (id) {
    // Buscamos por ID (manejando string o number según el mock)
    return songs.find(song => song.id === id || song.id === Number(id))
  }

  static async create (input) {
    const { day, title, artist, spotifyTrackId, theme, submittedBy, groupAverage } = input

    const newSong = {
      id: crypto.randomUUID(),
      day,
      title,
      artist,
      spotifyTrackId,
      theme,
      submittedBy,
      votingDeadline: new Date('2026-10-16T23:59:59').toISOString(), // Fecha ejemplo
      groupAverage: groupAverage ?? 0
    }

    songs.push(newSong) // Nota: Esto solo persiste en memoria hasta reiniciar el server
    return newSong
  }
}
