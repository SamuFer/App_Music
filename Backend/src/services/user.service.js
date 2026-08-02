import mongoose from 'mongoose'
import { User } from '../models/user.model.js'
// 💡 Ya no hace falta importar DEFAULTS aquí
import {AppError} from '../utils/customError.js'


export const UserService = class {
  // 1. VISTA PÚBLICA (Seguridad Máxima) | CLIENT METHODS
  static async getAll({ name, limit, offset } = {}) {
    try {
      const filter = name
        ? { name: { $regex: name, $options: "i" } }
        : {}

      // El Controller ya nos garantiza que 'limit' y 'offset' son números limpios
      const [users, total] = await Promise.all([
        User.find(filter)
          .select("name")
          .skip(offset)  // 🟢 Limpio, directo a MongoDB
          .limit(limit), // 🟢 Limpio, directo a MongoDB
        User.countDocuments(filter),
      ]);

      return { users, total };

    } catch (error) {
      throw new AppError(`Error en el servidor al obtener la lista pública de usuarios: ${error.message}`, 500)
    }
  }

  // 2. VISTA ADMIN (Acceso Total) | ADMIN METHODS
  static async getAllAdmin({ name, limit, offset } = {}) {
    try {
      const filter = name ? { name: { $regex: name, $options: "i" } } : {}

      // Aquí traemos todo, incluyendo email y role
      const [users, total] = await Promise.all([
        User.find(filter)
          .sort({ createdAt: -1 }) // 👈 Ordenamos primero
          .skip(offset)            // 👈 Paginación limpia
          .limit(limit),           // 👈 Paginación limpia
        User.countDocuments(filter),
      ]);

      return { users, total }

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
        new: true, // Devuelve el documento actualizado
        runValidators: true, // Asegura que se apliquen las validaciones del schema en la actualización
      })
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError("No se puede actualizar: El nombre de usuario o el correo ya están en uso.", 409)
      }
      throw new AppError(`Error al actualizar el usuario: ${error.message}`, 500)
    }
  }

  // 3. BORRAR USUARIO
  static async delete(id) {
    try {
      return await User.findByIdAndDelete(id);
    } catch (error) {
      throw new AppError(`Error en el servidor al intentar eliminar el usuario: ${error.message}`, 500)
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

