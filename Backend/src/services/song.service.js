import {Song} from '../models/song.model.js'
import {AppError} from '../utils/customError.js'

export const SongService = class {
  // Guardar una nueva canción (con control de duplicados masivo)(para el Admin)
  static async create(input) {
    try {
      const song = new Song(input);
      return await song.save();
    } catch (error) {
      // Capturamos el bloqueo del índice compuesto
      if (error.code === 11000){
        throw new AppError("Esta canción ya está registrada en esta temática (ya sea por nombre o por ID de Spotify).", 409)
      }
      throw new AppError(`Error en la base de datos al crear canción: ${error.message}`, 500)
    }
  }

  // Listar catálogo completo (para el Admin)
  static async getAll() {
    try {
      return await Song.find({}); // El objeto vacío trae TODO lo que exista en la colección
    } catch (error) {
      throw new AppError(`Error al obtener catálogo: ${error.message}`, 500)
    }
  }

  // Buscar todas las canciones que pertenecen a una temática específica
  static async getById(id) {
    try {
      // Buscamos todas las canciones asociadas a este tema
      return await Song.find({ themeId: id });
    } catch (error) {
      throw new AppError(`Error en el servidor al buscar las canciones de esta temática: ${error.message}`, 500)
    }
  }

  // Eliminar canción por su ID único (para el Admin)
  static async delete(songId) {
    try {
      // Devuelve el objeto borrado o null si no existía (el controlador manejará el 404 si es null)
      return await Song.findByIdAndDelete(songId);
    } catch (error) {
      throw new AppError(`Error en la base de datos al eliminar la canción: ${error.message}`, 500)
    }
  }
};