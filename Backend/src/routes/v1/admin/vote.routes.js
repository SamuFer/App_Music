import { Router } from "express"

import { VoteAdminController } from "../../../controllers/admin/vote.controller.js"

import { voteValidatorRequest } from "../../../middlewares/validators/vote.validator.js"

export const adminVoteRoutes = Router()

// El admin mira el estado global de las votaciones de toda la app (Dashboard) y es el promedio de la tematica si gusto o no
adminVoteRoutes.get('/dashboard/stats', VoteAdminController.getGlobalStats)