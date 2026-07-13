import { SongService } from "../../services/song.service.js"
import { ThemeService } from "../../services/theme.service.js"
import { AppError } from "../../utils/customError.js"
import mongoose from "mongoose"


export const SongAdminController = class {
    static async create(req, res){
        try {
            // 1. Desestructuración limpia (el middleware ya validó que existen)
            const { themeId } = req.params
            const { title, artist, spotifyTrackId, submittedBy } = req.body

            // 2. ANIDACIÓN SEGURA: Comprobar existencia en la DB
            const themeExists = await ThemeService.getById(themeId);
            if (!themeExists) {
                return res.status(404).json({ error: "// No puedes añadir una canción a una temática que no existe." });
            }

            // 🛡️ NUEVO ESCUDO: Verificar el estado y tiempo de la temática
            const ahora = new Date();
            // Regla A: Si ya figura como 'closed', se bloquea inmediatamente.
            if (themeExists.status === 'closed') {
                return res.status(400).json({ error: "// Error: No puedes añadir canciones. Esta temática ya está cerrada." });
            }
            // Regla B: Si dice 'active' pero el tiempo ya pasó, reparamos la DB y bloqueamos.
            if (themeExists.status === 'active' && ahora > themeExists.votingDeadline) {
                 // Autoreparamos el estado en la base de datos (igual que hicimos en votos)
                 await ThemeService.autoCloseActiveThemes();
                 return res.status(400).json({ error: "// Error: El tiempo para esta temática finalizó. No se admiten más canciones." });
            }

            const newSong = await SongService.create({
                themeId,
                title,
                artist,
                spotifyTrackId,
                submittedBy: submittedBy || "Admin"
            })

            return res.status(201).json({
                message: "Canción creada exitosamente por el administrador",
                data: newSong
            })

        } catch (error) {
            // 🔥 MAGIA: Si el error viene del AppError del servicio (ej: código 409 de duplicado), 
            // respondemos con su código exacto. Si es otro fallo raro, cae en el 500.
            if (error instanceof AppError) { // que hace instanceof? Comprueba si el error es una instancia de la clase AppError.
                return res.status(error.statusCode).json({ error: `// ${error.message}` })
            }
            return res.status(500).json({ error: `// Error interno no controlado: ${error.message}` })
        }
    }

    // NUEVO: Controlador para listar TODO el catálogo
    static async getAll(req, res) {
        try {
            const songs = await SongService.getAll();

            // Al Admin le interesa saber cuántas canciones hay en total (count)
            return res.status(200).json({
                success: true,
                count: songs.length,
                data: songs // Al admin le pasamos la data cruda completa
            });
        } catch (error) {
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: `// ${error.message}` })
            return res.status(500).json({ error: `// Error interno: ${error.message}` })
        }
    }

    // GET: Listar canciones para el panel de administración (Nueva)
    static async getByThemeId(req, res) {
        try {
        const { themeId } = req.params;
        
        // Validamos primero si existe la temática en la DB
        const themeExists = await ThemeService.getById(themeId)
        if (!themeExists) {
            return res.status(404).json({ error: "// La temática especificada no existe en la Base de Datos." })
        }

        // Llamamos al nuevo método del servicio que renombramos antes
        const songs = await SongService.getById(themeId)

        // Respuesta unificada (si count es 0, el frontend ya sabe que está vacía y lista para llenar)
        return res.status(200).json({
            success: true, 
            count: songs.length,
            message: songs.length === 0 ? "// Panel de Control: Esta temática está vacía. Lista para añadir canciones." : undefined,
            data: songs 
        })
        
        } catch (error) {
            if (error instanceof AppError) return res.status(error.statusCode).json({ error: `// ${error.message}` })
            return res.status(500).json({ error: `// Error interno: ${error.message}` })
        }
    }

    // NUEVO: Controlador para eliminar una canción específica
    static async delete(req, res) {
        try {
        const { id } = req.params; // ID de la canción a borrar

        // El servicio intenta borrar. Devuelve el documento eliminado si existía, o null si no.
        const deletedSong = await SongService.delete(id)

        // ESCENARIO único de ausencia: El ID tenía buen formato pero la canción ya no existía
        if (!deletedSong) {
            return res.status(404).json({ 
                error: "// Error: La canción que intentas eliminar no existe en la base de datos." 
            });
        }

        // ESCENARIO: Eliminación exitosa
        return res.status(200).json({
            success: true,
            message: "// Canción eliminada correctamente del sistema.",
            deletedRecord: {
                id: deletedSong.id,
                title: deletedSong.title,
                artist: deletedSong.artist
            }
        })

        } catch (error) {
            // Interceptamos si el servicio lanza un AppError controlado, si no, cae en el 500
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: `// ${error.message}` })
            }
            return res.status(500).json({ error: `// Error interno al eliminar: ${error.message}` })
        }
    }
}