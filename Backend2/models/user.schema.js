import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
            type: String,
            required: true,
            trim: true
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
userSchema.set('toJSON', {
    transform: (doc, ret) => {        
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password; // No exponemos la contraseña
        return ret;
    }
});

export const User = mongoose.model('user', userSchema);

