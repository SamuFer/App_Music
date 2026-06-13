import {SongService} from '../../services/song.service.js'
import { ThemeService } from "../../services/theme.service.js"

export const SongClientController = class {
    static async getByThemeId(req, res){
        try {
            const {themeId} = req.params

            const songs = await SongService.getById(themeId)

            // Si el servicio devolvió null, significa que el ID estaba mal escrito (isValidObjectId falló)
            if (songs === null) {
                return res.status(400).json({ 
                error: "// El ID de la temática no es válido." 
                });
            }

            // PASO 2: Si el ID tenía buen formato, comprobamos si la temática realmente existe en el sistema
            const themeExists = await ThemeService.getById(themeId);
            if (!themeExists) {
                return res.status(404).json({ 
                error: "// La temática solicitada no existe." 
                });
            }

            // Si no hay canciones, respondemos 200 con un aviso
            if (songs.length === 0) {
                return res.status(200).json({
                    message: "// Esta temática aún no tiene canciones registradas. ¡Vuelve más tarde!",
                    data: []
                });
            }
            // Mapeamos para asegurarnos de enviar solo lo que el cliente necesita renderizar
            const cleaned = songs.map(song => ({
                id: song.id,
                title: song.title,
                artist: song.artist,
                spotifyTrackId: song.spotifyTrackId,
                submittedBy: song.submittedBy
            }));
            return res.status(200).json({
                data: cleaned
            })
        } catch (error) {
            return res.status(500).json({ error: `// ${error.message}` }); // Aquí puedes personalizar el mensaje de error según el tipo de error que quieras destacar
        }   
    }
}