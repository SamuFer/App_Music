import {Theme} from "../models/theme.model.js"
import { AppError } from "../utils/customError.js"

export const ThemeService = class {
    // Para el Admin: Crear un nuevo tema
    static async create(input) {
      try {
        return await Theme.create(input);
      } catch (error) {
        // Código de error de MongoDB para duplicados (en este caso, el campo único "day")
        if (error.code === 11000) { 
          throw new AppError("El [day] del tema ya está registrado porque debe ser un valor único. Por favor, elige otro número de día.", 409);
        }
        throw new AppError(`Error en el servidor al crear el tema: ${error.message}`, 500);
      }
    }

  // Para el Admin: Listar todos los temas ordenados por día (Paginados y Filtrados) con estadísticas en tiempo real
  static async getAllAdmin({ title, limit, offset } = {}) {
     try {
      // 1. Definimos el filtro de búsqueda por título si el administrador escribió algo
      const matchStage = title ? { title: { $regex: title, $options: "i" } } : {};
  
      // 2. Ejecutamos la consulta agregada y el conteo de documentos en paralelo
      const [themes, total] = await Promise.all([
        Theme.aggregate([
          // Paso A: Filtramos las temáticas según la búsqueda
          { $match: matchStage },
          
          // Paso B: Cruzamos de forma inteligente con la colección de votos ("votes")
          {
            $lookup: {
              from: "votes",           // Nombre exacto de la colección en MongoDB
              localField: "_id",        // El ID de la temática
              foreignField: "themeId",  // El campo con el que se relaciona en la colección votos
              as: "votosAsociados"
            }
          },
          
          // Paso C: Calculamos los totales y promedios directamente en el motor de la DB
          {
            $addFields: {
              votesCount: { $size: "$votosAsociados" },
              averageScore: { $ifNull: [ { $avg: "$votosAsociados.score" }, 0 ] }
            }
          },
          
          // Paso D: Excluimos el array de votos asociados para que la respuesta de red sea ligera
          {
            $project: {
              votosAsociados: 0
            }
          },
          
          // Paso E: Aplicamos el ordenamiento por fecha de creación y las reglas de paginación
          { $sort: { createdAt: -1 } },
          { $skip: Number(offset) || 0 },
          { $limit: Number(limit) || 10 }
        ]),
        
        Theme.countDocuments(matchStage),
      ]);

      // 3. Mapeamos de forma limpia los resultados para asegurar que mantengan el formato toJSON del helper
      const sanitizedThemes = themes.map(theme => {
        const { _id, ...rest } = theme;
        return { id: _id.toString(), ...rest };
      });

      return { themes: sanitizedThemes, total };
      
    } catch (error) {
      throw new AppError(`Error en el servidor al obtener las temáticas con auditoría: ${error.message}`, 500);
    }
  }

  // Para el Admin: Eliminar una temática por su ID
  static async delete(id) {
    try {
      const deletedTheme = await Theme.findByIdAndDelete(id);
      if (!deletedTheme) {
        throw new AppError("La temática que intentas eliminar no existe.", 404)
      }
      return deletedTheme;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error en el servidor al eliminar la temática: ${error.message}`, 500)
    }
  }

  // Para el Cliente: Buscar el tema que está activo hoy según rango de fechas y estado
  static async getActive() {
    try {
      const now = new Date()
      // IMPORTANTE: Debe ser "find" para que devuelva un Array [] y no findOne que devuelve un objeto {}.
      return await Theme.find({ // aqui se encuentra la condicion de que el tema esté activo, es decir, que su estado sea "active" y que la fecha actual esté entre startDate y votingDeadline
        status: 'active', // el status lo da el admin al crear el tema
        startDate: { $lte: now }, // El tema ya ha comenzado y $lte es "menor o igual que" y now es la fecha actual (now tine que ser mayor o igual a startDate para que el tema esté activo)
        votingDeadline: { $gte: now } // El tema aún no ha cerrado para votación y $gte es "mayor o igual que" y now es la fecha actual ( now tiene que ser menor o igual a votingDeadline para que el tema esté activo)
      }).sort({ day: 1 })
    } catch (error) {
      throw new AppError(`Error en el servidor al buscar la temática activa: ${error.message}`, 500)
    }
  }

  // NUEVO: Buscar una temática por su ID
  static async getById(id) {
    // 💡 NOTA: Quitamos el "if (!isValidObjectId)" manual porque el middleware lo frenará en la puerta.
    try {
      // Buscamos el documento por su ID único en MongoDB
      return await Theme.findById(id) 
    } catch (error) {
      throw new AppError(`Error en la base de datos al buscar la temática: ${error.message}`, 500)
    }
  }

  // NUEVO: Cerrar las temáticas activas que ya caducaron
  static async autoCloseActiveThemes() {
    try {
      // Opción A: Cerrar ABSOLUTAMENTE TODO lo que esté 'active' actualmente
      // const result = await Theme.updateMany(
      //   { status: "active" }, 
      //   { $set: { status: "closed" } }
      // );

     // Opción B (Más profesional): Si tus temas tienen una fecha de finalización (endDate),
      // 1. Cerramos las temáticas cuya fecha límite de votación ya venció
      const ahora = new Date();
      const result = await Theme.updateMany(
        { status: "active", votingDeadline: { $lte: ahora } }, 
        { $set: { status: "closed" } }
      )
      // 2. Buscamos la siguiente temática en cola para activar
      const nextTheme = await Theme.findOne({ status: "upcoming" }).sort({ createdAt: 1 }) // O .sort({ startDate: 1 })

      // 3. Si existe una temática futura, la activamos e impactamos en la DB aquí mismo
      if (nextTheme) {
        nextTheme.status = "active";
        await nextTheme.save();
      }

      // 4. Devolvemos un OBJETO con toda la información que el Cron necesita imprimir
      return {
        totalCerrados: result.modifiedCount,
        nextTheme: nextTheme // Enviamos el documento entero (o null si no había)
      }
    } catch (error) {
      throw new AppError(`Error en el automatizador de temáticas: ${error.message}`, 500)
    }
  }

}