import { UserService} from '../../services/user.service.js';
import {AppError} from '../../utils/customError.js'
import { formatPaginatedResponse } from '../../utils/pagination.helper.js'
import { DEFAULTS } from '../../config/index.js'

export const UserClientController = class {
  static async getAll(req, res) {
    try {
      // 🟢 2. Sanitizamos y aplicamos defaults en el Controller (Entrada HTTP)
      const limit = Number(req.query.limit) || DEFAULTS.LIMIT_PAGINATION;
      const offset = Number(req.query.offset) || DEFAULTS.LIMIT_OFFSET;
      const { name } = req.query;

      // 3. Pasamos variables 100% numéricas y limpias al Servicio
      const { users, total } = await UserService.getAll({ name, limit, offset });

      // 4. El Helper construye la respuesta JSON estandarizada con los valores reales
      const response = formatPaginatedResponse({ 
        data: users, 
        totalDocuments: total, 
        limit, 
        offset 
      });

      return res.status(200).json(response);
      
    } catch (error) {
      // Si el error es una instancia de AppError, respondemos con su código exacto
      if (error instanceof AppError) {
          return res.status(error.statusCode).json({ error: `// ${error.message}` });
      }

      // PROTECCIÓN CLIENTE: Mensaje genérico seguro si explota la base de datos de manera imprevista
      return res.status(500).json({ error: '// Error al obtener la lista de participantes.' });
    }
  }

  // static async create(req, res) {
  //   try {
  //     // 1. Verificación en consola (mira tu terminal de VS Code al dar a Send)
  //     console.log("Datos que entran:", req.body);

  //     const { name, email, password, role } = req.body;
  //     // Si no viene un rol, o si queremos forzar que por defecto sea user:
  //     const finalRole = role || 'user';

  //     // 2. Validación de presencia
  //     if (!name || !email || !password) {
  //       return res.status(400).json({ 
  //         error: "Faltan campos obligatorios: name, email y password" 
  //       });
  //     }

  //     // 3. Pasar al modelo
  //     const newUser = await UserModel.create({ name, email, password, role: finalRole });
      
  //     return res.status(201).json({
  //       message: "Usuario creado",
  //       data: newUser
  //     });

  //   } catch (error) {
  //     return res.status(400).json({ error: error.message });
  //   }
  // }
}

