import { ThemeService } from "../../services/theme.service.js"
import { DEFAULTS } from "../../config/index.js"
import { AppError } from "../../utils/customError.js"
import { formatPaginatedResponse } from "../../utils/pagination.helper.js"

export const ThemeAdminController = class {
    // OBTENER TODAS LAS TEMÁTICAS CON PAGINACIÓN
    static async getAll(req, res) {
      try {
        // 🟢 Sanitizamos los datos de la URL aquí
        const limit = Number(req.query.limit) || DEFAULTS.LIMIT_PAGINATION;
        const offset = Number(req.query.offset) || DEFAULTS.LIMIT_OFFSET;
        const { title } = req.query;

        // Pasamos datos limpios y garantizados
        const { themes, total } = await ThemeService.getAllAdmin({ title, limit, offset });
        
        // El helper solo empaqueta la respuesta final
        const response = formatPaginatedResponse({ data: themes, totalDocuments: total, limit, offset });
        
        return res.status(200).json(response);

      } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: `// ${error.message}` });
        }
        return res.status(500).json({ error: `// Error interno del servidor: ${error.message}` });
      }
    }

    // CREAR UNA TEMÁTICA
    static async create(req, res) {
      try {
          const { day, title, startDate, votingDeadline, status } = req.body;

          // 💡 Las validaciones de campos obligatorios ya se hicieron en el middleware

          const newTheme = await ThemeService.create({ 
            day, 
            title, 
            startDate, 
            votingDeadline,
            status: status || 'upcoming' // Si no se proporciona un estado, se establece como 'upcoming' por defecto
          });

          return res.status(201).json({
            success: true,
            message: "Temática creada exitosamente por el administrador",
            data: newTheme
          });
      } catch (error) {
          // 🔥 Si el servicio lanza el error 409 por día duplicado, aquí se responde correctamente
          if (error instanceof AppError) {
              return res.status(error.statusCode).json({ error: `// ${error.message}` });
          }
          return res.status(500).json({ error: `// Error interno al crear temática: ${error.message}` })
      }
    }

    // NUEVO: OBTENER UNA TEMÁTICA POR ID (Para vistas de detalle y auditoría)
    static async getById(req, res) {
      try {
        const { id } = req.params;
        const theme = await ThemeService.getById(id);

        if (!theme) {
          return res.status(404).json({ error: "// La temática especificada no existe." });
        }

        return res.status(200).json({
          success: true,
          data: theme
        });
      } catch (error) {
        if (error instanceof AppError) {
          return res.status(error.statusCode).json({ error: `// ${error.message}` });
        }
        return res.status(500).json({ error: `// Error interno al buscar la temática: ${error.message}` });
      }
    }

    // NUEVO: ACTUALIZAR UNA TEMÁTICA COMPLETAMENTE (CRUD)
    static async update(req, res) {
      try {
        const { id } = req.params
        const { day, title, startDate, votingDeadline, status } = req.body

        const updatedTheme = await ThemeService.update(id, {
          day,
          title,
          startDate,
          votingDeadline,
          status
        });

        if (!updatedTheme) {
          return res.status(404).json({ error: "// La temática especificada no existe." })
        }

        return res.status(200).json({
          success: true,
          message: "Temática modificada y actualizada correctamente por el administrador.",
          data: updatedTheme
        });
      } catch (error) {
        if (error instanceof AppError) {
          return res.status(error.statusCode).json({ error: `// ${error.message}` })
        }
        return res.status(500).json({ error: `// Error interno al intentar actualizar la temática: ${error.message}` })
      }
    }

    // NUEVO: CIERRE DE EMERGENCIA CONTROLADO (PATCH)
    static async forceClose(req, res) {
      try {
        const { id } = req.params

        const closedTheme = await ThemeService.update(id, {
          status: "closed",
          votingDeadline: new Date() // Seteamos el fin de votación al "ahora" real
        })

        if (!closedTheme) {
          return res.status(404).json({ error: "// La temática no existe." })
        }

        // Ejecutamos el relevo automático en este mismo instante para activar la siguiente si existe
        await ThemeService.autoCloseActiveThemes()

        return res.status(200).json({
          success: true,
          message: "Temática cerrada de emergencia exitosamente y cola actualizada.",
          data: closedTheme
        })
      } catch (error) {
        if (error instanceof AppError) {
          return res.status(error.statusCode).json({ error: `// ${error.message}` })
        }
        return res.status(500).json({ error: `// Error al cerrar la temática: ${error.message}` })
      }
    }

  // ELIMINAR UNA TEMÁTICA
  static async delete(req, res) {
    try {
      const { id } = req.params;
      await ThemeService.delete(id)

      return res.status(200).json({
        success: true,
        message: "Temática eliminada exitosamente por el administrador"
      })
    } catch (error) {
      if (error instanceof AppError) {
          return res.status(error.statusCode).json({ error: `// ${error.message}` });
      }
      return res.status(500).json({ error: `// Error interno al eliminar temática: ${error.message}` })
    }
  }

}