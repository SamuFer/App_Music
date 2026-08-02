import { UserService } from '../../services/user.service.js';
import {AppError} from '../../utils/customError.js'
import { formatPaginatedResponse } from '../../utils/pagination.helper.js'
import { DEFAULTS } from '../../config/index.js'

  export const UserAdminController = class {
    
    // 1. OBTENER TODOS LOS USUARIOS EN CRUDO (VISTA ADMIN)
    static async getAll(req, res) {
      try {
        // 🟢 2. Normalizas los parámetros en la entrada HTTP
        const limit = Number(req.query.limit) || DEFAULTS.LIMIT_PAGINATION;
        const offset = Number(req.query.offset) || DEFAULTS.LIMIT_OFFSET;
        const { name } = req.query;

        // 3. Pasas variables 100% limpias al servicio
        const { users, total } = await UserService.getAllAdmin({ name, limit, offset });

        // 4. El helper empaqueta todo sin adivinar nada
        const response = formatPaginatedResponse({ data: users, totalDocuments: total, limit, offset });
        return res.status(200).json(response);

      } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: `// ${error.message}` });
        }
        return res.status(500).json({ error: `// Error interno del servidor: ${error.message}` });
      }
    }

    // 3. CREAR UN USUARIO
    static async create(req, res) {
      try {
          const { name, email, password, role } = req.body

          // 💡 Adiós validaciones manuales: el middleware ya las maneja.

          const newUser = await UserService.create({ 
            name, 
            email, 
            password, 
            role: role || 'user' 
          })

          return res.status(201).json({
            success: true,
            message: "Usuario creado exitosamente por el administrador",
            data: newUser
          })

      } catch (error) {
          // 🔥 Si el email ya existe, el servicio manda 409 y aquí se responde de forma limpia
          if (error instanceof AppError) {
              return res.status(error.statusCode).json({ error: `// ${error.message}` })
          }
          return res.status(500).json({ error: `// Error interno al crear el usuario: ${error.message}` })
      }
    }

    // 2. OBTENER UN USUARIO POR ID
    static async getById(req, res) {
      try {
        const { id } = req.params
        const user = await UserService.getById(id)
        
        if (!user) {
            return res.status(404).json({ error: "// Usuario no encontrado" })
        }
        
        return res.status(200).json({ success: true, data: user })

      } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: `// ${error.message}` });
        }
        return res.status(500).json({ error: `// Error al buscar el usuario: ${error.message}` })
      }
    }

    // 4. ACTUALIZAR
    static async update(req, res) {
      try {
        const { id } = req.params
        
        // SEGURIDAD: Solo permitimos editar estos campos
        const { name, email, role } = req.body

        const updatedUser = await UserService.update(id, { name, email, role })

        if (!updatedUser) {
            return res.status(404).json({ error: "// Usuario no encontrado" })
        }

        return res.status(200).json({ 
            success: true,
            message: "Usuario actualizado correctamente", 
            data: updatedUser 
        })

      } catch (error) {
        // Intercepta si el administrador intentó cambiar el email por uno ya registrado (409)
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: `// ${error.message}` })
        }
        return res.status(500).json({ error: `// Error al actualizar: ${error.message}` })
      }
    }

    // 5. BORRAR
    static async delete(req, res) {
      try {
        const { id } = req.params
        const deletedUser = await UserService.delete(id)

        if (!deletedUser) {
            return res.status(404).json({ error: "// Usuario no encontrado" })
        }

        return res.status(200).json({
            success: true,
            message: `Usuario con correo ${deletedUser.email} eliminado permanentemente del sistema`
        })

      } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: `// ${error.message}` })
        }
        return res.status(500).json({ error: `// Error al eliminar usuario: ${error.message}` })
      }
    }

    
  };