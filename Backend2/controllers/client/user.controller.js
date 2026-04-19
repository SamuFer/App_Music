import { UserModel} from '../../models/user.model.js';
import { DEFAULTS } from '../../config/index.js';

export const UserController = class {
  static async getAll(req, res) {
    try {
     
      const { name, limit, offset } = req.query;

      const { users, total } = await UserModel.getAll({ name, limit, offset });

      return res.json({
        data: users,
        pagination: {
          totalDocuments: total,
          count: users.length,
          limit: Number(limit) || DEFAULTS.LIMIT_PAGINATION,
          offset: Number(offset) || DEFAULTS.LIMIT_OFFSET
        }
      });
    } catch (error) {
      return res.status(500).json({ error: 'Error al obtener usuarios' });
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

