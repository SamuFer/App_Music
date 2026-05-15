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

        return res.json({
          data: activeTheme
        });
      } catch (error) {
        return res.status(500).json({ error: `// ${error.message}` });
      }
    }
}