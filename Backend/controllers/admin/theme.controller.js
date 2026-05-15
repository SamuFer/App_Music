import { ThemeService } from "../../services/theme.service.js"
import { DEFAULTS } from "../../config/index.js";

export const ThemeAdminController = class {
    // OBTENER TODAS LAS TEMÁTICAS CON PAGINACIÓN
    static async getAll(req, res) {
      try {
        const { limit, offset } = req.query; 
        const themes = await ThemeService.getAlladmin();
        
        // Simulación de paginación simple sobre el array de resultados
        // (En el futuro esto lo manejará tu base de datos directamente)
        return res.json({
          data: themes,
          pagination: {
            totalDocuments: themes.length,
            count: themes.length,
            limit: Number(limit) || DEFAULTS.LIMIT_PAGINATION,
            offset: Number(offset) || DEFAULTS.LIMIT_OFFSET
          }
        });
      } catch (error) {
        return res.status(500).json({ error: '// Error al obtener la lista completa de temáticas o error de servidor' });
      }
    }

    // CREAR UNA TEMÁTICA
    static async create(req, res) {
      try {
          const { day, title, startDate, votingDeadline, status } = req.body;

          // Validaciones de campos obligatorios antes de golpear el servicio
          if (!day || !title || !startDate || !votingDeadline) {
            return res.status(400).json({ error: "// El día, título, fecha de inicio y fecha límite son obligatorios" });
          }

          const newTheme = await ThemeService.create({ 
            day, 
            title, 
            startDate, 
            votingDeadline,
            status: status || 'active' 
          });

          return res.status(201).json({
            message: "Temática creada exitosamente por el administrador",
            data: newTheme
          });
      } catch (error) {
          return res.status(400).json({ error: `// ${error.message}` }); // Aquí puedes personalizar el mensaje de error según el tipo de error que quieras destacar
      }
    }
}