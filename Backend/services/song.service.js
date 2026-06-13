import {Song} from '../models/song.model.js'
import mongoose from 'mongoose'

export const SongService = class {
  // Guardar una nueva canción
  static async create(input) {
    try {
      const song = new Song(input);
      return await song.save();
    } catch (error) {
      throw new Error(
        `Error en la base de datos al crear la canción: ${error.message}`,
      );
    }
  }

  static async getAll() {
    try {
      return await Song.find({}); // El objeto vacío trae TODO lo que exista en la colección
    } catch (error) {
      throw new Error(
        `Error en la base de datos al obtener el catálogo: ${error.message}`,
      );
    }
  }

  // Buscar todas las canciones que pertenecen a una temática específica
  static async getById(id) {
    // 1. Validación de formato de ID rápida a nivel de código
    if (!mongoose.isValidObjectId(id)) {
      return null; // Devolvemos null para avisarle al controlador que el formato está mal
    }

    try {
      // CORRECCIÓN: Buscamos por el campo themeId pasando el string directo, no entre llaves sueltas
      return await Song.find({ themeId: id });
    } catch (error) {
      throw new Error(
        `Error en el servidor al buscar las canciones de este ID: ${error.message}`,
      );
    }
  }

  // NUEVO: Eliminar una canción por su propio ID único
  static async delete(songId) {
    // Validación de formato rápida antes de tocar la DB
    if (!mongoose.isValidObjectId(songId)) {
      return null; // Avisamos que el ID está mal estructurado
    }

    try {
      // Buscamos y eliminamos de golpe. Devuelve el objeto borrado o null si no existía
      return await Song.findByIdAndDelete(songId);
    } catch (error) {
      throw new Error(`Error en la base de datos al eliminar la canción: ${error.message}`);
    }
  }
};