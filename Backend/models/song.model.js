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

// Aplicamos el helper para limpiar los campos id, _id y __v al transformarlo a JSON
songSchema.set('toJSON', normalizeJson())

export const Song = mongoose.model('Song', songSchema)