import { UserModel } from '../../models/user.model.js';
import { DEFAULTS } from '../../config/index.js';

  export const UserAdminController = class {
    
    // 1. OBTENER TODOS LOS USUARIOS EN CRUDO
    static async getAll(req, res) {
      try {
        const { name, limit, offset } = req.query 
        const {users, total} = await UserModel.getAllAdmin({ name, limit, offset })
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
        return res.status(500).json({ error: 'Error al obtener la lista completa' });
      }
    }

    // 2. OBTENER UN USUARIO POR ID
    static async getById(req, res) {
      try {
        const { id } = req.params;
        const user = await UserModel.getById(id);
        
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
        
        return res.json(user);
      } catch (error) {
        return res.status(500).json({ error: "ID no válido o error de servidor" });
      }
    }

    // 3. CREAR UN USUARIO
    static async create(req, res) {
      try {
          const { name, email, password, role } = req.body;

          if (!name || !email || !password) {
            return res.status(400).json({ error: "Nombre, email y password son obligatorios" });
          }

          const newUser = await UserModel.create({ 
            name, 
            email, 
            password, 
            role: role || 'user' 
          });

          return res.status(201).json({
            message: "Usuario creado por administrador",
            data: newUser
          });
      } catch (error) {
          return res.status(400).json({ error: error.message });
      }
    }

    // 4. ACTUALIZAR
    static async update(req, res) {
      try {
        const { id } = req.params;

        const updatedUser = await UserModel.update(id, req.body);

        if (!updatedUser) return res.status(404).json({ error: "Usuario no existe" });

        return res.json({ message: "Usuario actualizado", data: updatedUser });
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }
    }

    // 5. BORRAR
    static async delete(req, res) {
      try {
        const { id } = req.params;
        const deletedUser = await UserModel.delete(id);

        if (!deletedUser) return res.status(404).json({ error: "Usuario no existe" });

        return res.json({
          message: `Usuario ${deletedUser.email} eliminado permanentemente`
        });
      } catch (error) {
        return res.status(500).json({ error: "Error al eliminar" });
      }
    }
  };