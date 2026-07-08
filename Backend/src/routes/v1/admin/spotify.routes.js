import { Router } from "express"

import { SpotifyAdminController } from '../../../controllers/admin/spotify.controller.js'
import { spotifyValidator } from '../../../middlewares/validators/spotify.validator.js'

// Si pasa la validación nativa del parámetro 'q', avanza hacia el controlador de Spotify
export const adminSpotifyRoutes = Router()
adminSpotifyRoutes.get('/search', spotifyValidator, SpotifyAdminController.search)