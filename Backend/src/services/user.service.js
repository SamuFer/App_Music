import mongoose from 'mongoose'
import { User } from '../models/user.model.js'
// 💡 Ya no hace falta importar DEFAULTS aquí
import {AppError} from '../utils/customError.js'


export const UserService = class {
  // 1. VISTA PÚBLICA (Seguridad Máxima) | CLIENT METHODS
  static async getAll({ name, limit, offset } = {}) {
    try {
      // 🟢 OBLIGATORIO: Solo traemos usuarios que estén activos
      const filter = { isActive: true };
      if (name) filter.name = { $regex: name, $options: "i" };

      const [users, total] = await Promise.all([
        User.find(filter)
          .select("name")
          .skip(offset)
          .limit(limit),
        User.countDocuments(filter),
      ]);

      return { users, total };

    } catch (error) {
      throw new AppError(`Error en el servidor al obtener la lista pública de usuarios: ${error.message}`, 500)
    }
  }

  // 2. VISTA ADMIN (Acceso Total) | ADMIN METHODS
  static async getAllAdmin({ name, limit, offset, isActive } = {}) {
    try {
      const filter = {};
      if (name) filter.name = { $regex: name, $options: "i" };
      // Opcional: El admin puede filtrar opcionalmente por activos/inactivos
      if (isActive !== undefined) filter.isActive = isActive;

      const [users, total] = await Promise.all([
        User.find(filter)
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit),
        User.countDocuments(filter),
      ]);

      return { users, total };

    } catch (error) {
      throw new AppError(`Error en el servidor al obtener la lista de usuarios para el administrador: ${error.message}`, 500)
    }
  }

  // CREAR USUARIO
  static async create(input) {
    try {
      // Creamos la instancia con los datos del input
      const user = new User(input)

      // .save() activará las validaciones de tu Schema (required, enum, etc.)
      return await user.save()

    } catch (error) {
      // Si el error es código 11000, es por duplicado (Llave única: email o username)
      if (error.code === 11000) {
        throw new AppError("El nombre de usuario o el correo electrónico ya están registrados en el sistema.", 409)
      }
      throw new AppError(`Error en la base de datos al crear el usuario: ${error.message}`, 500)
    }
  }

  // Obtener por ID
  static async getById(id) {
    // 💡 NOTA: Quitamos el "isValidObjectId" manual porque el middleware lo interceptará antes
    try {
      return await User.findById(id);
    } catch (error) {
      // MEJORADO: Cambiamos el console.error por un throw estructurado como tus otros métodos
      throw new AppError(`Error en el servidor al buscar el usuario por ID: ${error.message}`, 500)
    }
  }

  // 2.ACTUALIZAR USUARIO
  static async update(id, data) {
    try {
      // Si el Admin intenta actualizar un email/username a uno que ya existe, saltará el error 11000
      return await User.findByIdAndUpdate(id, data, {
        returnDocument: 'after', // 🟢 Reemplazado { new: true } y Devuelve el documento actualizado
        runValidators: true, // Asegura que se apliquen las validaciones del schema en la actualización
      })
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError("No se puede actualizar: El nombre de usuario o el correo ya están en uso.", 409)
      }
      throw new AppError(`Error al actualizar el usuario: ${error.message}`, 500)
    }
  }

  // 🟢 3. DESACTIVAR USUARIO (SOFT DELETE)
  // Cambiamos findByIdAndDelete por findByIdAndUpdate para mantener la integridad del ranking
  static async delete(id) {
    try {
      return await User.findByIdAndUpdate(
        id, 
        { isActive: false, deletedAt: new Date() }, 
        { returnDocument: 'after' } // 🟢 Reemplazado { new: true }
      );
    } catch (error) {
      throw new AppError(`Error en el servidor al intentar desactivar la cuenta del usuario: ${error.message}`, 500)
    }
  }

  // 🟢 RESTAURAR USUARIO (Opcional, útil para el Panel Admin)
  static async restore(id) {
    try {
      return await User.findByIdAndUpdate(
        id, 
        { isActive: true, deletedAt: null }, 
        { returnDocument: 'after' } // 🟢 Reemplazado { new: true }
      );
    } catch (error) {
      throw new AppError(`Error al reactivar la cuenta del usuario: ${error.message}`, 500)
    }
  }

  // Obtener por Email incluyendo password (Exclusivo para proceso de Autenticación)
  static async getByEmailWithPassword(email) {
    try {
      // Usamos .select('+password') por si acaso lo tienes configurado como oculto en tu Schema
      return await User.findOne({ email }).select('+password');
    } catch (error) {
      throw new AppError(`Error en el servidor al buscar el usuario por email: ${error.message}`, 500);
    }
  }
  
// este bloque es para unificar el getAll y getAllAdmin, pero lo dejo comentado porque no es obligatorio y a veces es más claro tener métodos separados en el servicio para cada caso, aunque compartan lógica:
  //   static async getUsers({ name, limit, offset, isAdmin = false } = {}) {
  //   // El filtro es el mismo para ambos
    //   const filter = name ? { name: { $regex: name, $options: "i" } } : {};

    //   const cleanLimit = Number(limit) || DEFAULTS.LIMIT_PAGINATION;
    //   const cleanOffset = Number(offset) || DEFAULTS.LIMIT_OFFSET;

    //   // Preparamos la consulta
    //   let query = User.find(filter).limit(cleanLimit).skip(cleanOffset);

    //   // Aplicamos lógica diferente según el rol
    //   if (isAdmin) {
    //     query = query.sort({ createdAt: -1 }); // El admin ve los nuevos primero
    //   } else {
    //     query = query.select("name"); // El cliente solo ve el nombre
    //   }

    //   const [users, total] = await Promise.all([
    //     query,
    //     User.countDocuments(filter),
    //   ]);

    //   return { users, total };
    // }//   static async getUsers({ name, limit, offset, isAdmin = false } = {}) {
    //   // El filtro es el mismo para ambos
    //   const filter = name ? { name: { $regex: name, $options: "i" } } : {};

    //   const cleanLimit = Number(limit) || DEFAULTS.LIMIT_PAGINATION;
    //   const cleanOffset = Number(offset) || DEFAULTS.LIMIT_OFFSET;

    //   // Preparamos la consulta
    //   let query = User.find(filter).limit(cleanLimit).skip(cleanOffset);

    //   // Aplicamos lógica diferente según el rol
    //   if (isAdmin) {
    //     query = query.sort({ createdAt: -1 }); // El admin ve los nuevos primero
    //   } else {
    //     query = query.select("name"); // El cliente solo ve el nombre
    //   }

    //   const [users, total] = await Promise.all([
    //     query,
    //     User.countDocuments(filter),
    //   ]);

    //   return { users, total };
    // }

    // En tus controladores simplemente llamarías:
    // UserService.getUsers({ ...params, isAdmin: true })
    // UserService.getUsers({ ...params, isAdmin: false })
};

