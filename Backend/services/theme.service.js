import {Theme} from "../models/theme.model.js"

export const ThemeService = class {
    // Para el Admin: Crear un nuevo tema
    static async create(input) {
    try {
      // Combina la simplicidad de create con el control de errores
      return await Theme.create(input);
    } catch (error) {
      if (error.code === 11000) {
        throw new Error("El tema ya está registrado");
      }
      throw new Error(`Error en el servidor: ${error.message}`);
    }
  }

  // Para el Admin: Listar todos los temas ordenados por día
  static async getAlladmin() {
    try {
      return await Theme.find().sort({ day: 1 });
    } catch (error) {
      throw new Error(`Error en el servidor al obtener temáticas: ${error.message}`);
    }
  }

  // Para el Cliente: Buscar el tema que está activo hoy según rango de fechas y estado
  static async getActive() {
    try {
      const now = new Date();
      return await Theme.findOne({
        status: 'active',
        startDate: { $lte: now }, // El tema ya ha comenzado y $lte es "menor o igual que" y now es la fecha actual (now tine que ser mayor o igual a startDate para que el tema esté activo)
        votingDeadline: { $gte: now } // El tema aún no ha cerrado para votación y $gte es "mayor o igual que" y now es la fecha actual ( now tiene que ser menor o igual a votingDeadline para que el tema esté activo)
      });
    } catch (error) {
      throw new Error(`Error en el servidor al buscar la temática activa: ${error.message}`);
    }
  }
}