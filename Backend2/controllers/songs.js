import { SongModel } from '../models/song.js'

export class SongController {
  static async getAll (req, res) {
    const { title, limit, offset } = req.query
    const songs = await SongModel.getAll({ title, limit, offset })
    res.json(songs)
  }

  static async getById (req, res) {
    const { id } = req.params
    const song = await SongModel.getById(id)
    if (song) return res.json(song)
    res.status(404).json({ message: 'Song not found' })
  }

  static async create (req, res) {
    const newSong = await SongModel.create(req.body)
    res.status(201).json(newSong)
  }
}
