import { ThemeService } from "../../services/theme.service.js";

export const ThemeClientController = class {
    
    // OBTENER LA TEMÁTICA ACTIVA DEL DÍA
    static async getToday(req, res) {
      try {
        const activeTheme = await ThemeService.getActive();

        if (!activeTheme) {
          return res.status(404).json({ 
            message: '// No hay ninguna tematica activa para su votación para el día de hoy o en este momento.' 
          });
        }
        // Limpiamos cada temática del array usando .map()
        const cleanedThemes = activeTheme.map(theme => ({
          id: theme.id,
          day: theme.day,
          title: theme.title,
          votingDeadline: theme.votingDeadline
        }));
        return res.json({
          data: cleanedThemes
        });
      } catch (error) {
        // PROTECCIÓN CLIENTE: Ignoramos el error.message real de la DB por seguridad
        // y devolvemos un mensaje genérico fijo que no expone datos del servidor.
        return res.status(500).json({ error: '// Ocurrió un error al cargar la temática del día. Por favor, intenta más tarde.' });
      }
    }
}