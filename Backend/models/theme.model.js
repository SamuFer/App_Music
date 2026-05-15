import mongoose from "mongoose"
import { normalizeJson } from "../utils/model.helper.js"

const themeSchema = new mongoose.Schema({
    // Necesario para saber qué día del calendario es
    day : {type: Number, required: true, unique: true},

    // Título de la temática (ej: 'Canción para llorar y beber')
    title : {type: String, required: true, trim: true}, // trim para eliminar espacios al inicio y al final

    // Control de tiempo
    startDate: {type: Date, required: true}, // Cuándo aparece en el cliente o fecha de inicio del tema
    votingDeadline: {type: Date, required: true}, // Cuándo se oculta el ScoreForm y se termina el periodo de votación

    // Estado semántico
    status: {
        type: String,
        enum: ['upcoming', 'active', 'closed'],
        default: 'active'
    }
},{ 
    // Agrega automáticamente campos createdAt y updatedAt
    timestamps: true 
})

// Configuramos el método toJSON para transformar la salida de los documentos
// Como no necesita borrar nada extra, lo dejas vacío. Limpiará id, _id y __v solo con el helper.
themeSchema.set('toJSON', normalizeJson())

export const Theme = mongoose.model('theme', themeSchema);