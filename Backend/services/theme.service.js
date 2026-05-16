import {Theme} from "../models/theme.model.js"

export const ThemeService = class {
    // Para el Admin: Crear un nuevo tema
    static async create(input) {
    try {
      // Combina la simplicidad de create con el control de errores
      return await Theme.create(input);
    } catch (error) {
      if (error.code === 11000) { // Código de error de MongoDB para duplicados (esto ocurre si intentas crear un tema con un "day" que ya existe, por ejemplo) 
        throw new Error("El [day] del tema ya está registrado porque debe ser un valor único. Por favor, elige otro número de día.");
      }
      throw new Error(`Error en el servidor al crear el tema: ${error.message}`);
    }
  }

  // Para el Admin: Listar todos los temas ordenados por día
  static async getAllAdmin({ title, limit, offset } = {}) {
     try {
      const filter = title ? { title: { $regex: title, $options: "i" } } : {};
  
      // Aquí traemos todo, incluyendo email y role
      const [themes, total] = await Promise.all([
        Theme.find(filter)
          .limit(Number(limit))
          .skip(Number(offset))
          .sort({ createdAt: -1 }),
        Theme.countDocuments(filter),
      ]);
      return { themes, total };
      
    } catch (error) {
      // Atrapamos el error de la DB y lo lanzamos con un texto claro
      throw new Error(`Error en el servidor al obtener las temáticas: ${error.message}`);
    }
  }

  // Para el Cliente: Buscar el tema que está activo hoy según rango de fechas y estado
  static async getActive() {
    try {
      const now = new Date();
      // IMPORTANTE: Debe ser "find" para que devuelva un Array [] y no findOne que devuelve un objeto {}.
      return await Theme.find({ // aqui se encuentra la condicion de que el tema esté activo, es decir, que su estado sea "active" y que la fecha actual esté entre startDate y votingDeadline
        status: 'active', // el status lo da el admin al crear el tema
        startDate: { $lte: now }, // El tema ya ha comenzado y $lte es "menor o igual que" y now es la fecha actual (now tine que ser mayor o igual a startDate para que el tema esté activo)
        votingDeadline: { $gte: now } // El tema aún no ha cerrado para votación y $gte es "mayor o igual que" y now es la fecha actual ( now tiene que ser menor o igual a votingDeadline para que el tema esté activo)
      }).sort({ day: 1 });
    } catch (error) {
      throw new Error(`Error en el servidor al buscar la temática activa: ${error.message}`);
    }
  }
}