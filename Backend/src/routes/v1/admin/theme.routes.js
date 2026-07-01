import { Router } from "express"

import { ThemeAdminController } from "../../../controllers/admin/theme.controller.js"
import { SongAdminController } from "../../../controllers/admin/song.controller.js"
import { VoteAdminController } from "../../../controllers/admin/vote.controller.js"

import { songValidator } from "../../../middlewares/validators/song.validator.js"
import { themeValidator } from "../../../middlewares/validators/theme.validator.js"
import { voteValidatorRequest } from "../../../middlewares/validators/vote.validator.js"

export const adminThemeRoutes = Router()

adminThemeRoutes.get('/', ThemeAdminController.getAll)
adminThemeRoutes.post('/', themeValidator, ThemeAdminController.create)

adminThemeRoutes.get('/:themeId/songs', songValidator, SongAdminController.getByThemeId)
adminThemeRoutes.post('/:themeId/songs', songValidator, SongAdminController.create)

// Ver el historial global de temáticas cerradas (promedio de tematica si gusto o no)
adminThemeRoutes.get('/votes/history', voteValidatorRequest, VoteAdminController.getHistoryOfThemes)

// El admin ve los resultados generales y promedios de CUALQUIER temática metiendo su ID
adminThemeRoutes.get('/:themeId/votes/audit', voteValidatorRequest, VoteAdminController.getThemeDetailedResults)

// Ver el podio de los 3 mejores
adminThemeRoutes.get('/:themeId/votes/top-three', voteValidatorRequest, VoteAdminController.getThemeTopThree)
