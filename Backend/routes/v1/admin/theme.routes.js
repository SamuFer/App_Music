import { Router } from "express"
import { ThemeAdminController } from "../../../controllers/admin/theme.controller.js"
import { SongAdminController } from "../../../controllers/admin/song.controller.js"
import { songValidator } from "../../../middlewares/validators/song.validator.js"
import { themeValidator } from "../../../middlewares/validators/theme.validator.js"

export const adminThemeRoutes = Router()

adminThemeRoutes.get('/', ThemeAdminController.getAll)
adminThemeRoutes.post('/', themeValidator, ThemeAdminController.create)
adminThemeRoutes.get('/:themeId/songs', songValidator, SongAdminController.getByThemeId)
adminThemeRoutes.post('/:themeId/songs', songValidator, SongAdminController.create)