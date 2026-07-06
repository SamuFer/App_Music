import { VoteService } from "../../services/vote.service.js"
import { Vote } from "../../models/vote.model.js"
import { User } from "../../models/user.model.js"
import { Theme } from "../../models/theme.model.js"
import { AppError } from "../../utils/customError.js"

export const VoteAdminController = class {

    // 1.AUDITORÍA DE RESULTADOS GENERALES DE UNA TEMÁTICA PARA EL ADMIN
    static async getThemeDetailedResults(req, res) {
        try {
        const { themeId } = req.params;

        // Reutilizamos el servicio. El admin ve el listado completo, promedios y detalles
        const detailedResults = await VoteService.getClientSongsWithAverage(themeId)

        return res.status(200).json({
            success: true,
            message: "// Resultados detallados de la temática obtenidos correctamente para administración.",
            data: detailedResults
        })

        } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: `// ${error.message}` })
        }
        return res.status(500).json({ error: `// Error al auditar resultados de la temática: ${error.message}` })
        }
    }

    // 2. PODIO: TOP 3 DE CANCIONES DE UN TEMA
    static async getThemeTopThree(req, res) {
        try {
            const { themeId } = req.params;
            
            const topThree = await VoteService.getTopSongsByTheme(themeId);
            
            return res.status(200).json({
                success: true,
                message: "// Top 3 de canciones más votadas y su rendimiento promedio obtenido.",
                data: topThree
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: `// ${error.message}` })
        }
            return res.status(500).json({ error: `// Error al obtener el podio: ${error.message}` })
        }
    }

    // 3. NUEVO: DETALLE AISLADO DE UNA CANCIÓN CON SU HISTORIAL DE PUNTUACIONES
    static async getSongAuditDetails(req, res) {
        try {
            const { songId } = req.params;
            const detailedSong = await VoteService.getSongDetailsWithVotes(songId);

            return res.status(200).json({
                success: true,
                data: detailedSong
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: `// ${error.message}` });
            }
            return res.status(500).json({ error: `// Error al auditar la canción: ${error.message}` });
        }
    }

    // 4. NUEVO: HISTORIAL COMPLETO DE TEMÁTICAS PARA EL ADMIN
    static async getHistoryOfThemes(req, res) {
        try {
            const history = await VoteService.getThemesHistory();
            return res.status(200).json({
                success: true,
                data: history
            });
        } catch (error) {
            return res.status(500).json({ error: `// Error al cargar el historial: ${error.message}` });
        }
    }

    // 5.ESTADÍSTICAS GLOBALES DEL DASHBOARD (Solo para el Admin)
    static async getGlobalStats(req, res) {
        try {
            // Hacemos consultas paralelas rápidas para no bloquear la base de datos
            const [totalVotes, totalUsers, totalThemes, votesByTheme] = await Promise.all([
                Vote.countDocuments(), // Total de votos históricos
                User.countDocuments(), // RECUENTO NUEVO: Cuántos usuarios se han registrado
                Theme.countDocuments(), // RECUENTO NUEVO: Cuántas jornadas/temáticas se han creado en total
            
                // Agregación para ver cuántos votos totales tuvo cada temática
                Vote.aggregate([
                        { 
                            $group: { 
                            _id: "$themeId", 
                            globalAverageScore: { $avg: "$score" }, 
                            totalVotes: { $sum: 1 } 
                            } 
                        },
                        // 1. Unimos con la colección de Temáticas (asegúrate de que el nombre de la colección en tu Mongo sea 'themes')
                        {
                            $lookup: {
                                from: "themes",         // Nombre exacto de la colección en la base de datos
                                localField: "_id",      // El themeId por el que agrupamos antes
                                foreignField: "_id",    // El ID principal de la temática
                                as: "themeInfo"         // Dónde se guardará el resultado (devuelve un array)
                            }
                        },
                        // 2. Desestructuramos el array que nos devuelve el lookup para transformarlo en un objeto directo
                        { $unwind: "$themeInfo" },
                        // 3. Proyectamos (limpiamos) los datos para enviar solo lo que el frontend necesita
                        {
                            $project: {
                                _id: 1, // 1 es igual a true, 0 es false. Mantenemos el ID de la temática
                                totalVotes: 1,
                                globalAverageScore: 1,
                                themeTitle: "$themeInfo.title", // 👈 ¡Mágicamente extraemos el Título!
                                themeDay: "$themeInfo.day"      // 👈 ¡Y el número de día!
                            }
                        },
                        // 4. Lo ordenamos por mayor participación
                        { $sort: { totalVotes: -1 } }
                ])
            ])

            // Cálculo de engagement: Promedio de votos que deja cada usuario registrado
            const engagementRatio = totalUsers > 0 ? (totalVotes / totalUsers).toFixed(1) : 0

            return res.status(200).json({
            success: true,
            data: {
                totalHistoricalVotes: totalVotes,
                totalRegisteredUsers: totalUsers,
                totalCreatedThemes: totalThemes,
                votesPerUserRatio: engagementRatio,
                rankingThemesByParticipation: votesByTheme
            }
            })
        } catch (error) {
            return res.status(500).json({ error: `// Error al generar estadísticas globales: ${error.message}` })
        }
    }

}