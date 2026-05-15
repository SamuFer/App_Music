/**
 * Helper para limpiar el objeto JSON de salida de Mongoose
 * @param {Array<string>} fieldsToDelete - Campos extra que quieres borrar (ej: ['password'])
 */
export const normalizeJson = (fieldsToDelete = []) => {
  return {
    transform: (doc, ret) => {
      // 1. Crear el ID legible para el frontend
      ret.id = ret._id.toString()
      
      // 2. Borrar los residuos por defecto de MongoDB
      delete ret._id
      delete ret.__v
      
      // 3. Borrar los campos extra si se especificaron
      fieldsToDelete.forEach(field => delete ret[field])
      
      return ret;
    }
  };
};
