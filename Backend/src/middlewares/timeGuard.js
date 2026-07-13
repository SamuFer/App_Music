import {Theme} from "../models/theme.model.js"; // 💡 Asegúrate de apuntar a la ruta real de tu modelo Theme
import { ThemeService } from "../services/theme.service.js"; // 💡 Ajusta la ruta a tu servicio

export const verifyVoteWindow = async (req, res, next) => {
  try {
    const ahora = new Date();
    const { themeId } = req.params; // Capturamos el ID directamente del parámetro de la URL

    // 1. Buscamos la temática específica que intentan votar
    const targetTheme = await Theme.findById(themeId);
    
    // Si no existe el tema en la BBDD
    if (!targetTheme) {
      return res.status(404).json({ 
        success: false,
        message: '// La temática que intentas votar no existe.' 
      });
    }

    // 2. Control de estado: Si está en cola y aún no empieza
    if (targetTheme.status === 'upcoming') {
      return res.status(400).json({ 
        success: false,
        message: '// Lo sentimos, las votaciones para esta temática aún no han comenzado.' 
      });
    }

    // 3. 🛡️ EL ESCUDO DE TIEMPO (El Limbo)
    // Si la BBDD dice activa pero el reloj del servidor dice que ya caducó...
    if (targetTheme.status === 'active' && ahora > targetTheme.votingDeadline) {
      
      // ⚡ Ejecutamos la auto-reparación en tiempo real en la BBDD
      await ThemeService.autoCloseActiveThemes();
      
      // Rebotamos al usuario inmediatamente
      return res.status(400).json({ 
        success: false,
        message: '// Lo sentimos, el tiempo de votación para esta temática ya ha finalizado.' 
      });
    }

    // 4. Si la temática ya estaba correctamente guardada como cerrada
    if (targetTheme.status === 'closed') {
      return res.status(400).json({ 
        success: false,
        message: '// Lo sentimos, el tiempo de votación para esta temática ya ha finalizado.' 
      });
    }
    
    // Si pasa todos los escudos, permitimos el paso al controlador de votos
    next();
  } catch (error) {
    return res.status(500).json({ 
      error: `// Error al verificar la ventana de votación: ${error.message}` 
    });
  }
};