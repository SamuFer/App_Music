import { User } from './user.schema.js'
import { DEFAULTS } from '../config/server.js'


export const UserModel = class {
  // 1. VISTA PÚBLICA (Seguridad Máxima) | CLIENT METHODS
  static async getAll({ name, limit = DEFAULTS.LIMIT_PAGINATION, offset = DEFAULTS.LIMIT_OFFSET } = {}) {
    
    const filter = name 
      ? { name: { $regex: name, $options: 'i' } } // Búsqueda parcial e insensible a mayúsculas
      : {};

    // Aquí el .select('name') es OBLIGATORIO y no negociable para proteger la privacidad de los usuarios
    const [users, total] = await Promise.all([
      User.find(filter) 
          .select('name') 
          .limit(Number(limit))
          .skip(Number(offset)),
      User.countDocuments(filter)
    ]);

    return { users, total };
  }
   
  // 2. VISTA ADMIN (Acceso Total) | ADMIN METHODS
  static async getAllAdmin({ name, limit, offset } = {}) {
    const filter = name ? { name: { $regex: name, $options: 'i' } } : {};
    
    // Aquí traemos todo, incluyendo email y role
    const [users, total] = await Promise.all([
      User.find(filter).limit(Number(limit)).skip(Number(offset)).sort({ createdAt: -1 }),
      User.countDocuments(filter)
    ]);
    return { users, total };
  }

  // CREAR USUARIO
  static async create(input) {
    try {
      // Creamos la instancia con los datos del input
      const user = new User(input);
      
      // .save() activará las validaciones de tu Schema (required, enum, etc.)
      return await user.save();
    } catch (error) {
      // Si el error es código 11000, es porque el email o username ya existen
      if (error.code === 11000) {
        throw new Error('El usuario o el email ya están registrados');
      }
      throw new Error(`Error en la base de datos: ${error.message}`);
    }
  }

  // Obtener por ID
  static async getById(id) {
    try {
      return await User.findById(id);
    } catch (error) {
      return null; // Si el ID no tiene formato válido de MongoDB
    }
  }

  // 2.ACTUALIZAR USUARIO
  static async update(id, data) {
    try {
      // runValidators: true asegura que si cambias el rol, siga siendo 'admin' o 'user'
      return await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    } catch (error) {
      if (error.code === 11000) throw new Error('El email ya está en uso por otro usuario');
      throw new Error(`Error al actualizar: ${error.message}`);
    }
  }

  // 3. BORRAR USUARIO
  static async delete(id) {
    try {
      return await User.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error al borrar: ${error.message}`);
    }
  }
  
}

