import { Router } from "express"
import { ThemeAdminController } from "../../../controllers/admin/theme.controller.js"
import { SongAdminController } from "../../../controllers/admin/song.controller.js"

export const adminThemeRoutes = Router()

adminThemeRoutes.get('/', ThemeAdminController.getAll)
adminThemeRoutes.post('/', ThemeAdminController.create)
adminThemeRoutes.get('/:themeId/songs', SongAdminController.getByThemeId)
adminThemeRoutes.post('/:themeId/songs', SongAdminController.create)