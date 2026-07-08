import { SpotifyService } from "../../services/spotify.service.js"
import { AppError } from "../../utils/customError.js"

export const SpotifyAdminController = class {
  static async search(req, res) {
    try {
      // 1. Capturamos el término de búsqueda (el middleware ya validó que existe y es válido)
      const { q } = req.query;

      // 2. Llamamos al servicio estático para realizar la búsqueda real
      const tracks = await SpotifyService.search(q);

      // 3. Respuesta exitosa estructurada con tu estilo habitual
      return res.status(200).json({
        message: "Búsqueda en Spotify realizada con éxito",
        tracks
      });

    } catch (error) {
      // 🔥 Tu mismo manejo de errores personalizado:
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: `// ${error.message}` });
      }
      return res.status(500).json({ error: `// Error interno no controlado: ${error.message}` });
    }
  }
};