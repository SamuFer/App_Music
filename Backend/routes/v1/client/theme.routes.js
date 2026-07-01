import { Router } from "express"
import { ThemeClientController } from "../../../controllers/client/theme.controller.js"

import { SongClientController } from "../../../controllers/client/song.controller.js"

import { VoteClientController } from "../../../controllers/client/vote.controller.js"

import { songValidator } from "../../../middlewares/validators/song.validator.js"
import { voteValidatorRequest } from "../../../middlewares/validators/vote.validator.js"

export const clientThemeRoutes = Router()

clientThemeRoutes.get('/', ThemeClientController.getToday) 

clientThemeRoutes.get('/:themeId/songs', songValidator, SongClientController.getByThemeId) 

// 1. Ruta para emitir un voto (Exige themeId, songId en URL y userId en Body)
clientThemeRoutes.post('/:themeId/songs/:songId/votes', voteValidatorRequest, VoteClientController.castVote)

// 2. Ruta para ver los resultados en vivo de una temática (Exige themeId en URL)
// clientThemeRoutes.get('/:themeId/votes/results', voteValidatorRequest, VoteClientController.getResults)

// El cliente pide las canciones listas para votar con su nota media calculada
clientThemeRoutes.get('/:themeId/voting-panel', voteValidatorRequest, VoteClientController.getVotingPanel)