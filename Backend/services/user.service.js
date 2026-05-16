import mongoose from 'mongoose'
import { User } from '../models/user.model.js'
import { DEFAULTS } from '../config/server.js'


export const UserService = class {
  // 1. VISTA PÚBLICA (Seguridad Máxima) | CLIENT METHODS
  static async getAll({
    name,
    limit = DEFAULTS.LIMIT_PAGINATION,
    offset = DEFAULTS.LIMIT_OFFSET,
  } = {}) {
    // NUEVO: Agregamos try/catch para proteger la consulta paralela de Mongoose
    try {
      const filter = name
        ? { name: { $regex: name, $options: "i" } } // Búsqueda parcial e insensible a mayúsculas
        : {};

      // Aquí el .select('name') es OBLIGATORIO y no negociable para proteger la privacidad de los usuarios
      const [users, total] = await Promise.all([
        User.find(filter)
          .select("name")
          .limit(Number(limit))
          .skip(Number(offset)),
        User.countDocuments(filter),
      ]);

      return { users, total };

    } catch (error) {
        throw new Error(`Error en el servidor al obtener la lista pública de usuarios: ${error.message}`);
    }
  }

  // 2. VISTA ADMIN (Acceso Total) | ADMIN METHODS
  static async getAllAdmin({ name, limit, offset } = {}) {
    // NUEVO: Agregamos try/catch para proteger la consulta pesada del administrador
    try {
      const filter = name ? { name: { $regex: name, $options: "i" } } : {};

      // Aquí traemos todo, incluyendo email y role
      const [users, total] = await Promise.all([
        User.find(filter)
          .limit(Number(limit))
          .skip(Number(offset))
          .sort({ createdAt: -1 }),
        User.countDocuments(filter),
      ]);

      return { users, total };

    } catch (error) {
      throw new Error(`Error en el servidor al obtener la lista de usuarios para el administrador: ${error.message}`);
    }
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
        throw new Error("El usuario o el email ya están registrados");
      }
      throw new Error(`Error en la base de datos al crear el usuario: ${error.message}`);
    }
  }

  // Obtener por ID
  static async getById(id) {
    // Validación rápida: no consume recursos de DB ni lanza excepciones
    if (!mongoose.isValidObjectId(id)) return null;

    try {
      return await User.findById(id);
    } catch (error) {
      // MEJORADO: Cambiamos el console.error por un throw estructurado como tus otros métodos
      throw new Error(`Error en el servidor al buscar el usuario por ID: ${error.message}`);
    }
  }

  // 2.ACTUALIZAR USUARIO
  static async update(id, data) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      return await User.findByIdAndUpdate(id, data, {
        new: true, // Devuelve el documento actualizado
        runValidators: true, // Asegura que se apliquen las validaciones del schema en la actualización
      });
    } catch (error) {
      throw new Error(`Error al actualizar el usuario: ${error.message}`);
    }
  }

  // 3. BORRAR USUARIO
  static async delete(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    // NUEVO: Agregamos try/catch para proteger la eliminación física en la base de datos
    try {
      return await User.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error en el servidor al intentar eliminar el usuario: ${error.message}`);
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

