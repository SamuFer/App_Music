import { Router } from "express"
import { SongAdminController } from "../../../controllers/admin/song.controller.js"


export const adminSongRoutes = Router()
// Obtener todo el catálogo de canciones
adminSongRoutes.get('/', SongAdminController.getAll);

// Eliminar una canción específica usando SU propio ID de canción
adminSongRoutes.delete('/:id', SongAdminController.delete);

