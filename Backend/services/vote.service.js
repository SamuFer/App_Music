import { Vote } from '../models/vote.model.js'
import { Theme } from '../models/theme.model.js'

import { Song } from '../models/song.model.js'

import { AppError } from '../utils/customError.js'
import mongoose from 'mongoose'

export const VoteService = class {
    
    // 1.Registrar un nuevo voto
    static async createVote(themeId, songId, userId, score) {
        // 1. Buscar la temática para comprobar su estado de vigencia
        const theme = await Theme.findById(themeId)
        if (!theme) {
            throw new AppError("La temática especificada no existe.", 404)
        }

        // 🛑 REGLA DE ORO: Si no está activa (es upcoming o closed), se bloquea el voto
        if (theme.status !== "active") {
            throw new AppError("Bloqueado: No se permiten votos en temáticas planificadas o ya cerradas.", 400)
        }

        try {
            // 2. Crear el voto. Gracias al índice único, si el userId ya votó esa songId, saltará al catch
            return await Vote.create({ themeId, songId, userId, score })
        } catch (error) {
            // Código de error de MongoDB para violaciones de índices únicos (Duplicados)
            if (error.code === 11000) {
                throw new AppError("Ya has puntuado esta canción en esta temática.", 409)
        }
            throw new AppError(`Error en la base de datos al registrar el voto: ${error.message}`, 500)
        }


    }

    // 2. OBTENER EL TOP 3 DE UNA TEMÁTICA
    static async getTopSongsByTheme(themeId) {
        try {
            return await Vote.aggregate([
                // 1. Filtramos los votos de la temática seleccionada
                { $match: { themeId: new mongoose.Types.ObjectId(themeId) } },
                
                // 2. Agrupamos por canción y calculamos la media ($avg) de sus puntuaciones
                { 
                $group: { 
                    _id: "$songId", 
                    totalVotosEmitidos: { $sum: 1 }, // Opcional: para saber cuánta gente votó por ella
                    notaMedia: { $avg: "$score" } // Calcula el promedio real (ej: 8.5)
                } 
                },
                
                // 3. Ordenamos de la nota promedio más alta a la más baja
                { $sort: { notaMedia: -1 } },
                
                // 4. Nos quedamos con el podio (las 3 mejores puntuadas)
                { $limit: 3 },
                
                // 5. Proyectamos el resultado final redondeando la nota a un decimal
                {
                $project: {
                    songId: "$_id",
                    _id: 0,
                    totalVotosEmitidos: 1,
                    notaMedia: { $round: ["$notaMedia", 1] } // Redondea a un decimal (ej: 9.3)
                }
                }
            ])
        } catch (error) {
            throw new AppError(`Error al calcular el ranking de puntuaciones: ${error.message}`, 500);
        }
    }

    // 3. ESTRUCTURA BASE PARA CLIENTE Y ADMIN (Resultados con Medias)
    static async getClientSongsWithAverage(themeId) {
        try {
            return await Song.aggregate([
                // 1. Filtramos solo las canciones que pertenecen a esta temática
                { $match: { themeId: new mongoose.Types.ObjectId(themeId) } },

                // 2. Traemos la información de la temática para obtener el votingDeadline
                {
                $lookup: {
                    from: "themes",         // Nombre de la colección de temáticas en tu DB
                    localField: "themeId",
                    foreignField: "_id",
                    as: "themeInfo"
                }
                },
                // Deshacemos el array que genera el lookup de temática
                { $unwind: "$themeInfo" },

                // 3. Traemos todos los votos asociados a esta canción para calcular el promedio
                {
                $lookup: {
                    from: "votes",          // Nombre de la colección de votos en tu DB
                    localField: "_id",
                    foreignField: "songId",
                    as: "songVotes"
                }
                },

                // 4. Proyectamos y calculamos los campos finales con el formato exacto de tu ejemplo
                {
                $project: {
                    id: "$_id", // Mapeamos _id a id de forma nativa
                    _id: 0,
                    day: "$themeInfo.day",
                    title: 1,
                    artist: 1,
                    spotifyTrackId: 1,
                    theme: "$themeInfo.title",
                    submittedBy: 1, // El usuario administrador o cliente que propuso la canción
                    votingDeadline: "$themeInfo.votingDeadline",
                    
                    // Calculamos la media aritmética ($avg) de los scores del 1 al 10 en el array songVotes
                    groupAverage: {
                    $ifNull: [
                        { $round: [{ $avg: "$songVotes.score" }, 1] }, 
                        0 // Si nadie ha votado por la canción aún, devolvemos 0 en promedio
                    ]
                    }
                }
                },

                // 5. Opcional: Ordenamos las canciones por día o por promedio de mayor a menor
                { $sort: { groupAverage: -1 } }
            ]);

        } catch (error) {
            throw new AppError(`Error al procesar la lista de canciones con sus promedios: ${error.message}`, 500)
        }
    }

    // 4. NUEVO: DETALLE PROFUNDO DE UNA CANCIÓN INDIVIDUAL Y SUS VOTOS
    static async getSongDetailsWithVotes(songId) {
        try {
            const song = await Song.findById(songId);
            if (!song) throw new AppError("La canción solicitada no existe.", 404);

            const statistics = await Vote.aggregate([
                { $match: { songId: new mongoose.Types.ObjectId(songId) } },
                {
                    $group: {
                        _id: null, // 👈 Cambiamos esto a null para que no repita el ID de la canción
                        averageScore: { $avg: "$score" },
                        totalVotes: { $sum: 1 },
                        allVotes: { $push: { userId: "$userId", score: "$score", votedAt: "$createdAt" } }
                    }
                },
                {
                    $project: { _id: 0 } // 👈 Quitamos el campo _id por completo de las métricas
                }
            ]);

            return {
                song,
                metrics: statistics[0] || { averageScore: 0, totalVotes: 0, allVotes: [] }
            };
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(`Error al auditar el detalle de la canción: ${error.message}`, 500);
        }
    }

    // 5. NUEVO: HISTORIAL DE TEMÁTICAS PASADAS Y SU IMPACTO GENERAL
    static async getThemesHistory() {
        try {
            return await Theme.aggregate([
                { $sort: { day: -1 } }, // De la más reciente a la más antigua
                {
                    $lookup: {
                        from: "votes",
                        localField: "_id",
                        foreignField: "themeId",
                        as: "themeVotes"
                    }
                },
                {
                    $project: {
                        id: "$_id",
                        _id: 0,
                        title: 1,
                        day: 1,
                        status: 1,
                        totalVotesReceived: { $size: "$themeVotes" },
                        generalThemeAverage: {
                            $ifNull: [
                                { $round: [{ $avg: "$themeVotes.score" }, 1] },
                                0
                            ]
                        }
                    }
                }
            ]);
        } catch (error) {
            throw new AppError(`Error al procesar el historial de temáticas: ${error.message}`, 500);
        }
    }
}