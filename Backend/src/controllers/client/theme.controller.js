import { ThemeService } from "../../services/theme.service.js"
import { AppError } from "../../utils/customError.js"

export const ThemeClientController = class {
    
    // OBTENER LA TEMÁTICA ACTIVA DEL DÍA
    static async getToday(req, res) {
      try {
        const activeTheme = await ThemeService.getActive();
        // Si es un array vacío o null, significa que no hay temáticas activas en este rango de fechas
        if (!activeTheme || activeTheme.length === 0) {
          return res.status(404).json({ 
            suscess: false,
            message: '// No hay ninguna tematica activa para su votación para el día de hoy o en este momento.' 
          });
        }

        // Limpiamos cada temática del array usando .map() para enviar solo lo justo
        const cleanedThemes = activeTheme.map(theme => ({
          id: theme.id,
          day: theme.day,
          title: theme.title,
          votingDeadline: theme.votingDeadline
        }))

        return res.status(200).json({
          success: true,
          data: cleanedThemes
        })

      } catch (error) {
       // Si el error es una instancia de AppError, respondemos con su código exacto
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: `// ${error.message}` })
        }

        // PROTECCIÓN CLIENTE: Si es un error desconocido de la DB, enviamos tu mensaje seguro
        return res.status(500).json({ 
            error: '// Ocurrió un error al cargar la temática del día. Por favor, intenta más tarde.' 
        })
      }
    }
    
    // OBTENER PRÓXIMAS TEMÁTICAS (Agenda / Expectativa)
  static async getUpcoming(req, res) {
    try {
      const upcomingThemes = await ThemeService.getUpcoming();

      if (!upcomingThemes || upcomingThemes.length === 0) {
        return res.status(200).json({
          success: true,
          data: []
        });
      }

      // Filtramos y entregamos solo los campos públicos relevantes
      const cleanedThemes = upcomingThemes.map(theme => ({
        id: theme.id || theme._id,
        day: theme.day,
        title: theme.title,
        description: theme.description,
        startDate: theme.startDate,
        votingDeadline: theme.votingDeadline
      }));

      return res.status(200).json({
        success: true,
        data: cleanedThemes
      });

    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: `// ${error.message}` });
      }

      return res.status(500).json({
        error: '// Ocurrió un error al cargar las próximas temáticas. Por favor, intenta más tarde.'
      });
    }
  }
}