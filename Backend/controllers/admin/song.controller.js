import { SongService } from "../../services/song.service.js"
import { ThemeService } from "../../services/theme.service.js"
import mongoose from "mongoose"


export const SongAdminController = class {
    static async create(req, res){
        try {

            // 1. El themeId ahora viene de la URL (req.params)
            const { themeId } = req.params

            // 2. El resto de datos de la canción vienen del cuerpo (req.body)
            const {title, artist, spotifyTrackId, submittedBy} = req.body

            // Validaciones de campos obligatorios antes de golpear el servicio
            if (!themeId || !title || !artist || !spotifyTrackId) {
                return res.status(400).json({ error: "// Faltan datos obligatorios para registrar la canción (themeId, title, artist o spotifyTrackId)." });
            }

            // Validamos que el formato del themeId sea correcto
            if (!mongoose.isValidObjectId(themeId)) {
                return res.status(400).json({ error: "// El ID de la temática no tiene un formato válido." });
            }

            // 4. ANIDACIÓN SEGURA: Verificamos que esa temática exista en la DB antes de colgarle la canción
            const themeExists = await ThemeService.getById(themeId);
            if (!themeExists) {
                return res.status(404).json({ error: "// No puedes añadir una canción a una temática que no existe." });
            }

            const newSong = await SongService.create({
                themeId,
                title,
                artist,
                spotifyTrackId,
                submittedBy: submittedBy || "Admin" // Si no se proporciona quién la sugirió, se establece como "Admin" por defecto
            })

            return res.status(201).json({
                message: "Canción creada exitosamente por el administrador",
                data: newSong
            })

        } catch (error) {
            return res.status(500).json({ error: `// Error interno: ${error.message}` }); // Aquí puedes personalizar el mensaje de error según el tipo de error que quieras destacar
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
        return res.status(500).json({ error: `// Error interno: ${error.message}` });
        }
    }

    // GET: Listar canciones para el panel de administración (Nueva)
    static async getByThemeId(req, res) {
        try {
        const { themeId } = req.params;
        const songs = await SongService.getById(themeId)

        if (songs === null) {
            return res.status(400).json({ error: "// El formato del ID de la temática es incorrecto." });
        }

        // Validamos si existe la temática
        const themeExists = await ThemeService.getById(themeId); 
        if (!themeExists) {
            return res.status(404).json({ error: "// La temática especificada no existe en la Base de Datos." });
        }

        if (songs.length === 0) {
            return res.status(200).json({
                success: true,
                count: 0,
                message: "// Panel de Control: Esta temática está vacía. Lista para añadir canciones.",
                data: [] // Mandamos el array vacío seco para que su panel pinte una tabla vacía con el botón "Añadir"
            });
        }

        // El admin recibe la data cruda y completa de la DB para su gestión
        return res.json({
            success: true, 
            count: songs.length,
            data: songs 
        })
        } catch (error) {
            return res.status(500).json({ error: `// Error interno: ${error.message}` });
        }
    }

    // NUEVO: Controlador para eliminar una canción específica
    static async delete(req, res) {
        try {
        const { id } = req.params; // ID de la canción a borrar

        const deletedSong = await SongService.delete(id);

        // Escenario 1: El ID estaba mal escrito (Formato no válido)
        if (deletedSong === null && id.length !== 24) { 
            return res.status(400).json({ 
            error: "// Error: El formato del ID de la canción no es válido." 
            });
        }

        // Escenario 2: El ID tenía buen formato pero la canción ya no existía
        if (!deletedSong) {
            return res.status(404).json({ 
            error: "// Error: La canción que intentas eliminar no existe en la base de datos." 
            });
        }

        // Escenario 3: Eliminación exitosa
        return res.status(200).json({
            message: "// Canción eliminada correctamente del sistema.",
            deletedRecord: {
            id: deletedSong._id,
            title: deletedSong.title,
            artist: deletedSong.artist
            }
        });
        } catch (error) {
        return res.status(500).json({ error: `// Error interno al eliminar: ${error.message}` });
        }
    }
}