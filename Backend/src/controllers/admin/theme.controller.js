import { ThemeService } from "../../services/theme.service.js"
import { DEFAULTS } from "../../config/index.js"
import { AppError } from "../../utils/customError.js"
import { formatPaginatedResponse } from "../../utils/pagination.helper.js"

export const ThemeAdminController = class {
    // OBTENER TODAS LAS TEMÁTICAS CON PAGINACIÓN
    static async getAll(req, res) {
      try {
        const { title, limit, offset } = req.query; 
        const {themes, total} = await ThemeService.getAllAdmin({ title, limit, offset })
        
        // Simulación de paginación simple sobre el array de resultados
        // (En el futuro esto lo manejará tu base de datos directamente)
        // Le pasamos el array de datos al helper y él construye todo el JSON de respuesta con la sección de pagination incluida
        const response = formatPaginatedResponse({data: themes, totalDocuments: total, limit, offset}) // [data] se utiliza cuando hay varias tematicas
        
        return res.status(200).json(response)

      } catch (error) {
        // Si el servicio falló, este catch evita que el servidor muera y responde con elegancia
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: `// ${error.message}` })
        }
        return res.status(500).json({ error: `// Error interno del servidor: ${error.message}` })
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

  // ELIMINAR UNA TEMÁTICA
  static async delete(req, res) {
    try {
      const { id } = req.params;
      await ThemeService.delete(id)

      return res.status(200).json({
        success: true,
        message: "Temática eliminada exitosamente por el administrador"
      });
    } catch (error) {
      if (error instanceof AppError) {
          return res.status(error.statusCode).json({ error: `// ${error.message}` });
      }
      return res.status(500).json({ error: `// Error interno al eliminar temática: ${error.message}` })
    }
  }

}