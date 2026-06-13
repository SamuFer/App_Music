import { Router } from "express"
import { ThemeClientController } from "../../../controllers/client/theme.controller.js"
import { SongClientController } from "../../../controllers/client/song.controller.js"

export const clientThemeRoutes = Router()

clientThemeRoutes.get('/', ThemeClientController.getToday) 
clientThemeRoutes.get('/:themeId/songs', SongClientController.getByThemeId) 
