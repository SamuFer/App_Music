import cron from 'node-cron'
import { ThemeService } from "../services/theme.service.js"

export const initThemeCron = () => {
  // EJEMPLO 1: Se ejecuta TODOS los días a las 00:00 (Medianoche) -> "0 0 * * *"
  // EJEMPLO 2: Se ejecuta cada 5 minutos (ideal para probar en Bruno/consola) -> "*/5 * * * *"
  
  cron.schedule("0 0 * * *", async () => {
    console.log("⏰ [CRON] Iniciando automatizador: Verificando temáticas para cerrar...");
    
    try {
      const {totalCerrados, nextTheme} = await ThemeService.autoCloseActiveThemes();
      
      if (totalCerrados > 0) {
        console.log(`✅ [CRON] Éxito: Se han cerrado ${totalCerrados} temática(s) automáticamente.`);
      } else {
        console.log("ℹ️ [CRON] No había temáticas activas para cerrar hoy.");
      }


      // Informe de aperturas / upcoming
      if (nextTheme) {
        console.log(`🔥 [CRON] ¡Nuevo tema activado automáticamente!: ${nextTheme.title}`);
      } else {
        console.log("⚠️ [CRON] Alerta: No hay más temas 'upcoming' en la cola para activar.");
      }

    } catch (error) {
      console.error(`❌ [CRON] Error crítico en la tarea automática: ${error.message}`);
    }
  });

  console.log("🚀 [CRON] Tareas automáticas de Temáticas cargadas correctamente.");
};