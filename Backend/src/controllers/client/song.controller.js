import {SongService} from '../../services/song.service.js'
import { ThemeService } from "../../services/theme.service.js"
import { AppError } from "../../utils/customError.js"

export const SongClientController = class {
    static async getByThemeId(req, res){
        try {
            const {themeId} = req.params

            // 1. Comprobamos si la temática realmente existe en el sistema
            const themeExists = await ThemeService.getById(themeId)
            if (!themeExists) {
                return res.status(404).json({ 
                    error: "// La temática solicitada no existe." 
                });
            }

            // 2. Llamamos al nuevo método del servicio
            const songs = await SongService.getById(themeId)

            // 3. Si no hay canciones, respondemos 200 con tu aviso personalizado de UX
            if (songs.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: "// Esta temática aún no tiene canciones registradas. ¡Vuelve más tarde!",
                    data: []
                })
            }
            // 4. Mapeamos de forma segura para enviar solo lo necesario al Frontend-Cliente
            const cleaned = songs.map(song => ({
                id: song.id,
                title: song.title,
                artist: song.artist,
                spotifyTrackId: song.spotifyTrackId,
                submittedBy: song.submittedBy
            }))

            return res.status(200).json({
                success: true,
                data: cleaned
            })

        } catch (error) {
            // Interceptamos el AppError si algo falla en el servicio
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: `// ${error.message}` })
            }
            return res.status(500).json({ error: `// Error interno en el servidor: ${error.message}` })
        }   
    }
}