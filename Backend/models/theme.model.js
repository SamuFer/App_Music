import mongoose from "mongoose";

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
themeSchema.set('toJSON', {
    transform: (doc, ret) => {        
        ret.id = ret._id.toString(); // Creamos 'id' legible
        delete ret._id; // Borramos el de MongoDB
        delete ret.__v; // Borramos la versión interna de Mongoose
        return ret;
    }
});

export const Theme = mongoose.model('theme', themeSchema);