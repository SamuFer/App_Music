import { Router } from 'express'
import { SongController } from '../controllers/songs.js'

export const songsRouter = Router()

songsRouter.get('/', SongController.getAll)
songsRouter.get('/:id', SongController.getById)
songsRouter.post('/', SongController.create)
