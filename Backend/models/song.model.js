import mongoose from 'mongoose'
import {normalizeJson} from '../utils/model.helper.js'

const songSchema = new mongoose.Schema({
    // Relación con el tema: guarda el ID del tema al que pertenece
    themeId: {type: mongoose.Schema.Types.ObjectId, ref: 'Theme', required: true},

    title: {type: String, required: true},

    artist: {type: String, required: true},

    spotifyTrackId: {type: String, required: true},
    
    // Quién sugirió la canción (Usuario o Admin)
    submittedBy: {type: String, default: "Admin"}
},{
    timestamps: true,
})

// Candado inteligente: Evita repetir canción + artista en la misma temática
songSchema.index({ themeId: 1, title: 1, artist: 1 }, { unique: true })

// 2. 🔥 NUEVO CANDADO: Evita la misma canción exacta de Spotify en la misma temática
songSchema.index({ themeId: 1, spotifyTrackId: 1 }, { unique: true })

// Aplicamos el helper para limpiar los campos id, _id y __v al transformarlo a JSON
songSchema.set('toJSON', normalizeJson())

export const Song = mongoose.model('Song', songSchema)