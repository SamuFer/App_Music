import { Router } from "express"
import { SongAdminController } from "../../../controllers/admin/song.controller.js"
import { songValidator} from "../../../middlewares/validators/song.validator.js"

import { voteValidatorRequest } from "../../../middlewares/validators/vote.validator.js"
import { VoteAdminController } from "../../../controllers/admin/vote.controller.js"


export const adminSongRoutes = Router()
// Obtener todo el catálogo de canciones
adminSongRoutes.get('/', SongAdminController.getAll);

// Eliminar una canción específica usando SU propio ID de canción
adminSongRoutes.delete('/:id', songValidator, SongAdminController.delete);

// Ver una canción con el desglose de quién votó ---
adminSongRoutes.get('/:songId/votes/audit', voteValidatorRequest, VoteAdminController.getSongAuditDetails)
