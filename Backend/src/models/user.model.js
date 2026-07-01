import mongoose from 'mongoose'
import { normalizeJson } from '../utils/model.helper.js'

const userSchema = new mongoose.Schema({
    name: {
            type: String,
            required: true,
            trim: true
            // puede haber un index de texto para búsquedas más rápidas, pero no es obligatorio
    },
    email :{
            type: String,
            required: true,
            unique: true,
            trim: true, // Elimina espacios al inicio y al final
            lowercase: true
    },
    password:{
            type: String,
            required: true
    },
    role:{
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
    }
},  {
    timestamps: true
});

// Configuramos el método toJSON para transformar la salida de los documentos
// Solo le dices qué campo extra quieres ocultar por seguridad en normalizeJson, en este caso el password, y el helper se encarga de todo.
userSchema.set('toJSON', normalizeJson(['password']));

export const User = mongoose.model('user', userSchema);

