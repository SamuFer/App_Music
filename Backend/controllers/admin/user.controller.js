import { UserService } from '../../services/user.service.js';

import { formatPaginatedResponse } from '../../utils/pagination.helper.js'

  export const UserAdminController = class {
    
    // 1. OBTENER TODOS LOS USUARIOS EN CRUDO
    static async getAll(req, res) {
      try {
        const { name, limit, offset } = req.query 
        const {users, total} = await UserService.getAllAdmin({ name, limit, offset })

        return res.json( formatPaginatedResponse({data: users, totalDocuments: total, limit, offset}))

      } catch (error) {
        return res.status(500).json({ error: `// ${error.message}` });
      }
    }

    // 3. CREAR UN USUARIO
    static async create(req, res) {
      try {
          const { name, email, password, role } = req.body;

          if (!name || !email || !password) {
            return res.status(400).json({ error: "// Nombre, email y password son obligatorios" });
          }

          const newUser = await UserService.create({ 
            name, 
            email, 
            password, 
            role: role || 'user' 
          });

          return res.status(201).json({
            message: "Usuario creado exitosamente por el administrador",
            data: newUser
          });
      } catch (error) {
          // PERFECTO: Muestra el error de duplicados (ej: El usuario o el email ya están...)
          return res.status(400).json({ error: `// ${error.message}` });
      }
    }

    // 2. OBTENER UN USUARIO POR ID
    static async getById(req, res) {
      try {
        const { id } = req.params;
        const user = await UserService.getById(id);
        
        if (!user) return res.status(404).json({ error: "// Usuario no encontrado" });
        
        return res.json(user);
      } catch (error) {
        return res.status(500).json({ error: `// ${error.message}` });
      }
    }

    // 4. ACTUALIZAR
    static async update(req, res) {
      try {
        const { id } = req.params;
        
        // SEGURIDAD: Solo permitimos editar estos campos
        const { name, email, role } = req.body;
        const updateData = { name, email, role };

        const updatedUser = await UserService.update(id, updateData);

        if (!updatedUser) return res.status(404).json({ error: "// Usuario no encontrado" });

        return res.json({ message: "Actualizado correctamente", data: updatedUser });
      } catch (error) {
        return res.status(400).json({ error: `// ${error.message}` });
      }
    }

    // 5. BORRAR
    static async delete(req, res) {
      try {
        const { id } = req.params;
        const deletedUser = await UserService.delete(id);

        if (!deletedUser) return res.status(404).json({ error: "// Usuario no encontrado" });

        return res.json({message: `Usuario ${deletedUser.email} eliminado permanentemente`});
      } catch (error) {
        return res.status(500).json({ error: `// ${error.message}` });
      }
    }

    
  };