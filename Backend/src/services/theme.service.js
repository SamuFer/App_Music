import {Theme} from "../models/theme.model.js"
import { AppError } from "../utils/customError.js"

export const ThemeService = class {
    // Para el Admin: Crear un nuevo tema
   static async create(input) {
      try {
        const ahora = new Date();
        const inicio = new Date(input.startDate);
        const fin = new Date(input.votingDeadline);

        // 🛡️ Validar consistencia básica de rangos
        if (fin <= inicio) {
          throw new AppError("La fecha límite de votación debe ser posterior a la fecha de inicio.", 400);
        }

        // 🛡️ Validar que la jornada no expire antes de nacer
        if (fin <= ahora) {
          throw new AppError("No se puede crear una temática cuya fecha límite de votación ya expiró.", 400);
        }

        // Aseguramos que el estado entre limpio en minúsculas por si acaso
        if (input.status) input.status = input.status.toLowerCase();

        return await Theme.create(input);
      } catch (error) {
        if (error instanceof AppError) throw error;
        if (error.code === 11000) { 
          throw new AppError("El [day] del tema ya está registrado porque debe ser un valor único. Por favor, elige otro número de día.", 409);
        }
        throw new AppError(`Error en el servidor al crear el tema: ${error.message}`, 500);
      }
    }

    // NUEVO: Para el Admin: Actualizar una temática por ID (Completa el CRUD)
    static async update(id, data) {
      try {
        if (data.startDate && data.votingDeadline) {
          const inicio = new Date(data.startDate);
          const fin = new Date(data.votingDeadline);
          
          if (fin <= inicio) {
            throw new AppError("La fecha límite de votación debe ser posterior a la fecha de inicio.", 400);
          }
        }

        if (data.status) data.status = data.status.toLowerCase();

        return await Theme.findByIdAndUpdate(id, data, {
          returnDocument: 'after', 
          runValidators: true
        });
      } catch (error) {
        if (error instanceof AppError) throw error;
        if (error.code === 11000) {
          throw new AppError("No se puede actualizar: El número de [day] ingresado ya está en uso por otra temática.", 409);
        }
        throw new AppError(`Error al actualizar la temática: ${error.message}`, 500);
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

  // OPTIMIZADO: Buscar el tema activo con escudo y transición en tiempo real
  static async getActive() {
    try {
      const now = new Date();

      // 1. Buscamos si hay algún tema marcado como 'active'
      let activeThemes = await Theme.find({ status: 'active' }).sort({ day: 1 })

      // 💡 INTERCEPTOR: Si hay un tema activo pero su tiempo ya venció, forzamos el relevo inmediato
      if (activeThemes.length > 0 && activeThemes[0].votingDeadline < now) {
        console.log(`⚡ [Real-time Sync] Detectada temática caducada (${activeThemes[0].title}). Ejecutando transición...`)
        await this.autoCloseActiveThemes();
        
        // Volvemos a consultar para traer el nuevo panorama real de la DB
        activeThemes = await Theme.find({ status: 'active' }).sort({ day: 1 })
      }

      // 2. Si no había ninguno activo, validamos si ya es hora de activar el siguiente 'upcoming' en cola
      if (activeThemes.length === 0) {
        const nextUpcoming = await Theme.findOne({ status: 'upcoming', startDate: { $lte: now } }).sort({ day: 1 })
        
        if (nextUpcoming) {
          nextUpcoming.status = 'active';
          await nextUpcoming.save();
          activeThemes = [nextUpcoming];
        }
      }

      // Retornamos el array filtrado asegurando la consistencia de las fechas
      return activeThemes.filter(theme => theme.startDate <= now && theme.votingDeadline >= now);

    } catch (error) {
      throw new AppError(`Error en el servidor al buscar la temática activa: ${error.message}`, 500);
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

  // Cerrar las temáticas activas que ya caducaron (o se forzaron)
  static async autoCloseActiveThemes() {  
    try {
      const ahora = new Date();
      
      // 1. Cerramos las temáticas que caducaron. Guardamos la verdad histórica en closedAt
      const result = await Theme.updateMany(
        { status: "active", votingDeadline: { $lte: ahora } }, 
        { 
          $set: { 
            status: "closed",
            closedAt: ahora // 👈 Guardamos el hecho real aquí para tu análisis
          } 
        }
      );
      
      // 2. Buscamos la siguiente temática en cola respetando estrictamente el calendario
      const nextTheme = await Theme.findOne({ 
        status: "upcoming", 
        startDate: { $lte: ahora } 
      }).sort({ day: 1 });

      // 3. Si el calendario dice que ya llegó su hora de inicio, la activamos
      if (nextTheme) {
        nextTheme.status = "active";
        await nextTheme.save();
      }

      return {
        totalCerrados: result.modifiedCount,
        nextTheme: nextTheme 
      };
      
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error en el automatizador de temáticas: ${error.message}`, 500);
    }
  }

}