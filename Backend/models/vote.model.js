import mongoose from "mongoose"
import {normalizeJson} from "../utils/model.helper.js"

const voteSchema = new mongoose.Schema(
    {
        themeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Theme",
            required: true
        },

        songId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Song",
            required: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        
        score: { // La nota que el usuario le da a la canción
            type: Number,
            required: true,
            min: [1, "// La puntuación mínima es 1"],
            max: [10, "// La puntuación máxima es 10"],
            validate: {
                validator: Number.isInteger,
                message: "// La puntuación debe ser un número entero del 1 al 10"
            }
        }
    }, 
    { timestamps: true } 
)

// 🔥 TRUCO DE ESTABILIDAD: Evita que el mismo userId vote por la misma songId más de una vez
voteSchema.index({ songId: 1, userId: 1 }, { unique: true })

// Aplicamos el helper para limpiar los campos id, _id y __v al transformarlo a JSON
voteSchema.set('toJSON', normalizeJson())

export const Vote = mongoose.model("Vote", voteSchema)