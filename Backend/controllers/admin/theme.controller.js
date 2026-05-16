import { ThemeService } from "../../services/theme.service.js"
import { DEFAULTS } from "../../config/index.js";
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
        return res.json(response)

      } catch (error) {
        // Si el servicio falló, este catch evita que el servidor muera y responde con elegancia
        return res.status(500).json({ error: `// ${error.message}` });
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
            status: status || 'upcoming' // Si no se proporciona un estado, se establece como 'upcoming' por defecto
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